export interface TodoList {
  uuid : string,
  name : string,
  key? : string, // After delebaration, key and uuid shall be the same : the database id
  items : TodoItem[]
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
