import { Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderRepository,
  OrderRepositoryProviderName,
} from './order.repository';
import { Service, Transactional } from '@linhx/nest-repo';
import { OUTBOX_PROVIDER, OutBoxService } from '../outbox/outbox.service';

@Service()
@Transactional()
export class OrdersService {
  constructor(
    @Inject(OrderRepositoryProviderName)
    private readonly orderRepo: OrderRepository,
    @Inject(OUTBOX_PROVIDER) private readonly outboxService: OutBoxService<any>,
  ) {}
  async createOrder(dto: CreateOrderDto) {
    // TODO get all products
    // TODO check if products do exists
    // TODO check if the price was not changed
    // TODO calculate the total price
    const newOrder = dto.toEntity();
    newOrder.status = 'pending'; // TODO define enum
    newOrder.totalPrice = newOrder.lines.reduce(
      (total, line) => total + line.totalPrice,
      0,
    );
    return await this.orderRepo.create(newOrder);
  }

  async completeOrder({
    id,
    status,
    paymentId,
  }: {
    id: string;
    status: any;
    paymentId?: any;
  }) {
    let order = await this.orderRepo.findById(id);
    if (!order) {
      throw new Error('order.complete.notfound'); // TODO define error
    }
    order.status = status;
    order.paymentId = paymentId;
    order = await this.orderRepo.save(order);

    await this.outboxService.save({
      topic: 'order.completed', // TODO define topic
      message: order, // TODO dont send all
    });

    return order;
  }
}
