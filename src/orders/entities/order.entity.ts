import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderLine } from './order-line.entity';

@Schema()
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop()
  totalPrice: number;

  @Prop()
  currency: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  // @Prop()
  // shippingAddress: {
  //   city: string;
  //   province: string;
  //   district: string;
  //   street: string;
  // };

  @Prop()
  shippingAddress: string;

  @Prop({ required: true })
  lines: OrderLine[];

  @Prop({ required: true })
  paymentMethod: string;

  get id() {
    return (this as any)._id.toString();
  }
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
