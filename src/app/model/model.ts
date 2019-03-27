export interface TodoList {
  uuid : string,
  name : string,
  items : TodoItem[],
  owner : string, // TODO : get rid of this for security
  publicOwner : string,
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

  // List of Public User Id which are contacts
  contacts : Contact[],

  // Id of the corresponding PublicUser
  publicUid: string

};

export interface Contact {
  uid: string,
  contactId: string,
  state: FriendRequestState
}

export enum FriendRequestState {
  PENDING,
  ACCEPTED,
  DELETED
}

export interface FriendRequest {
  uid: string,
  from: string,
  to: string,
  state: FriendRequestState
}
