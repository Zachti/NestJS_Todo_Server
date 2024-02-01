import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { State } from '../enums/enums';
import { ObjectId } from 'mongodb';

@Entity('todos')
export class MongoTodo {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  rawid: number;

  @Column()
  content: string;

  @Column({ type: 'bigint' })
  duedate: number;

  @Column({ default: State.Pending })
  state: string;

  @Column()
  title: string;
}
