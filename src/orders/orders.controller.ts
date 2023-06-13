import { Subscribe } from '@linhx/nest-kafka';
import { Controller } from '@nestjs/common';
import { payment as PAYMENT_TYPES } from '@linhx-ec/shared-types';
import { PaymentPaidEvent } from '@linhx-ec/shared-types/payment/events-payload';
import { MsgBody } from '@linhx/nest-kafka/lib/decorators/kafka.decorator';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // TODO avoid array payload
  @Subscribe(PAYMENT_TYPES.eventsName.PAYMENT_PAID)
  async onPaymentPaid(@MsgBody [payload]: PaymentPaidEvent[]) {
    console.log('payload', payload);
    await this.ordersService.completeOrder({
      id: payload.orderId,
      status: payload.status,
      paymentId: payload.id,
    });
  }
}
