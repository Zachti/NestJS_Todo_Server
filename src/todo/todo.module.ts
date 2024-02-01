import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todos } from './entities/todo.entity';
import { MongoTodo } from './entities/mongoTodo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MongoTodo], 'mongodb'),
    TypeOrmModule.forFeature([Todos], 'postgres'),
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
