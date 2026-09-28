import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.seedInitialProducts();
  }

  /**
   * Seed demo inventory if database is empty on start
   */
  private async seedInitialProducts() {
    const count = await this.productRepository.count();
    if (count === 0) {
      this.logger.log('Seeding initial demo products into SQLite database...');
      const demoProducts: Partial<Product>[] = [
        {
          name: 'Pro Wireless Noise-Canceling Headphones',
          description: 'Premium over-ear headphones with 40mm drivers and active noise cancellation.',
          price: 249.99,
          stockQuantity: 35,
          category: ProductCategory.ELECTRONICS,
          sku: 'ELEC-HDPH-001',
          isActive: true,
        },
        {
          name: 'Mechanical Gaming Keyboard RGB',
          description: 'Tactile mechanical switches with customizable per-key RGB backlighting.',
          price: 119.50,
          stockQuantity: 60,
          category: ProductCategory.ELECTRONICS,
          sku: 'ELEC-KEYB-002',
          isActive: true,
        },
        {
          name: 'Organic Cotton Crewneck T-Shirt',
          description: '100% certified organic cotton everyday essential crewneck tee.',
          price: 29.00,
          stockQuantity: 120,
          category: ProductCategory.CLOTHING,
          sku: 'CLOTH-TSH-003',
          isActive: true,
        },
        {
          name: 'Stainless Steel Insulated Water Bottle',
          description: '750ml vacuum insulated water bottle keeping drinks cold for 24 hours.',
          price: 34.99,
          stockQuantity: 85,
          category: ProductCategory.HOME,
          sku: 'HOME-BOTT-004',
          isActive: true,
        },
        {
          name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          description: 'Essential software engineering handbook by Robert C. Martin.',
          price: 42.00,
          stockQuantity: 20,
          category: ProductCategory.BOOKS,
          sku: 'BOOK-CC-005',
          isActive: true,
        },
        {
          name: 'Ultra-Hydrating Botanical Facial Serum',
          description: 'Enriched with hyaluronic acid and natural vitamin C botanicals.',
          price: 54.00,
          stockQuantity: 0, // Out of stock example
          category: ProductCategory.BEAUTY,
          sku: 'BEAU-SERM-006',
          isActive: true,
        },
      ];

      await this.productRepository.save(demoProducts);
      this.logger.log('Demo products successfully seeded.');
    }
  }

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (createProductDto.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });
      if (existing) {
        throw new ConflictException(`Product with SKU "${createProductDto.sku}" already exists`);
      }
    }

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * Find all products with search, filtering, sorting, and pagination
   */
  async findAll(queryDto: QueryProductDto): Promise<{
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStockOnly,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStockOnly) {
      queryBuilder.andWhere('product.stockQuantity > 0');
    }

    // Sorting
    const safeSortBy = ['name', 'price', 'stockQuantity', 'createdAt'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`product.${safeSortBy}`, safeOrder);

    // Pagination
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
   * Find a single product by UUID
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" was not found`);
    }
    return product;
  }

  /**
   * Update an existing product
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Product with SKU "${updateProductDto.sku}" is already assigned to another product`,
        );
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * Delete a product
   */
  async remove(id: string): Promise<{ success: boolean; message: string; id: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return {
      success: true,
      message: `Product "${product.name}" (${id}) successfully removed`,
      id,
    };
  }

  /**
   * Get analytics & inventory summary statistics
   */
  async getStatistics(): Promise<{
    totalProducts: number;
    totalStockUnits: number;
    totalInventoryValue: number;
    outOfStockCount: number;
    categories: { category: string; count: number }[];
  }> {
    const products = await this.productRepository.find();

    const totalProducts = products.length;
    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let outOfStockCount = 0;
    const categoryCountMap: Record<string, number> = {};

    for (const p of products) {
      totalStockUnits += p.stockQuantity;
      totalInventoryValue += Number(p.price) * p.stockQuantity;
      if (p.stockQuantity === 0) {
        outOfStockCount++;
      }
      categoryCountMap[p.category] = (categoryCountMap[p.category] || 0) + 1;
    }

    const categories = Object.entries(categoryCountMap).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      totalProducts,
      totalStockUnits,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      outOfStockCount,
      categories,
    };
  }
}
