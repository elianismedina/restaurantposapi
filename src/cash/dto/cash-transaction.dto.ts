import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCashTransactionDto {
  @ApiProperty({ description: 'Transaction ID from the main transaction' })
  @IsNumber()
  transactionId: number;

  @ApiProperty({ description: 'Cash amount provided by the customer' })
  @IsNumber()
  @IsPositive()
  amountTendered: number;
}

export class CashTransactionResponseDto {
  @ApiProperty({ description: 'Cash transaction ID' })
  id: number;

  @ApiProperty({ description: 'Cash register ID' })
  cashRegisterId: number;

  @ApiProperty({ description: 'Transaction ID' })
  transactionId: number;

  @ApiProperty({ description: 'Amount tendered' })
  amountTendered: number;

  @ApiProperty({ description: 'Change given' })
  changeGiven: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}
