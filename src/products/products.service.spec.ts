import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
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
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createProductDto = {
      name: 'Test Product',
      sku: 'TEST-001',
      price: 100,
      stock: 10,
    };
    const branchId = 1;

    it('should create a product successfully', async () => {
      const expectedProduct = {
        id: 1,
        ...createProductDto,
      };
      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      const result = await service.create(createProductDto, branchId);

      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          branch: {
            connect: { id: branchId },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedProducts = [
        {
          id: 1,
          name: 'Product 1',
          sku: 'PROD-001',
          price: 100,
          stock: 10,
        },
        {
          id: 2,
          name: 'Product 2',
          sku: 'PROD-002',
          price: 200,
          stock: 20,
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(expectedProducts);

      const result = await service.findAll();

      expect(result).toEqual(expectedProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const expectedProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 100,
        stock: 10,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateProductDto = {
      name: 'Updated Product',
      price: 150,
    };

    it('should update a product successfully', async () => {
      const existingProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 100,
        stock: 10,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateProductDto,
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      const existingProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 100,
        stock: 10,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.delete.mockResolvedValue(existingProduct);

      const result = await service.remove(1);

      expect(result).toEqual(existingProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
