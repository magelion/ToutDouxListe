export interface TodoList {
  uuid : string,
  name : string,
  items : TodoItem[],
  owner : string
}

export interface TodoItem {
  uuid? : string,
  name : string,
  desc? : string,
  complete : boolean
}

export interface User {

  uid? : string,
  displayName : string,
  email : string
  photoURL : string
}
