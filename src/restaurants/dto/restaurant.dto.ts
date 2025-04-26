import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class RestaurantResponseDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}
