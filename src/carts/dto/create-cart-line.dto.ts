import { ApiProperty } from '@nestjs/swagger';
import { CartLine } from '../entities/cart-line.entity';

export class CreateCartLineDto {
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
    type: Number,
    description: 'Quantity',
  })
  quantity: number;

  public toEntity() {
    const entity = new CartLine();
    entity.productId = this.productId;
    entity.variantId = this.variantId;
    entity.quantity = this.quantity;
    return entity;
  }
}
