import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Checkout / Place a new order',
    description:
      'Creates a new customer order, validates stock availability, atomically deducts product stock, and generates order snapshots.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order placed successfully.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed or insufficient inventory stock.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'One or more requested product IDs do not exist.',
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve orders list',
    description:
      'Fetch orders with optional search, status filtering, date range filter, pagination, and sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of matching orders with pagination metadata.',
  })
  async findAll(@Query() queryDto: QueryOrderDto) {
    return await this.ordersService.findAll(queryDto);
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get orders & revenue analytics',
    description:
      'Returns aggregate business metrics including total revenue, order count, average order value, status breakdown, and top-selling products.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics summary and revenue metrics.',
  })
  async getAnalytics() {
    return await this.ordersService.getAnalytics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an order by UUID or Order Number',
    description: 'Fetches full order details including line items and snapshots.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID or Order Number (e.g. ORD-20260930-8472)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The requested order details.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  async findOne(@Param('id') id: string): Promise<Order> {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Transitions order status (PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED). Automatically manages stock restoration if cancelled.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status successfully updated.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return await this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel an order',
    description:
      'Cancels an existing order and automatically restores the ordered quantities back to product inventory stock.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID or Order Number',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Customer requested cancellation prior to dispatch',
        },
      },
    },
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order successfully cancelled and inventory restocked.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Order is already cancelled.',
  })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<Order> {
    return await this.ordersService.cancel(id, reason);
  }
}
