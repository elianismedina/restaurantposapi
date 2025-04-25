import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      sku: 'TEST-001',
      price: 100,
      stock: 10,
    };

    it('should create a product', async () => {
      const expectedProduct = {
        id: 1,
        ...createProductDto,
      };
      mockProductsService.create.mockResolvedValue(expectedProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
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

      mockProductsService.findAll.mockResolvedValue(expectedProducts);

      const result = await controller.findAll();

      expect(result).toEqual(expectedProducts);
      expect(mockProductsService.findAll).toHaveBeenCalled();
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

      mockProductsService.findOne.mockResolvedValue(expectedProduct);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 150,
    };

    it('should update a product', async () => {
      const expectedProduct = {
        id: 1,
        name: 'Updated Product',
        sku: 'TEST-001',
        price: 150,
        stock: 10,
      };

      mockProductsService.update.mockResolvedValue(expectedProduct);

      const result = await controller.update('1', updateProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.update).toHaveBeenCalledWith(
        1,
        updateProductDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const expectedProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 100,
        stock: 10,
      };

      mockProductsService.remove.mockResolvedValue(expectedProduct);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedProduct);
      expect(mockProductsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
