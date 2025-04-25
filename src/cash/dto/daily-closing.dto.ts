import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyClosingDto {
  @ApiProperty({ description: 'Actual cash amount in the register' })
  @IsNumber()
  @Min(0)
  actualCash: number;

  @ApiProperty({ description: 'Optional notes for the closing' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class DailyClosingResponseDto {
  @ApiProperty({ description: 'Daily closing ID' })
  id: number;

  @ApiProperty({ description: 'Cash register ID' })
  cashRegisterId: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Closing date' })
  closingDate: Date;

  @ApiProperty({ description: 'Expected cash from transactions' })
  expectedCash: number;

  @ApiProperty({ description: 'Actual cash entered' })
  actualCash: number;

  @ApiProperty({ description: 'Discrepancy (actual - expected)' })
  discrepancy: number;

  @ApiProperty({ description: 'Optional notes' })
  notes?: string;
}
