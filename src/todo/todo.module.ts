import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todos } from './entities/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Todos])],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
