import { OrderLine } from '../entities/order-line.entity';

export class OrderLineDto {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;

  static fromEntity(line: OrderLine) {
    const dto = new OrderLineDto();
    dto.productId = line.productId;
    dto.variantId = line.variantId;
    dto.quantity = line.quantity;
    dto.unitPrice = line.unitPrice;
    dto.currency = line.currency;
    dto.totalPrice = line.totalPrice;
    return dto;
  }
}
