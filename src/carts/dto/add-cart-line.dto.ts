import { ApiProperty } from '@nestjs/swagger';
import { CreateCartLineDto } from './create-cart-line.dto';
import { Type } from 'class-transformer';

export class AddCartDto {
  @Type(() => CreateCartLineDto)
  @ApiProperty({
    type: [CreateCartLineDto],
    description: 'Cart lines',
  })
  lines: CreateCartLineDto[];
}
