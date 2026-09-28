import { IsOptional, IsString, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { ProductCategory } from '../entities/product.entity';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  PRICE = 'price',
  STOCK = 'stockQuantity',
}

export class QueryProductDto {
  @ApiPropertyOptional({
    description: 'Search term for name or description or SKU',
    example: 'keyboard',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductCategory,
    description: 'Filter by category',
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    description: 'Filter products with price greater than or equal to',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter products with price less than or equal to',
    example: 300,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Only return products currently in stock (stockQuantity > 0)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}
