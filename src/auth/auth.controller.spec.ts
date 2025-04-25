import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    // Create mock implementation
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      password: 'password123',
      role: 'cashier',
    };

    it('should register a new user', async () => {
      const expectedUser = {
        id: 1,
        username: createUserDto.username,
        password: 'hashedPassword',
        role: createUserDto.role,
        createdAt: new Date(),
      };
      mockAuthService.register.mockResolvedValue(expectedUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login a user and return access token', async () => {
      const expectedResult = { access_token: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        role: 'cashier',
      };

      const result = controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
