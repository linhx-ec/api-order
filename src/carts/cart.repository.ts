import { Repository } from '@linhx/nest-repo';
import { Cart } from './entities/cart.entity';

export interface CartRepository extends Repository<Cart, string> {
  findByUserId(userId: string): Promise<Cart | undefined>;
}

export const CartRepositoryProviderName = 'CartRepository';
