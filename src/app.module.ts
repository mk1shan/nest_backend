import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'inventory.sqlite',
      entities: [Product, Order, OrderItem],
      autoLoadEntities: true,
      synchronize: true, // Automatically synchronize database schema
      logging: false,
    }),
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}

