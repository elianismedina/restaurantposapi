import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

describe('CustomersController', () => {
  let controller: CustomersController;

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOrderHistory: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createCustomerDto: CreateCustomerDto = {
      email: 'test@example.com',
      name: 'Test Customer',
      preferences: { theme: 'dark' },
    };

    it('should create a customer', async () => {
      const expectedCustomer = {
        id: 1,
        ...createCustomerDto,
      };
      mockCustomersService.create.mockResolvedValue(expectedCustomer);

      const result = await controller.create(createCustomerDto);

      expect(result).toEqual(expectedCustomer);
      expect(mockCustomersService.create).toHaveBeenCalledWith(
        createCustomerDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const expectedCustomers = [
        {
          id: 1,
          email: 'test1@example.com',
          name: 'Test Customer 1',
          preferences: { theme: 'dark' },
        },
        {
          id: 2,
          email: 'test2@example.com',
          name: 'Test Customer 2',
          preferences: { theme: 'light' },
        },
      ];

      mockCustomersService.findAll.mockResolvedValue(expectedCustomers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedCustomers);
      expect(mockCustomersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const expectedCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test Customer',
        preferences: { theme: 'dark' },
      };

      mockCustomersService.findOne.mockResolvedValue(expectedCustomer);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedCustomer);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findOrderHistory', () => {
    it('should return customer order history', async () => {
      const expectedHistory = [
        {
          id: 1,
          customerId: 1,
          items: [
            {
              id: 1,
              product: {
                id: 1,
                name: 'Test Product',
                price: 100,
              },
            },
          ],
          user: {
            id: 1,
            name: 'Test User',
          },
        },
      ];

      mockCustomersService.findOrderHistory.mockResolvedValue(expectedHistory);

      const result = await controller.findOrderHistory('1');

      expect(result).toEqual(expectedHistory);
      expect(mockCustomersService.findOrderHistory).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    const updateCustomerDto: UpdateCustomerDto = {
      name: 'Updated Customer',
    };

    it('should update a customer', async () => {
      const expectedCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Updated Customer',
        preferences: { theme: 'dark' },
      };

      mockCustomersService.update.mockResolvedValue(expectedCustomer);

      const result = await controller.update('1', updateCustomerDto);

      expect(result).toEqual(expectedCustomer);
      expect(mockCustomersService.update).toHaveBeenCalledWith(
        1,
        updateCustomerDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a customer', async () => {
      await controller.remove('1');

      expect(mockCustomersService.remove).toHaveBeenCalledWith(1);
    });
  });
});
