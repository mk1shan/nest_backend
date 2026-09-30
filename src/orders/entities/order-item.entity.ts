import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({
    example: 'b1c2d3e4-5678-90ab-cdef-1234567890ab',
    description: 'Unique order item identifier (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    example: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
    description: 'Associated Order ID',
  })
  @Column()
  orderId: string;

  @ManyToOne(() => Product, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ApiProperty({
    example: 'd9b2d63d-a233-4123-847e-ef8510a9f110',
    description: 'ID of the product ordered',
  })
  @Column({ nullable: true })
  productId?: string;

  @ApiProperty({
    example: 'Wireless Noise-Canceling Headphones',
    description: 'Product name snapshot at the time of purchase',
  })
  @Column({ type: 'varchar', length: 150 })
  productName: string;

  @ApiProperty({
    example: 199.99,
    description: 'Unit price snapshot at the time of order',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the item ordered',
  })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({
    example: 399.98,
    description: 'Subtotal price for this line item (unitPrice * quantity)',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
