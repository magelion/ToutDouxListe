import { Injectable } from '@angular/core';
import {TodoItem, TodoList, User} from "../../app/TodoList/model/model";
import {Observable, BehaviorSubject} from "rxjs";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map, tap, take } from 'rxjs/operators';
import { AuthenticationProvider } from '../authentication/authentication';

@Injectable()
export class TodoServiceProvider {

  public static readonly TODO_LISTS_DB_NAME:string = 'TodoLists';

  private todoListsRef: AngularFirestoreCollection<TodoList>;
  private todoLists:Observable<TodoList[]>;
  private todoListsSub$: BehaviorSubject<Observable<TodoList[]>>;
  private user:User;

  constructor(private afs: AngularFirestore, authProvider: AuthenticationProvider) {
    console.log('Hello TodoServiceProvider Provider');

    this.todoListsRef = null;
    this.todoLists = null;
    this.todoListsSub$ = new BehaviorSubject(null);
    authProvider.getUser().subscribe(user => {
      
      if(user != null) {
        this.user = user;
        console.log('TodoService : user = ' + JSON.stringify(user));
        this.todoListsRef = null;
        this.todoListsRef = afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME, 
          ref => ref.where('owner', '==', user.uid));

        this.todoListsSub$.next(this.updateLists());
      }
    });
  }

  public getTodoListsSub() : Observable<Observable<TodoList[]>> {
    return this.todoListsSub$.asObservable();
  }

  private updateLists() : Observable<TodoList[]> {

    console.log('updateList called');
    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    this.todoLists = this.todoListsRef.snapshotChanges().pipe(

      map(actions => actions.map(a => {

        const data = a.payload.doc.data() as TodoList;
        const key = a.payload.doc.id;

        if(!data.items) {
          data.items = new Array();
        }

        data.uuid = key;

        return { key, ...data };
      })),
      tap(lists => console.log("Lists fetched : " + JSON.stringify(lists)))
    );
    return this.todoLists;
  }

  public getLists(): Observable<TodoList[]> {

    // For some reasons, just returning the observable is not enough because 
    // is won't give any more event after some time
    return this.updateLists();
  }

  public getList(key: string): Observable<TodoList>{

    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    return this.getTodoListDoc(key).valueChanges() as Observable<TodoList>;
  }

  private getTodoListDoc(listKey: string) : AngularFirestoreDocument<TodoList> {

    if(this.todoListsRef === null) {
      return null;
    }
    return this.afs.doc(`${TodoServiceProvider.TODO_LISTS_DB_NAME}/${listKey}`);
  }

  public editTodoList(list: TodoList) : Promise<void> {

    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    return this.getTodoListDoc(list.uuid).update(list);
  }

  public editTodo(listUuid : string, editedItem: TodoItem) : Observable<Promise<void>> {

    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === editedItem.uuid);
        todoList.items[index] = editedItem;
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteTodo(listUuid: string, uuid: String) : Observable<Promise<void>> {

    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === uuid);
        todoList.items.splice(index, 1);
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteList(listKey: string) : Promise<void> {

    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    return this.getTodoListDoc(listKey).delete()
      .then(value => console.log("List deleted " + listKey))
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

    return this.todoListsRef.add(newList)
    .then(newListRef => {
      
      newList.uuid = newListRef.id;
      this.editTodoList(newList);
    })
    .catch(error => {
      console.log("CreateList error : " + JSON.stringify(error));
    });
  }

  public createItem(listUuid:string, item:TodoItem) : Observable<Promise<void>> {

    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    return this.getList(listUuid).pipe(
      
      take(1), // Avoid loop creation
      tap (todoList => console.log('Creating item (' + JSON.stringify(item) + ')' + '\nin list(uuid=' + listUuid + ': ' +  JSON.stringify(todoList))),
      map(todoList => {
        if(!todoList.items) {
          todoList.items = new Array();
        }
        todoList.items.push(item);
        return this.editTodoList(todoList);   
      }) 
    );
  }
}
