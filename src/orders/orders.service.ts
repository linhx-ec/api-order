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
    const order = this.orderRepo.create(dto.toEntity());
    return order;
  }
}
