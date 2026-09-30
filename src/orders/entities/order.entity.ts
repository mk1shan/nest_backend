import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('orders')
export class Order {
  @ApiProperty({
    example: 'a7b8c9d0-1234-5678-90ab-cdef12345678',
    description: 'Unique order identifier (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'ORD-20260930-8472',
    description: 'Unique human-readable order number',
  })
  @Column({ type: 'varchar', length: 30, unique: true })
  orderNumber: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Customer full name',
  })
  @Column({ type: 'varchar', length: 100 })
  customerName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer email address',
  })
  @Column({ type: 'varchar', length: 150 })
  customerEmail: string;

  @ApiProperty({
    example: '123 Tech Street, Suite 400, Silicon Valley, CA 94016',
    description: 'Shipping address for fulfillment',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  shippingAddress?: string;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Current order status',
    default: OrderStatus.PENDING,
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    example: 369.49,
    description: 'Total order amount in USD',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({
    example: 'Please leave package at the front porch.',
    description: 'Additional notes or delivery instructions',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    type: () => [OrderItem],
    description: 'List of order items included in this order',
  })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ApiProperty({
    example: '2026-09-30T12:00:00.000Z',
    description: 'Timestamp when the order was placed',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-09-30T12:00:00.000Z',
    description: 'Timestamp when the order was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
