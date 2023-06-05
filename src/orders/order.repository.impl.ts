import {
  OrderRepository,
  OrderRepositoryProviderName,
} from './order.repository';
import { Order, OrderDocument } from './entities/order.entity';
import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DbMongo,
  MongoTransaction,
  RepositoryImpl,
} from '@linhx/nest-repo-mongodb';
import { DB_PROVIDER } from '@linhx/nest-repo';
import { TRANSACTION_STORE } from '../commons/transaction-store';

@Injectable()
export class OrderRepositoryImpl
  extends RepositoryImpl<Order, string>
  implements OrderRepository
{
  constructor(
    @Inject(DB_PROVIDER) private readonly db: DbMongo,
    @InjectModel(Order.name) private cardModel: Model<OrderDocument>,
  ) {
    super(db, cardModel, TRANSACTION_STORE);
  }
  findByUserId(userId: string): Promise<Order> {
    return this.cardModel
      .findOne({
        userId,
      })
      .session(TRANSACTION_STORE.getTransaction() as MongoTransaction)
      .exec();
  }
}

export const OrderRepositoryProvider: ClassProvider = {
  provide: OrderRepositoryProviderName,
  useClass: OrderRepositoryImpl,
};
