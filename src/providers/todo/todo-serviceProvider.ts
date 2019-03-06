import { Injectable } from '@angular/core';
import {TodoItem, TodoList, User} from "../../app/TodoList/model/model";
import {Observable, BehaviorSubject, combineLatest, from, Subscription} from "rxjs";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map, tap } from 'rxjs/operators';
import { AuthenticationProvider } from '../authentication/authentication';

@Injectable()
export class TodoServiceProvider {

  public static readonly TODO_LISTS_DB_NAME:string = 'TodoLists';

  private todoListsRef: AngularFirestoreCollection<TodoList>;
  private todoListsSub$ = new BehaviorSubject<TodoList[]>( [] );
  private user: User;
  private _todolistsObs = this.todoListsSub$.asObservable();

  private _subToken : Subscription;

  constructor(private afs: AngularFirestore, authProvider: AuthenticationProvider) {
    console.log('Hello TodoServiceProvider Provider');

    this.todoListsRef = null;

    authProvider.getUserObs().subscribe(user => {
      
      if(user != null) {
        this.user = user;
        console.log('TodoService : user = ' + JSON.stringify(user));

        this.todoListsRef = null;
        this.todoListsRef = afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME, 
        ref => ref.where('owner', '==', user.uid));

        console.log('updateList called');

        this.todoListsRef = this.afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME);
        const colRef = this.todoListsRef.ref;
        const sharedListRef = this.afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME).ref;
    
        const ownedListSnap$ = from(colRef.where('owner', '==', this.user.uid).get());
        const sharedListSnap$ = from(sharedListRef.where('sharedTo', 'array-contains', this.user.publicUid).get());
    
        const finalObs$ = combineLatest(ownedListSnap$, sharedListSnap$).map(data => {
          return data[0].docs.concat(data[1].docs);
        });
    
        const todoLists$: Observable<TodoList[]> = finalObs$.pipe(
          
          map(docs => {
            return docs.map(doc => {
              return doc.data() as TodoList;
            });
          }),
          tap(lists => console.log("Lists fetched : " + JSON.stringify(lists)))
        );
    
        if(this._subToken) {
          this._subToken.unsubscribe();
        }

        this._subToken = todoLists$.subscribe( (tdl: TodoList[]) => {
          this.todoListsSub$.next( tdl );
        });
    
        return todoLists$;
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

    if(this.todoListsRef === null) {
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

    if(this.todoListsRef === null) {
      return null;
    }
    //return this.afs.doc(TodoServiceProvider.TODO_LISTS_DB_NAME + '/' + listKey);
    return this.todoListsRef.doc(listKey);
  }

  public editTodoList(list: TodoList) : Promise<void> {

    if(this.todoListsRef === null) {
      console.log('TodoProvider : editTodoList : ref null : nothing updated');
      return new Promise<void>(() => {});
    }
    console.log('TodoProvider : editTodoList : list=' + JSON.stringify(list));

    return this.getTodoListDoc(list.uuid).update(list);
  }

  public editTodo(listUuid : string, editedItem: TodoItem) : Promise<void> {

    if(this.todoListsRef === null || !editedItem || !listUuid) {
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

    if(this.todoListsRef === null || !listUuid || !uuid) {
      console.log('deleteTodo : invalid args, nothing deleted : ref=' + this.todoListsRef + '; listId=' + listUuid + '; itemIt=' + uuid);
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

    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    return this.getTodoListDoc(listKey).delete()
      .then(() => {
        console.log("List deleted " + listKey);
      })
      .catch(reason => console.log("error while deleting list" + reason));
  }

  public createList(name: string) : Promise<void> {
    
    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : new Array(),
      owner : this.user.uid
    } as TodoList;

    const promise = this.todoListsRef.doc(newList.uuid).set(newList);

    return promise;
  }

  public createItem(listUuid:string, item:TodoItem) : Promise<void> {

    if(this.todoListsRef === null) {
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
