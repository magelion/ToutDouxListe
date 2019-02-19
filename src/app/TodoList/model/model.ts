export interface TodoList {
  uuid : string,
  name : string,
  items : TodoItem[],
  owner : string
  // Public uid to share this list with
  sharedTo : string[]
};

export interface TodoItem {
  uuid : string,
  name : string,
  desc? : string,
  complete : boolean
};

export interface PublicUser {

  uid : string,
  displayName : string,
  photoURL : string,
};

export interface User {

  uid : string,
  email : string,
  contacts : string[],

  // Id of the corresponding PublicUser
  publicUid: string

};
