import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Todos } from './entities/todo.entity';
import { DatabaseType, SortByTypes, State } from './enums/enums';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todos)
    private todosRepository: Repository<Todos>,
    private readonly postgresConnection: DataSource,
    private readonly mongoConnection: DataSource,
    private readonly logger: LoggerService,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    await this.checkIfTodoExist({ title: createTodoDto.title });
    try {
      this.postgresConnection.getRepository(Todos).create(createTodoDto);
      const res = await this.mongoConnection
        .getRepository(Todos)
        .save(createTodoDto);
      this.logger.info(`new todo created in the DBs. id: ${res.rawid}`);
      return res.rawid;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async count(database: DatabaseType, state: State) {
    try {
      this.todosRepository = this.getDbConnection(database);
      const res =
        state == State.All
          ? await this.todosRepository.count()
          : await this.todosRepository.count({ where: { state } });
      this.logger.info(
        `The sum of todo with state: ${state} in ${database} DB is: ${res}`,
      );
      return res;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async getContent(database: DatabaseType, state: State, sortBy: SortByTypes) {
    try {
      this.todosRepository = this.getDbConnection(database);
      const res =
        state == State.All
          ? await this.todosRepository.find()
          : await this.todosRepository.find({ where: { state } });
      const todoList = sortBy
        ? res.sort((a, b) => {
            switch (sortBy.toUpperCase()) {
              case SortByTypes.Id:
                return a.rawid - b.rawid;
              case SortByTypes.DueDate:
                return a.dueDate - b.dueDate;
              case SortByTypes.Title:
                return a.title.localeCompare(b.title);
            }
          })
        : res.sort((a, b) => a.rawid - b.rawid);
      this.logger.info(
        `Todo list fetched from ${database} DB in state: ${state} sorted by: ${sortBy}`,
      );
      return todoList;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async update(rawid: number, updateTodoDto: UpdateTodoDto) {
    const { postgresTodo } = await this.checkIfTodoExist({ rawid });
    try {
      await this.postgresConnection
        .getRepository(Todos)
        .update(rawid, updateTodoDto);
      await this.mongoConnection
        .getRepository(Todos)
        .update(rawid, updateTodoDto);
      this.logger.info(
        `Todo with id: ${rawid} updated to status: ${updateTodoDto.state}`,
      );
      return postgresTodo.state;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
    }
  }

  async remove(rawid: number) {
    const { postgresTodo, mongoTodo } = await this.checkIfTodoExist({ rawid });
    try {
      await this.postgresConnection.getRepository(Todos).remove(postgresTodo);
      await this.mongoConnection.getRepository(Todos).remove(mongoTodo);
      const count = await this.mongoConnection.getRepository(Todos).count();
      this.logger.info(
        `The number of todos in the DBs after Todo with id: ${rawid} deleted is: ${count}`,
      );
      return count;
    } catch (e) {
      this.logAndThrowInternalServerException(e);
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

  private async checkIfTodoExist(input: { title?: string; rawid?: number }) {
    const { title, rawid } = input;

    const postgresTodo = title
      ? await this.postgresConnection.getRepository(Todos).findOneBy({ title })
      : await this.postgresConnection.getRepository(Todos).findOneBy({ rawid });

    const mongoTodo = title
      ? await this.mongoConnection.getRepository(Todos).findOneBy({ title })
      : await this.mongoConnection.getRepository(Todos).findOneBy({ rawid });

    if (title) {
      if (postgresTodo || mongoTodo) {
        this.logger.error(
          `Error: TODO with the title [${title}] already exists in the DB`,
        );
        throw new ConflictException(
          `Error: TODO with the title [${title}] already exists in the DB`,
        );
      }
    }
    if (!(postgresTodo && mongoTodo)) {
      this.logger.error(`Error: no such TODO with id ${rawid}`);
      throw new NotFoundException(`Error: no such TODO with id ${rawid}`);
    }

    return {
      postgresTodo,
      mongoTodo,
    };
  }

  private logAndThrowInternalServerException(e: any) {
    this.logger.error('Could not connect to at least one DB.');
    throw new InternalServerErrorException(
      'Could not connect to at least one DB.',
      e,
    );
  }
}
