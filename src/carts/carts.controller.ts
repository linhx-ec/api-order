import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartDto } from './dto/add-cart-line.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderDto } from '../orders/dto/order.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  update(@Body() addCartLineDto: AddCartDto) {
    const userId = 'userid'; // TODO auth
    return this.cartsService.addItems(userId, addCartLineDto);
  }

  @Get()
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.cartsService.findByUserId(userId);
  }

  @Post('checkout')
  async checkout(@Body() checkoutDto: CheckoutDto) {
    const userId = 'userid'; // TODO auth
    const order = await this.cartsService.checkout(userId, checkoutDto);
    const orderDto = OrderDto.fromEntity(order);
    return orderDto;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartsService.remove(+id);
  }
}
