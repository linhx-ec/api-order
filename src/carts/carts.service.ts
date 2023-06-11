import { Inject, NotImplementedException } from '@nestjs/common';
import { CartRepository, CartRepositoryProviderName } from './cart.repository';
import { AddCartDto } from './dto/add-cart-line.dto';
import { Cart } from './entities/cart.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateOrderLineDto } from '../orders/dto/create-order-line.dto';
import { index as findIndex } from '@linhx/utils';
import { CartLine } from './entities/cart-line.entity';
import { TOPIC_ORDER_CREATED } from '../constants/messages';
import { OUTBOX_PROVIDER, OutBoxService } from '../outbox/outbox.service';
import { Service, Transactional } from '@linhx/nest-repo';

@Service()
@Transactional()
export class CartsService {
  constructor(
    @Inject(CartRepositoryProviderName)
    private readonly cartRepo: CartRepository,
    private readonly orderService: OrdersService,
    @Inject(OUTBOX_PROVIDER) private readonly outboxService: OutBoxService<any>,
  ) {}

  async addItems(userId: string, dto: AddCartDto) {
    let cart = await this.cartRepo.findByUserId(userId);
    if (!cart) {
      cart = new Cart();
      cart.userId = userId;
      cart.lines = dto.lines.map((line) => line.toEntity());
      cart = await this.cartRepo.create(cart);
      return cart;
    }
    for (const lineDto of dto.lines) {
      let line = cart.lines.find(
        (line) =>
          line.productId === lineDto.productId &&
          line.variantId === lineDto.variantId,
      );
      if (!line) {
        line = lineDto.toEntity();
        cart.lines.push(line);
      } else {
        line.quantity += lineDto.quantity;
      }
      if (line.quantity < 0) {
        line.quantity = 0;
      }
    }
    await this.cartRepo.save(cart);
    return cart;
  }

  findAll() {
    throw new NotImplementedException();
  }

  findByUserId(userId: string) {
    return this.cartRepo.findByUserId(userId);
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const orderDto = new CreateOrderDto();
    orderDto.userId = userId;
    orderDto.email = dto.email;
    orderDto.phone = dto.phone;
    orderDto.shippingAddress = dto.shippingAddress;
    orderDto.lines = dto.lines.map((checkoutLine) =>
      CreateOrderLineDto.fromCheckoutLineDto(checkoutLine),
    );
    orderDto.paymentMethod = dto.paymentMethod;

    const order = await this.orderService.createOrder(orderDto);

    // update cart
    const cart = await this.findByUserId(userId);
    const newCartLines = cart.lines.reduce((newLines, line) => {
      const dtoIndex = findIndex(
        dto.lines,
        (dtoLine) =>
          dtoLine.productId === line.productId &&
          dtoLine.variantId === line.variantId,
      );
      if (dtoIndex >= 0) {
        const newQuantity = line.quantity - dto.lines[dtoIndex].quantity;
        if (newQuantity > 0) {
          line.quantity = newQuantity;
          newLines.push(line);
        }
      }
      return newLines;
    }, [] as CartLine[]);
    cart.lines = newCartLines;
    await this.cartRepo.update(cart);

    // save outbox
    await this.outboxService.save({
      topic: TOPIC_ORDER_CREATED,
      message: order,
    });

    return order;
  }
}
