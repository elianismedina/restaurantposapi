import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCashRegisterDto {
  @ApiProperty({
    description: 'Initial balance for the cash register',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  initialBalance?: number = 0;
}

export class CashRegisterResponseDto {
  @ApiProperty({ description: 'Cash register ID' })
  id: number;

  @ApiProperty({ description: 'User ID who owns this register' })
  userId: number;

  @ApiProperty({ description: 'Current balance' })
  balance: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
