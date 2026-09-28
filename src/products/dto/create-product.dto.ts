import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    example: 'Ergonomic Mechanical Keyboard',
    description: 'The title/name of the product',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Hot-swappable RGB mechanical keyboard with custom switches and aluminum frame.',
    description: 'Detailed description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 129.99,
    description: 'Product price in USD (must be >= 0)',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 75,
    description: 'Stock quantity available in warehouse',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
    description: 'Category for the product',
    default: ProductCategory.OTHER,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    example: 'KB-MECH-RGB-001',
    description: 'Unique Stock Keeping Unit (SKU)',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether product is active for listing',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
