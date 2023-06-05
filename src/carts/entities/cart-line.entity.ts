import { Prop } from '@nestjs/mongoose';

export class CartLine {
  @Prop()
  productId: string;

  @Prop()
  variantId: string;

  @Prop()
  quantity: number;
}
