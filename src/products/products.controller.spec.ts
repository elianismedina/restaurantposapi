import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/products.dto';
import { BadRequestException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST123',
        price: 10.0,
        stock: 100,
        // Remove branchId from createProductDto
      };

      const branchId = '1'; // Pass branchId as a string
      const expectedProduct = {
        id: 1,
        ...createProductDto,
        branchId: 1, // Include branchId in the response
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.create.mockResolvedValue(expectedProduct);

      const result = await controller.createProduct(createProductDto, branchId);

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(
        createProductDto,
        1,
      );
    });

    it('should throw BadRequestException if branchId is invalid', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST123',
        price: 10.0,
        stock: 100,
        // Remove branchId from createProductDto
      };

      const invalidBranchId = 'invalid';

      await expect(
        controller.createProduct(createProductDto, invalidBranchId),
      ).rejects.toThrow(BadRequestException);
      expect(mockProductsService.create).not.toHaveBeenCalled();
    });
  });

  // Other tests for findAll, findOne, update, remove...
});
