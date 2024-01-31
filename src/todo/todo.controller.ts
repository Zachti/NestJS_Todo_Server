import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Query,
  HttpCode,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { DatabaseType, SortByTypes, State } from './enums/enums';
import {
  DatabaseTypeValidationPipe,
  SortByTypeValidator,
  StateValidationPipe,
} from './validators';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('health')
  @HttpCode(200)
  health() {
    return 'OK';
  }

  @Post()
  @HttpCode(200)
  async create(@Body() createTodoDto: CreateTodoDto) {
    const id = await this.todoService.create(createTodoDto);
    return { result: id };
  }

  @Get('size')
  @HttpCode(200)
  async count(
    @Query('database', new DatabaseTypeValidationPipe()) database: DatabaseType,
    @Query('status', new StateValidationPipe()) status: State,
  ) {
    const count = await this.todoService.count(database, status);
    return { result: count };
  }

  @Get('content')
  @HttpCode(200)
  async getContent(
    @Query('database', new DatabaseTypeValidationPipe()) database: DatabaseType,
    @Query('status', new StateValidationPipe()) status: State,
    @Query('sortBy', new SortByTypeValidator()) sortBy: SortByTypes,
  ) {
    const todoList = await this.todoService.getContent(
      database,
      status,
      sortBy,
    );
    return { result: todoList };
  }

  @Put()
  @HttpCode(200)
  async update(
    @Query('id') id: string,
    @Query('status', new StateValidationPipe({ disallowAll: true }))
    state: State,
  ) {
    const oldStatus = await this.todoService.update(+id, { state });
    return { result: oldStatus };
  }

  @Delete()
  @HttpCode(200)
  async remove(@Query('id') id: string) {
    const count = await this.todoService.remove(+id);
    return { result: count };
  }
}
