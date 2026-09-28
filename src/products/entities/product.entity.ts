import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductCategory {
  ELECTRONICS = 'Electronics',
  CLOTHING = 'Clothing',
  HOME = 'Home & Kitchen',
  BOOKS = 'Books',
  BEAUTY = 'Beauty & Personal Care',
  SPORTS = 'Sports & Outdoors',
  OTHER = 'Other',
}

@Entity('products')
export class Product {
  @ApiProperty({
    example: 'd9b2d63d-a233-4123-847e-ef8510a9f110',
    description: 'Unique product identifier (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Wireless Noise-Canceling Headphones',
    description: 'Name of the product',
  })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({
    example: 'High-fidelity audio with active noise cancellation and 30h battery life.',
    description: 'Detailed description of the product',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: 199.99,
    description: 'Product price in USD',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: 45,
    description: 'Quantity currently in inventory stock',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @ApiProperty({
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
    description: 'Product category classification',
    default: ProductCategory.OTHER,
  })
  @Column({
    type: 'varchar',
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  @ApiProperty({
    example: 'ELEC-WNC-001',
    description: 'Stock Keeping Unit (SKU)',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the product is currently active and available for sale',
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2026-09-28T12:00:00.000Z',
    description: 'Timestamp when the product was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-09-28T12:00:00.000Z',
    description: 'Timestamp when the product was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
