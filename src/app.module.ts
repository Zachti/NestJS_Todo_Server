import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todos } from './todo/entities/todo.entity';
import { postgresConfig } from './config/postgres.config';
import { ConfigType } from '@nestjs/config';
import { commonConfig } from './config/common.config';
import { mongoConfig } from './config/mongo.config';

@Module({
  imports: [
    TodoModule,
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
