import { Injectable } from '@angular/core';
import {TodoItem, TodoList, User} from "../../app/TodoList/model/model";
import {Observable, BehaviorSubject, combineLatest, Subscription} from "rxjs";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map, tap } from 'rxjs/operators';
import { AuthenticationProvider } from '../authentication/authentication';

@Injectable()
export class TodoServiceProvider {

  public static readonly TODO_LISTS_DB_NAME:string = 'TodoLists';

  private todoListsCol: AngularFirestoreCollection<TodoList>;
  private todoListsSub$ = new BehaviorSubject<TodoList[]>( [] );
  private user: User;
  private _todolistsObs = this.todoListsSub$.asObservable();

  private _subToken : Subscription;

  constructor(private afs: AngularFirestore, authProvider: AuthenticationProvider) {
    console.log('Hello TodoServiceProvider Provider');

    this.todoListsCol = null;

    authProvider.getUserObs().subscribe(async user => {
      
      if(user != null) {
        this.user = user;
        console.log('TodoService : user = ' + JSON.stringify(user));

        this.todoListsCol = null;
        /*this.todoListsCol = afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME, 
        ref => ref.where('owner', '==', user.uid));

        console.log('updateList called');*/

        this.todoListsCol = this.afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME, ref => ref.where('owner', '==', this.user.uid));
        const sharedListCol: AngularFirestoreCollection<TodoList> = this.afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME, ref => ref.where('sharedTo', 'array-contains', this.user.publicUid));

        const ownedListSnap$ = this.todoListsCol.snapshotChanges();
        const sharedListSnap$ = sharedListCol.snapshotChanges();
    
        const finalObs$ = combineLatest(ownedListSnap$, sharedListSnap$).pipe(
          
          map(data => {
          
            //console.log('shared list : ' + JSON.stringify(data[1].map(action => action.payload.doc.data())))
            const actions = data[0].concat(data[1]);
            return actions.map(action => {

              return action.payload.doc.data() as TodoList;
            });
          }),
          tap(lists => console.log("Lists fetched : " + JSON.stringify(lists)))
        );
    
        if(this._subToken) {
          this._subToken.unsubscribe();
        }

        this._subToken = finalObs$.subscribe( (tdl: TodoList[]) => {
          this.todoListsSub$.next( tdl );
        });
      }
    });
  }

  public getTodoListsObs() : Observable<TodoList[]> {
    return this._todolistsObs;
  }

  private mapFetchedList(list : TodoList) : TodoList{

    if(!list.items) {
      list.items = new Array();
    }
    if(!list.sharedTo) list.sharedTo = new Array();

    return list;
  }

  public getList(key: string): Promise<TodoList>{

    if(this.todoListsCol === null) {
      console.log('TodoProvider : getList : ref null');
      return new Promise(() => {});
    }

    return this.getTodoListDoc(key).valueChanges().map(value => {

      value = this.mapFetchedList(value);
      console.log('getList : list=' + JSON.stringify(value));
      return value;
    })
    .take(1) // Add Take(1) to force Obsevable completion otherwise, toPromise().then() is never executed
    .toPromise();
  }

  private getTodoListDoc(listKey: string) : AngularFirestoreDocument<TodoList> {

    if(this.todoListsCol === null) {
      return null;
    }
    //return this.afs.doc(TodoServiceProvider.TODO_LISTS_DB_NAME + '/' + listKey);
    return this.todoListsCol.doc(listKey);
  }

  public editTodoList(list: TodoList) : Promise<void> {

    if(this.todoListsCol === null) {
      console.log('TodoProvider : editTodoList : ref null : nothing updated');
      return new Promise<void>(() => {});
    }
    console.log('TodoProvider : editTodoList : list=' + JSON.stringify(list));

    return this.getTodoListDoc(list.uuid).update(list);
  }

  public editTodo(listUuid : string, editedItem: TodoItem) : Promise<void> {

    if(this.todoListsCol === null || !editedItem || !listUuid) {
      return new Promise(() => {});
    }

    return this.getList(listUuid).then(list => {
      const index = list.items.findIndex(item => item.uuid === editedItem.uuid);

      if(index >= 0) {
        list.items[index] = editedItem;
        return this.editTodoList(list);
      }
    });
  }

  public deleteTodo(listUuid: string, uuid: String) : Promise<void> {

    if(this.todoListsCol === null || !listUuid || !uuid) {
      console.log('deleteTodo : invalid args, nothing deleted : ref=' + this.todoListsCol + '; listId=' + listUuid + '; itemIt=' + uuid);
      return new Promise(() => {});
    }

    return this.getList(listUuid).then(list => {

      const index = list.items.findIndex(item => item.uuid === uuid);

        if(index >= 0) {
          list.items.splice(index, 1);
          console.log('deleteTodo : index=' + index + '; newList=' + JSON.stringify(list));
          return this.editTodoList(list);
        }
        else {
          return new Promise<void>(() => {});
        }
    });
  }

  public deleteList(listKey: string) : Promise<void> {

    if(this.todoListsCol === null) {
      return new Promise<void>(() => {});
    }
    if(this.todoListsCol === null) {
      return new Promise<void>(() => {});
    }
    return this.getTodoListDoc(listKey).delete()
      .then(() => {
        console.log("List deleted " + listKey);
      })
      .catch(reason => console.log("error while deleting list" + reason));
  }

  public createList(name: string) : Promise<void> {
    
    if(this.todoListsCol === null) {
      return new Promise<void>(() => {});
    }
    const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : new Array(),
      owner : this.user.uid
    } as TodoList;

    const promise = this.todoListsCol.doc(newList.uuid).set(newList);

    return promise;
  }

  public createItem(listUuid:string, item:TodoItem) : Promise<void> {

    if(this.todoListsCol === null) {
      return new Promise(() => {});
    }

    return this.getList(listUuid).then(list => {
      if(!list.items) {
        list.items = new Array();
      }
      list.items.push(item);
      return this.editTodoList(list);   
    });
  }

  public getTodoItem(listId: string, itemId: string) : Promise<TodoItem> {

    return this.getList(listId).then(list => {

      return list.items.find(value => {
        return value.uuid === itemId;
      });
    });
  }
}
