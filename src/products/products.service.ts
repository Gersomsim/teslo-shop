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
import { DataSource, Repository } from "typeorm";
import { PaginationDto } from "../common/dto/pagination.dto";
import { validate as UUID} from 'uuid'
import { ProductImage } from "./entities/product-image.entity";

@Injectable()
export class ProductsService {
  private readonly loger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const newProduct = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });
      await this.productRepository.save(newProduct);
      return { ...newProduct, images };
    } catch (e) {
      this.handleDbExceptions(e);
    }
  }

  async findAll({ limit = 2, offset = 0 }: PaginationDto) {
    const productos = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    return productos.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product;
    if (UUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = await this.productRepository.createQueryBuilder('product');
      product = await query
        .where('slug = :slug or UPPER(title) = :title', { slug: term.toLowerCase(), title: term.toUpperCase() })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`product with id: ${term} not found`);
    return product;
  }

  async findOnePlain(term: string) {
    const product = await this.findOne(term);
    return {
      ...product,
      images: product.images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate} = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate });
    if (!product)
      throw new NotFoundException(`product with id: ${id} not found`);
    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return product;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDbExceptions(e);
    }
  }

  async remove(id: string) {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
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
