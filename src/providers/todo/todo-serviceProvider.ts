import { Injectable } from '@angular/core';
import {TodoItem, TodoList} from "../../app/TodoList/model/model";
import {Observable} from "rxjs";
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

  constructor(private afs: AngularFirestore, private authProvider: AuthenticationProvider) {
    console.log('Hello TodoServiceProvider Provider');

    if(authProvider.isConnected()) {
      authProvider.getUser().subscribe(user => {
        this.todoListsRef = afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME);
        this.updateLists();
      });
    }
  }

  private updateLists() : Observable<TodoList[]> {
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

    return this.getTodoListDoc(key).valueChanges() as Observable<TodoList>;
  }

  private getTodoListDoc(listKey: string) : AngularFirestoreDocument<TodoList> {

    return this.afs.doc(`${TodoServiceProvider.TODO_LISTS_DB_NAME}/${listKey}`);
  }

  public editTodoList(list: TodoList) : Promise<void> {

    return this.getTodoListDoc(list.key).update(list);
  }

  public editTodo(listUuid : string, editedItem: TodoItem) : Observable<Promise<void>> {

    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === editedItem.uuid);
        todoList.items[index] = editedItem;
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteTodo(listUuid: string, uuid: String) : Observable<Promise<void>> {

    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === uuid);
        todoList.items.splice(index, 1);
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteList(listKey: string) : Promise<void> {

    return this.getTodoListDoc(listKey).delete()
      .then(value => console.log("List deleted " + listKey))
      .catch(reason => console.log("error while deleting list" + reason));
  }

  public createList(name: string) : Promise<void> {
    
    const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : new Array()
    } as TodoList;

    return this.todoListsRef.add(newList)
    .then(newListRef => {
      
      newList.uuid = newListRef.id;
      newList.key = newListRef.id;
      this.editTodoList(newList);
    })
    .catch(error => {
      console.log("CreateList error : " + JSON.stringify(error));
    });
  }

  public createItem(listUuid:string, item:TodoItem) : Observable<Promise<void>> {

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
