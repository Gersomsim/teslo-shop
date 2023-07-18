import {
  BadRequestException,
  Injectable,
  InternalServerErrorException, UnauthorizedException
} from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from "./dto/login-user.dto";

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
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });
    if (!user) {
      throw new UnauthorizedException('Credential are no valid (email)');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credential are no valid (password)');
    }
    //TODO retornar el JWT
    return user;
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
