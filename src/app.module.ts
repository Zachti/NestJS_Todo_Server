import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todos } from './todo/entities/todo.entity';

@Module({
  imports: [
    TodoModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgres://postgres:docker@127.0.0.1:5432/todos',
      //host: '127.0.0.1',
      //port: 5432,
      //username: 'postgres',
      //password: 'docker',
      //database: 'todos',
      entities: [Todos],
      synchronize: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://mongo:27017/todos',
      //host: 'localhost',
      //port: 27017,
      //database: 'todos',
      entities: [Todos],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
