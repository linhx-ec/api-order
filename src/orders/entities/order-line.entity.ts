import { Prop } from '@nestjs/mongoose';

export class OrderLine {
  @Prop()
  productId: string;

  @Prop()
  variantId: string;

  @Prop()
  quantity: number;

  @Prop()
  unitPrice: number;

  @Prop()
  totalPrice: number;

  @Prop()
  currency: string;
}
