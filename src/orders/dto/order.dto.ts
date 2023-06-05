import { Order } from '../entities/order.entity';
import { OrderLineDto } from './order-line.dto';

export class OrderDto {
  id: string;
  userId: string;
  phone: string;
  email: string;
  shippingAddress: string;
  totalPrice: number;
  lines: OrderLineDto[];

  static fromEntity(order: Order) {
    const dto = new OrderDto();
    dto.id = order.id;
    dto.userId = order.userId;
    dto.phone = order.phone;
    dto.email = order.email;
    dto.shippingAddress = order.shippingAddress;
    dto.lines = order.lines.map(OrderLineDto.fromEntity);
    dto.totalPrice = order.totalPrice;
    return dto;
  }
}
