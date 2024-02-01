import { State } from './enums/enums';

export interface outputTodo {
  id: number;
  content: string;
  duedate: number;
  state: State;
  title: string;
}
