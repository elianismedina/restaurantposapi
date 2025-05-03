import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCustomerDto = {
      email: 'test@example.com',
      name: 'Test Customer',
      preferences: { theme: 'dark' },
    };
    const branchId = 1;

    it('should create a customer successfully', async () => {
      const expectedCustomer = {
        id: 1,
        ...createCustomerDto,
      };
      mockPrismaService.customer.create.mockResolvedValue(expectedCustomer);

      const result = await service.create(createCustomerDto, branchId);

      expect(result).toEqual(expectedCustomer);
      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: {
          ...createCustomerDto,
          branch: {
            connect: { id: branchId },
          },
        },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.customer.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.create(createCustomerDto, branchId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const createCustomerDto = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        address: '123 Main St',
        preferences: {},
      };
      const branchId = 1;

      // Mock the Prisma `findUnique` method to simulate an existing customer
      jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce({
        id: 1,
        ...createCustomerDto,
        branchId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Expect the service to throw a ConflictException
      await expect(service.create(createCustomerDto, branchId)).rejects.toThrow(
        ConflictException,
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

      mockPrismaService.customer.findMany.mockResolvedValue(expectedCustomers);

      const result = await service.findAll();

      expect(result).toEqual(expectedCustomers);
      expect(mockPrismaService.customer.findMany).toHaveBeenCalled();
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

      mockPrismaService.customer.findUnique.mockResolvedValue(expectedCustomer);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedCustomer);
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when customer is not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateCustomerDto = {
      name: 'Updated Customer',
    };

    it('should update a customer successfully', async () => {
      const existingCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test Customer',
        preferences: { theme: 'dark' },
      };

      const updatedCustomer = {
        ...existingCustomer,
        ...updateCustomerDto,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(existingCustomer);
      mockPrismaService.customer.update.mockResolvedValue(updatedCustomer);

      const result = await service.update(1, updateCustomerDto);

      expect(result).toEqual(updatedCustomer);
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateCustomerDto,
      });
    });

    it('should throw NotFoundException when customer is not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateCustomerDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a customer successfully', async () => {
      const existingCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test Customer',
        preferences: { theme: 'dark' },
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(existingCustomer);
      mockPrismaService.customer.delete.mockResolvedValue(existingCustomer);

      await service.remove(1);

      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when customer is not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CustomersService, PrismaService],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should throw ConflictException when email already exists', async () => {
    const createCustomerDto = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      preferences: {},
    };
    const branchId = 1;

    // Mock the Prisma `findUnique` method to simulate an existing customer
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce({
      id: 1,
      ...createCustomerDto,
      branchId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Expect the service to throw a ConflictException
    await expect(service.create(createCustomerDto, branchId)).rejects.toThrow(
      ConflictException,
    );
  });
});
