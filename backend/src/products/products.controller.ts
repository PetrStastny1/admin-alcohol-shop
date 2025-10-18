import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ✅ GET /products → seznam všech aktivních produktů
  @Get()
  async getAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // ✅ GET /products/:id → detail produktu
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // ✅ POST /products → vytvoření nového produktu
  @Post()
  @UseGuards(JwtAuthGuard) // 🔑 REST → JWT guard
  async create(@Body() input: CreateProductInput): Promise<Product> {
    return this.productsService.create({
      name: input.name,
      price: input.price,
      description: input.description,
      category: input.categoryId ? { id: input.categoryId } as any : undefined,
      isActive: input.isActive ?? true,
    });
  }

  // ✅ PUT /products/:id → update produktu
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateProductInput,
  ): Promise<Product> {
    return this.productsService.update(id, {
      name: input.name,
      price: input.price,
      description: input.description,
      isActive: input.isActive,
      category: input.categoryId ? { id: input.categoryId } as any : undefined,
    });
  }

  // ✅ DELETE /products/:id → soft delete (vrací přímo produkt)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }
}
