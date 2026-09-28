import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'inventory.sqlite',
      entities: [Product],
      synchronize: true, // Automatically synchronize database schema (suitable for development)
      logging: false,
    }),
    ProductsModule,
  ],
})
export class AppModule {}
