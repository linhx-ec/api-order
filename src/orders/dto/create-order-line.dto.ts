import { ApiProperty } from '@nestjs/swagger';
import { OrderLine } from '../entities/order-line.entity';
import { Min } from 'class-validator';

export class CreateOrderLineDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
  })
  productId: string;

  @ApiProperty({
    type: String,
    description: 'Variant ID',
  })
  variantId: string;

  @ApiProperty({
    type: String,
    description: 'Quantity',
  })
  @Min(1)
  quantity: number;

  @ApiProperty({
    type: String,
    description: 'Unit price',
  })
  @Min(0)
  unitPrice: number;

  toEntity() {
    const entity = new OrderLine();
    entity.productId = this.productId;
    entity.variantId = this.variantId;
    entity.quantity = this.quantity;
    entity.unitPrice = this.unitPrice;
    entity.totalPrice = this.unitPrice * this.quantity;
    return entity;
  }
}
