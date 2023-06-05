import { ApiProperty } from '@nestjs/swagger';
import { CheckoutLineDto } from './checkout-line.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class CheckoutDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Shipping phone',
    example: '0982398123',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: 'Shipping email',
    example: 'email@domain.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Shipping address',
    example: 'Somewhere',
  })
  shippingAddress: string;

  @ValidateNested({ each: true })
  @Type(() => CheckoutLineDto)
  @ApiProperty({
    type: [CheckoutLineDto],
    description: 'Cart lines',
  })
  lines: CheckoutLineDto[];
}
