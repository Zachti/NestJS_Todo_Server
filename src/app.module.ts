import { Module } from '@nestjs/common';
import { TodoModule, Todos } from './todo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig, mongoConfig, validationSchema } from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import {
  CustomBadRequestExceptionFilter,
  CustomConflictExceptionFilter,
  CustomNotFoundExceptionFilter,
} from './exceptionsFilter';
import { LoggerModule } from './logger/logger.module';
import { MongoTodo } from './todo/entities/mongoTodo.entity';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoConfig, postgresConfig],
      validationSchema,
      validationOptions: { presence: 'required' },
    }),
    TypeOrmModule.forRootAsync({
      name: 'postgres',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get('POSTGRES_URL'),
          entities: [Todos],
          synchronize: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      name: 'mongodb',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mongodb',
          url: configService.get('MONGO_URL'),
          synchronize: false,
          entities: [MongoTodo],
        };
      },
      inject: [ConfigService],
    }),
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomBadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CustomConflictExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CustomNotFoundExceptionFilter,
    },
  ],
})
export class AppModule {}
