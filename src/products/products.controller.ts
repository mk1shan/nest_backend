import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product', description: 'Adds a new product to the inventory database.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product successfully created.', type: Product })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product with this SKU already exists.' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve products list',
    description: 'Fetch all products with optional filters, search, pagination, and sorting.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of matching products with pagination metadata.' })
  async findAll(@Query() queryDto: QueryProductDto) {
    return await this.productsService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get inventory statistics',
    description: 'Returns total product counts, stock valuation, and category distribution.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Aggregated inventory statistics.' })
  async getStatistics() {
    return await this.productsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'The requested product.', type: Product })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product successfully updated.', type: Product })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.productsService.remove(id);
  }
}
