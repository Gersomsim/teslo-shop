import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from "../auth/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcryt from 'bcrypt';
import { use } from "passport";

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private productService: ProductsService
  ) {}
  async runSeed() {
    await this.deleteTables();
    const user = await this.insertUser()
    await this.insertNewProducts(user);
    return `SEED EXECUTED`;
  }
  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const query = this.userRepository.createQueryBuilder();
    await query
      .delete()
      .where({})
      .execute();
  }
  private async insertUser() {
    const userSeed = initialData.user;
    const users: User[] = [];
    userSeed.forEach((user) => {
      const preUser = this.userRepository.create(user)
      preUser.password = bcryt.hashSync(user.password, 10);
      users.push(preUser);
    });
    await this.userRepository.save(users);
    return users[0];
  }
  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = [];
    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromises);
    return true;
  }
}
