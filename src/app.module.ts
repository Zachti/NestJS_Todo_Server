import { Module } from '@nestjs/common';
import { TodoModule, Todos } from './todo';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  postgresConfig,
  commonConfig,
  mongoConfig,
  validationSchema,
} from './config';
import { ConfigModule, ConfigType } from '@nestjs/config';

@Module({
  imports: [
    TodoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfig, mongoConfig, postgresConfig],
      validationSchema: validationSchema,
      validationOptions: { presence: 'required' },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (
        postgresCfg: ConfigType<typeof postgresConfig>,
        config: ConfigType<typeof commonConfig>,
      ) => {
        return {
          type: 'postgres',
          url: postgresCfg.url,
          host: config.host,
          port: parseInt(postgresCfg.port),
          username: postgresCfg.username,
          password: postgresCfg.password,
          database: config.databaseName,
          entities: [Todos],
          synchronize: true,
        };
      },
      inject: [postgresConfig.KEY, commonConfig.KEY],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (
        mongoCfg: ConfigType<typeof mongoConfig>,
        config: ConfigType<typeof commonConfig>,
      ) => {
        return {
          type: 'mongodb',
          url: mongoCfg.url,
          host: config.host,
          port: parseInt(mongoCfg.port),
          database: config.databaseName,
          entities: [Todos],
          synchronize: true,
        };
      },
      inject: [mongoConfig.KEY, commonConfig.KEY],
    }),
  ],
})
export class AppModule {}
