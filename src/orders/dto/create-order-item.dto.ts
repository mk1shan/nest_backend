import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'd9b2d63d-a233-4123-847e-ef8510a9f110',
    description: 'UUID of the product to order',
  })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsUUID('all', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity to purchase (must be at least 1)',
    minimum: 1,
    default: 1,
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}
