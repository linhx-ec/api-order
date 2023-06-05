import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';

export class CheckoutLineDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Product ID',
  })
  productId: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Variant ID',
  })
  variantId: string;

  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    description: 'Quantity',
  })
  quantity: number;

  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: 'unitPrice',
  })
  unitPrice: number;
}
