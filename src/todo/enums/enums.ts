export enum State {
  Pending = 'PENDING',
  Late = 'LATE',
  Done = 'DONE',
  All = 'ALL',
}

export enum DatabaseType {
  Postgres = 'POSTGRES',
  Mongo = 'MONGO',
}

export enum SortByTypes {
  Id = 'ID',
  DueDate = 'DUE_DATE',
  Title = 'TITLE',
}
