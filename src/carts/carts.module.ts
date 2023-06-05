import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { CartRepositoryProvider } from './cart.repository.impl';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './entities/cart.entity';
import { OrdersModule } from '../orders/orders.module';
import { OutboxModule } from '../outbox/outbox.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    OrdersModule,
    OutboxModule,
  ],
  controllers: [CartsController],
  providers: [CartRepositoryProvider, CartsService],
})
export class CartsModule {}
