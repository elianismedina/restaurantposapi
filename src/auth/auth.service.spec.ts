import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockPrismaService: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let mockJwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto = {
      username: 'testuser',
      password: 'password123',
      role: 'cashier',
      email: 'test@example.com',
      branchId: 1,
    };

    it('should register a new user successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const expectedUser = {
        id: 1,
        username: createUserDto.username,
        role: createUserDto.role,
        email: createUserDto.email,
        branchId: createUserDto.branchId,
      };
      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.register(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: createUserDto.username,
          password: 'hashedPassword',
          role: createUserDto.role,
          email: createUserDto.email,
          branch: {
            connect: { id: createUserDto.branchId },
          },
        },
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login successfully and return access token', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const mockUser = {
        id: 1,
        username: loginDto.username,
        password: 'hashedPassword',
        role: 'cashier',
        branchId: 1, // Include branchId in mockUser
        branch: { id: 1 }, // Simulate included branch relation
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const mockToken = 'jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: mockToken });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
        branchId: mockUser.branch?.id || null, // Include branchId in expected payload
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const mockUser = {
        id: 1,
        username: loginDto.username,
        password: 'hashedPassword',
        role: 'cashier',
        branchId: 1,
        branch: { id: 1 },
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});
