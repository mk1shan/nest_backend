import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedInitialOrders();
  }

  /**
   * Seed demo order if database is empty on start
   */
  private async seedInitialOrders() {
    const count = await this.orderRepository.count();
    if (count === 0) {
      const products = await this.productRepository.find();
      if (products.length >= 2) {
        this.logger.log('Seeding initial demo orders...');
        const p1 = products[0];
        const p2 = products[1];

        const demoOrder = this.orderRepository.create({
          orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
          customerName: 'Alex Morgan',
          customerEmail: 'alex.morgan@example.com',
          shippingAddress: '456 Innovation Blvd, Austin, TX 78701',
          status: OrderStatus.COMPLETED,
          notes: 'Priority express delivery',
          totalAmount: Number(p1.price) * 1 + Number(p2.price) * 2,
          items: [
            this.orderItemRepository.create({
              productId: p1.id,
              productName: p1.name,
              unitPrice: Number(p1.price),
              quantity: 1,
              subtotal: Number(p1.price) * 1,
            }),
            this.orderItemRepository.create({
              productId: p2.id,
              productName: p2.name,
              unitPrice: Number(p2.price),
              quantity: 2,
              subtotal: Number(p2.price) * 2,
            }),
          ],
        });

        await this.orderRepository.save(demoOrder);
        this.logger.log('Demo order seeded successfully.');
      }
    }
  }

  /**
   * Create an order with transactional stock deduction
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerName, customerEmail, shippingAddress, notes, items } = createOrderDto;

    return await this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID "${itemDto.productId}" was not found`);
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.name}" (${product.id}) is currently inactive and cannot be ordered`,
          );
        }

        if (product.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". In stock: ${product.stockQuantity}, Requested: ${itemDto.quantity}`,
          );
        }

        // Deduct inventory stock
        product.stockQuantity -= itemDto.quantity;
        await manager.save(Product, product);

        const unitPrice = Number(product.price);
        const subtotal = Math.round(unitPrice * itemDto.quantity * 100) / 100;
        totalAmount += subtotal;

        const orderItem = manager.create(OrderItem, {
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: itemDto.quantity,
          subtotal,
        });

        orderItems.push(orderItem);
      }

      totalAmount = Math.round(totalAmount * 100) / 100;

      // Generate unique order number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

      const order = manager.create(Order, {
        orderNumber,
        customerName,
        customerEmail,
        shippingAddress,
        notes,
        status: OrderStatus.PENDING,
        totalAmount,
        items: orderItems,
      });

      const savedOrder = await manager.save(Order, order);
      return savedOrder;
    });
  }

  /**
   * Retrieve orders with pagination, search, status filtering, and date range
   */
  async findAll(queryDto: QueryOrderDto): Promise<{
    items: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(order.customerName) LIKE LOWER(:search) OR LOWER(order.customerEmail) LIKE LOWER(:search) OR LOWER(order.orderNumber) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const safeSortBy = ['createdAt', 'totalAmount', 'status', 'customerName'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`order.${safeSortBy}`, safeOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find a single order by ID or orderNumber
   */
  async findOne(id: string): Promise<Order> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const order = await this.orderRepository.findOne({
      where: isUuid ? { id } : { orderNumber: id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order "${id}" was not found`);
    }

    return order;
  }

  /**
   * Update order status with automated stock restock upon cancellation
   */
  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['items'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" was not found`);
      }

      const previousStatus = order.status;
      const targetStatus = updateStatusDto.status;

      if (previousStatus === targetStatus) {
        return order;
      }

      // Restock inventory if cancelling an active order
      const isCancelling =
        (targetStatus === OrderStatus.CANCELLED || targetStatus === OrderStatus.REFUNDED) &&
        previousStatus !== OrderStatus.CANCELLED &&
        previousStatus !== OrderStatus.REFUNDED;

      if (isCancelling) {
        for (const item of order.items) {
          if (item.productId) {
            const product = await manager.findOne(Product, {
              where: { id: item.productId },
            });
            if (product) {
              product.stockQuantity += item.quantity;
              await manager.save(Product, product);
            }
          }
        }
      }

      // If re-activating a previously cancelled order, re-deduct stock
      const isReactivating =
        (previousStatus === OrderStatus.CANCELLED || previousStatus === OrderStatus.REFUNDED) &&
        targetStatus !== OrderStatus.CANCELLED &&
        targetStatus !== OrderStatus.REFUNDED;

      if (isReactivating) {
        for (const item of order.items) {
          if (item.productId) {
            const product = await manager.findOne(Product, {
              where: { id: item.productId },
            });
            if (product) {
              if (product.stockQuantity < item.quantity) {
                throw new BadRequestException(
                  `Cannot reactivate order: insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Required: ${item.quantity}`,
                );
              }
              product.stockQuantity -= item.quantity;
              await manager.save(Product, product);
            }
          }
        }
      }

      order.status = targetStatus;
      return await manager.save(Order, order);
    });
  }

  /**
   * Cancel an order and restore inventory
   */
  async cancel(id: string, reason?: string): Promise<Order> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (reason) {
      order.notes = order.notes ? `${order.notes} | Cancellation Reason: ${reason}` : `Cancellation Reason: ${reason}`;
      await this.orderRepository.save(order);
    }

    return await this.updateStatus(order.id, { status: OrderStatus.CANCELLED });
  }

  /**
   * Comprehensive Analytics & Revenue Statistics
   */
  async getAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<OrderStatus, number>;
    topSellingProducts: {
      productId: string;
      productName: string;
      unitsSold: number;
      totalSales: number;
    }[];
    recentOrders: Order[];
  }> {
    const orders = await this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let nonCancelledOrdersCount = 0;

    const statusBreakdown: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.CANCELLED]: 0,
      [OrderStatus.REFUNDED]: 0,
    };

    const productSalesMap: Record<
      string,
      { productId: string; productName: string; unitsSold: number; totalSales: number }
    > = {};

    for (const order of orders) {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;

      if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REFUNDED) {
        totalRevenue += Number(order.totalAmount);
        nonCancelledOrdersCount++;

        for (const item of order.items) {
          const key = item.productId || item.productName;
          if (!productSalesMap[key]) {
            productSalesMap[key] = {
              productId: item.productId || '',
              productName: item.productName,
              unitsSold: 0,
              totalSales: 0,
            };
          }
          productSalesMap[key].unitsSold += item.quantity;
          productSalesMap[key].totalSales += Number(item.subtotal);
        }
      }
    }

    const averageOrderValue =
      nonCancelledOrdersCount > 0
        ? Math.round((totalRevenue / nonCancelledOrdersCount) * 100) / 100
        : 0;

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        totalSales: Math.round(p.totalSales * 100) / 100,
      }));

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue,
      statusBreakdown,
      topSellingProducts,
      recentOrders: orders.slice(0, 5),
    };
  }
}
