import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Customer full name',
  })
  @IsNotEmpty({ message: 'Customer name is required' })
  @IsString({ message: 'Customer name must be a string' })
  customerName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer email address',
  })
  @IsNotEmpty({ message: 'Customer email is required' })
  @IsEmail({}, { message: 'Customer email must be a valid email address' })
  customerEmail: string;

  @ApiProperty({
    example: '123 Tech Street, Suite 400, Silicon Valley, CA 94016',
    description: 'Shipping address for order delivery',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Shipping address must be a string' })
  shippingAddress?: string;

  @ApiProperty({
    example: 'Please ring the doorbell upon arrival.',
    description: 'Special delivery notes or instructions',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'List of product items and quantities for the order',
    minItems: 1,
  })
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
