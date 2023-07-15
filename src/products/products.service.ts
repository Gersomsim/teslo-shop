import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { PaginationDto } from "../common/dto/pagination.dto";
import { validate as UUID} from 'uuid'

@Injectable()
export class ProductsService {
  private readonly loger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create(createProductDto);
      await this.productRepository.save(newProduct);
      return newProduct;
    } catch (e) {
      this.handleDbExceptions(e);
    }
  }

  findAll({ limit = 2, offset = 0 }: PaginationDto) {
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product;
    if (UUID(term)) {
      product = await this.productRepository.findOne({ where: { id: term } });
    } else {
      const query = await this.productRepository.createQueryBuilder();
      product = await query
        .where('UPPER(slug) = :slug or title = :title', { slug: term.toLowerCase(), title: term.toUpperCase() })
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`product with id: ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0){
      throw new NotFoundException(`product with id: ${id} not found`);
    }
  }
  private handleDbExceptions(err: any) {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }
    this.loger.error(err);
    throw new InternalServerErrorException('Expected Error, check logs');
  }
}
