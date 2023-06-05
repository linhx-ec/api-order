import { Repository } from '@linhx/nest-repo';
import { Order } from './entities/order.entity';

export interface OrderRepository extends Repository<Order, string> {
  findByUserId(userId: string): Promise<Order | undefined>;
}

export const OrderRepositoryProviderName = 'OrderRepository';
