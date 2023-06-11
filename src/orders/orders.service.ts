import { Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderRepository,
  OrderRepositoryProviderName,
} from './order.repository';
import { Service, Transactional } from '@linhx/nest-repo';

@Service()
@Transactional()
export class OrdersService {
  constructor(
    @Inject(OrderRepositoryProviderName)
    private readonly orderRepo: OrderRepository,
  ) {}
  async createOrder(dto: CreateOrderDto) {
    // TODO get all products
    // TODO check if products do exists
    // TODO check if the price was not changed
    // TODO calculate the total price
    const newOrder = dto.toEntity();
    newOrder.totalPrice = newOrder.lines.reduce(
      (total, line) => total + line.totalPrice,
      0,
    );
    return await this.orderRepo.create(newOrder);
  }
}
