import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Password (minimum 6 characters)' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password (minimum 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User role (e.g., cashier, admin)' })
  @IsString()
  role: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Username for login' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password for login' })
  @IsString()
  password: string;
}
