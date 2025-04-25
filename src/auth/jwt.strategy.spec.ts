import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    // Create mock implementation with JWT secret
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'JWT_SECRET') {
          return 'test-secret';
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  describe('validate', () => {
    it('should return user object from payload', () => {
      const mockPayload = {
        sub: 1,
        username: 'testuser',
        role: 'cashier',
      };

      const result = strategy.validate(mockPayload);

      expect(result).toEqual({
        userId: mockPayload.sub,
        username: mockPayload.username,
        role: mockPayload.role,
      });
    });
  });
});
