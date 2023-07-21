import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { ValidRoles } from "../auth/interfaces/valid-roles.interface";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../auth/entities/user.entity";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(
    @GetUser() user: User,
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() PaginationDto: PaginationDto) {
    console.log(PaginationDto);
    return this.productsService.findAll(PaginationDto);
  }

  @Get(':id')
  findOne(@Param('id') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
