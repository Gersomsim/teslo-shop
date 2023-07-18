import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAuthDto: CreateUserDto) {
    try {
      const newUser = this.userRepository.create(createAuthDto);
      newUser.password = bcrypt.hashSync(createAuthDto.password, 10);
      return await this.userRepository.save(newUser);
    } catch (e) {
      this.handleDBErrors(e);
    }
  }
  private handleDBErrors(err: any): never {
    console.log(err.detail, err.code);
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }
    console.log(err);
    throw new InternalServerErrorException('Checks logs');
  }
}
