import { IsString, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsNumber()
  restaurantId: number;
}

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}

export class BranchResponseDto {
  id: number;
  name: string;
  address: string;
  phone?: string;
  restaurantId: number;
  createdAt: Date;
  updatedAt: Date;
}
