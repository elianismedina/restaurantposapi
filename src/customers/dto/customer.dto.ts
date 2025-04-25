import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Customer email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Customer address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Customer preferences (e.g., favorite category)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}

export class UpdateCustomerDto {
  @ApiProperty({ description: 'Customer full name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Customer email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Customer address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Customer preferences', required: false })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}

export class CustomerResponseDto {
  @ApiProperty({ description: 'Customer ID' })
  id: number;

  @ApiProperty({ description: 'Customer full name' })
  name: string;

  @ApiProperty({ description: 'Customer email address' })
  email: string;

  @ApiProperty({ description: 'Customer phone number', nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Customer address', nullable: true })
  address?: string;

  @ApiProperty({ description: 'Customer preferences', nullable: true })
  preferences?: Record<string, any>;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;
}
