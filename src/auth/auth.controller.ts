import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('test')
  @UseGuards(AuthGuard())
  testing(@GetUser() user: User, @RawHeaders() raw: any) {
    return { user, raw };
  }


  // @SetMetadata('roles', ['user', 'admin'])
  @Get('test2')
  @UseGuards(AuthGuard(), UserRoleGuard)
  @RoleProtected(ValidRoles.admin)
  testingdos(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
  @Get('test3')
  @Auth()
  testingtres(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
