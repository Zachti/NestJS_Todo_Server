import { Module } from '@nestjs/common';
import { TodoModule, Todos } from './todo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig, mongoConfig, validationSchema } from './config';
import { ConfigModule, ConfigType } from '@nestjs/config';
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
      useFactory: (postgresCfg: ConfigType<typeof postgresConfig>) => {
        return {
          type: 'postgres',
          url: postgresCfg.url,
          entities: [Todos],
          synchronize: false,
        };
      },
      inject: [postgresConfig.KEY],
    }),
    TypeOrmModule.forRootAsync({
      name: 'mongodb',
      imports: [ConfigModule],
      useFactory: (mongoCfg: ConfigType<typeof mongoConfig>) => {
        return {
          type: 'mongodb',
          host: mongoCfg.host,
          port: mongoCfg.port,
          database: mongoCfg.database,
          collection: mongoCfg.collection,
          synchronize: false,
          entities: [MongoTodo],
        };
      },
      inject: [mongoConfig.KEY],
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
