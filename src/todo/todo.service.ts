import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Todos } from './entities/todo.entity';
import { DatabaseType, SortByTypes, State } from './enums/enums';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todos)
    private todosRepository: Repository<Todos>,
    private readonly postgresConnection: DataSource,
    private readonly mongoConnection: DataSource,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    try {
      this.postgresConnection.getRepository(Todos).create(createTodoDto);
      return await this.mongoConnection
        .getRepository(Todos)
        .save(createTodoDto);
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not connect to at least one DB.',
      );
    }
  }

  count(database: DatabaseType, state: State) {
    try {
      this.todosRepository = this.getDbConnection(database);
      return state == State.All
        ? this.todosRepository.count()
        : this.todosRepository.count({ where: { state } });
    } catch (e) {
      throw new InternalServerErrorException('Could not connect to the DB.');
    }
  }

  async getContent(database: DatabaseType, state: State, sortBy: SortByTypes) {
    try {
      this.todosRepository = this.getDbConnection(database);
      const res =
        state == State.All
          ? await this.todosRepository.find()
          : await this.todosRepository.find({ where: { state } });
      return sortBy
        ? res.sort((a, b) => {
            switch (sortBy.toUpperCase()) {
              case SortByTypes.Id:
                return a.rawid - b.rawid;
              case SortByTypes.DueDate:
                return a.duedate - b.duedate;
              case SortByTypes.Title:
                return a.title.localeCompare(b.title);
            }
          })
        : res.sort((a, b) => a.rawid - b.rawid).map((todo) => todo.content);
    } catch (e) {
      throw new InternalServerErrorException('Could not connect to the DB.');
    }
  }

  async update(rawid: number, updateTodoDto: UpdateTodoDto) {
    const postgresTodo = await this.postgresConnection
      .getRepository(Todos)
      .findOneBy({ rawid });
    if (!postgresTodo)
      throw new BadRequestException(`Error: no such TODO with id ${rawid}`);
    try {
      await this.postgresConnection
        .getRepository(Todos)
        .update(rawid, updateTodoDto);
      return await this.mongoConnection
        .getRepository(Todos)
        .update(rawid, updateTodoDto);
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not connect to at least one DB.',
      );
    }
  }

  async remove(rawid: number) {
    const postgresTodo = await this.postgresConnection
      .getRepository(Todos)
      .findOneBy({ rawid });
    const mongoTodo = await this.mongoConnection
      .getRepository(Todos)
      .findOneBy({ rawid });
    if (!postgresTodo)
      throw new BadRequestException(`Error: no such TODO with id ${rawid}`);
    try {
      await this.postgresConnection.getRepository(Todos).remove(postgresTodo);
      return await this.mongoConnection.getRepository(Todos).remove(mongoTodo);
    } catch (e) {
      throw new InternalServerErrorException(
        'Could not connect to at least one DB.',
      );
    }
  }

  private getDbConnection(database: DatabaseType) {
    switch (database) {
      case DatabaseType.Postgres:
        return this.postgresConnection.getRepository(Todos);

      case DatabaseType.Mongo:
        return this.mongoConnection.getRepository(Todos);
    }
  }
}
