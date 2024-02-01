import { Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Todos } from './todo.entity';

@Entity('todos')
export class MongoTodo extends Todos {
  @ObjectIdColumn()
  _id: ObjectId;
}
