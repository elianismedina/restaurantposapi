import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique stock-keeping unit (SKU)' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Available stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Product name (optional)', required: false })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Unique SKU (optional)', required: false })
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Price (optional)', required: false })
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Stock quantity (optional)', required: false })
  @IsNumber()
  @Min(0)
  stock?: number;
}
