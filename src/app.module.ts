import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import * as joi from 'joi';
import Configuration from "./config/app.config"
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'public'),
    }),
    ConfigModule.forRoot({
      load: [Configuration],
      isGlobal: true,
      validationSchema: joi.object({}),
    }),
    TypeOrmModule.forRootAsync({
      imports: undefined,
      inject: [Configuration.KEY],
      useFactory: (configureService: ConfigType<typeof Configuration>) => {
        const { database: db } = configureService;
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.pass,
          database: db.name,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
