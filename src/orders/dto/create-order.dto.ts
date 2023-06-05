import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderLineDto } from './create-order-line.dto';
import { Order } from '../entities/order.entity';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  userId: string;
  @ApiProperty({
    type: String,
    description: 'Shipping phone',
    example: '0982398123',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: 'Shipping email',
    example: 'email@domain.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Shipping address',
    example: 'Somewhere',
  })
  shippingAddress: string;

  @Type(() => CreateOrderLineDto)
  @ApiProperty({
    type: [CreateOrderLineDto],
    description: 'Order lines',
  })
  lines: CreateOrderLineDto[];

  toEntity() {
    const entity = new Order();
    entity.userId = this.userId;
    entity.phone = this.phone;
    entity.email = this.email;
    entity.shippingAddress = this.shippingAddress;
    entity.lines = this.lines.map((line) => line.toEntity());
    entity.totalPrice = entity.lines.reduce(
      (total, line) => total + line.totalPrice,
      0,
    );
    return entity;
  }
}
