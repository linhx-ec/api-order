import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CartLine } from './cart-line.entity';

@Schema()
export class Cart {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  lines: CartLine[];

  get id() {
    return (this as any)._id.toString();
  }
}

export type CartDocument = Cart & Document;

export const CartSchema = SchemaFactory.createForClass(Cart);
