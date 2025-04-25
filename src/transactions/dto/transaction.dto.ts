import { IsNumber, IsString, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Array of product IDs', type: [Number] })
  @IsNumber({}, { each: true })
  productIds: number[];

  @ApiProperty({
    description: 'Array of quantities for each product',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  quantities: number[];

  @ApiProperty({ description: 'Payment method (e.g., cash, card)' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    description: 'Cash amount tendered (required for cash payments)',
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amountTendered?: number;

  @ApiProperty({ description: 'Customer ID (optional)', required: false })
  @IsNumber()
  @IsOptional()
  customerId?: number;
}
