import { Test, TestingModule } from '@nestjs/testing';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { CreateCashRegisterDto } from './dto/cash-register.dto';

describe('CashController', () => {
  let controller: CashController;
  let service: CashService;

  const mockCashService = {
    createCashRegister: jest.fn(),
    getCashRegister: jest.fn(),
    updateCashRegisterBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashController],
      providers: [
        {
          provide: CashService,
          useValue: mockCashService,
        },
      ],
    }).compile();

    controller = module.get<CashController>(CashController);
    service = module.get<CashService>(CashService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCashRegister', () => {
    const userId = 1;
    const createDto: CreateCashRegisterDto = {
      initialBalance: 100,
    };

    it('should create a new cash register', async () => {
      const expectedRegister = {
        id: 1,
        userId,
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCashService.createCashRegister.mockResolvedValue(expectedRegister);

      const req = { user: { userId } };
      const result = await controller.createCashRegister(createDto, req);

      expect(result).toEqual(expectedRegister);
      expect(mockCashService.createCashRegister).toHaveBeenCalledWith(
        userId,
        createDto,
      );
    });
  });

  describe('getCashRegister', () => {
    const userId = 1;

    it('should return the cash register for the user', async () => {
      const expectedRegister = {
        id: 1,
        userId,
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCashService.getCashRegister.mockResolvedValue(expectedRegister);

      const req = { user: { userId } };
      const result = await controller.getCashRegister(req);

      expect(result).toEqual(expectedRegister);
      expect(mockCashService.getCashRegister).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateBalance', () => {
    const userId = 1;
    const newBalance = 150;

    it('should update the cash register balance', async () => {
      const expectedRegister = {
        id: 1,
        userId,
        balance: newBalance,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCashService.updateCashRegisterBalance.mockResolvedValue(
        expectedRegister,
      );

      const req = { user: { userId } };
      const result = await controller.updateBalance(newBalance, req);

      expect(result).toEqual(expectedRegister);
      expect(mockCashService.updateCashRegisterBalance).toHaveBeenCalledWith(
        userId,
        newBalance,
      );
    });
  });
});
