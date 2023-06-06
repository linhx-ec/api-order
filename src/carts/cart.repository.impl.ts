import { CartRepository, CartRepositoryProviderName } from './cart.repository';
import { Cart, CartDocument } from './entities/cart.entity';
import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DbMongo,
  MongoTransaction,
  RepositoryImpl,
} from '@linhx/nest-repo-mongodb';
import { DB_PROVIDER, TRANSACTION_STORE } from '@linhx/nest-repo';

@Injectable()
export class CartRepositoryImpl
  extends RepositoryImpl<Cart, string>
  implements CartRepository
{
  constructor(
    @Inject(DB_PROVIDER) private readonly db: DbMongo,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {
    super(db, cartModel);
  }
  findByUserId(userId: string): Promise<Cart> {
    return this.cartModel
      .findOne({
        userId,
      })
      .session(TRANSACTION_STORE.getTransaction() as MongoTransaction)
      .exec();
  }
}

export const CartRepositoryProvider: ClassProvider = {
  provide: CartRepositoryProviderName,
  useClass: CartRepositoryImpl,
};
