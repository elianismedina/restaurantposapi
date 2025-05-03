import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    return this.prisma.user.create({
      data: {
        username: userDto.username,
        email: userDto.email,
        password: hashedPassword,
        role: userDto.role,
        branch: userDto.branchId
          ? { connect: { id: userDto.branchId } }
          : undefined, // Use branch relation
      },
    });
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find the user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { branch: true }, // Include branch relation
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role, // Include role in payload
      branchId: user.branch?.id || null, // Include branchId in payload
    };

    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }

  async getUserWithBranch(userId: string) {
    const userIdNumber = parseInt(userId, 10); // Convert userId to a number

    if (isNaN(userIdNumber)) {
      throw new UnauthorizedException('Invalid userId: must be a number');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userIdNumber },
      include: { branch: true }, // Include branch relation
    });

    console.log('User with Branch:', user); // Debugging line

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const branchId = user.branch?.id || null; // Extract branchId or set to null if not found
    return { ...user, branchId };
  }
}
