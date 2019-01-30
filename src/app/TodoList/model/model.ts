export interface TodoList {
  uuid : string,
  name : string,
  key? : string,
  items : TodoItem[]
}

export interface TodoItem {
  uuid? : string,
  name : string,
  desc? : string,
  complete : boolean
}
