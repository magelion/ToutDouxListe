/*import { Injectable } from '@angular/core';
import {TodoItem, TodoList} from "../../app/TodoList/model/model";
import {Observable} from "rxjs";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { map, tap } from 'rxjs/operators';
import { AuthenticationProvider } from '../authentication/authentication';*/

/**
 * DEPRECATED
 * Real Time Database version.
 * DO NOT USE THIS.
 * Instead go check out todo-serviceProvider.ts
 */
/*@Injectable()
export class TodoServiceProvider {

  private static readonly TODO_LIST_DB_NAME:string = "/TodoLists";

  private todoListsRef:AngularFireList<TodoList>;
  private todoLists:Observable<TodoList[]>

  constructor(afd: AngularFireDatabase, authProvider: AuthenticationProvider) {
    console.log('Hello TodoServiceProvider Provider');

    authProvider.getUser().subscribe(user => {

      this.todoListsRef = afd.list(user.uid + '/' + TodoServiceProvider.TODO_LIST_DB_NAME);
      this.todoLists = this.todoListsRef.snapshotChanges().pipe(
        map(changes => 
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );
  
      this.todoLists.subscribe(value => {
  
        value.forEach(list => {
          
        // Initilize any empty list
          if(!list.items) {
            list.items = new Array();
          }
        });
        console.log(JSON.stringify(value));
      });
    })
  }

  public getListsObservable(): Observable<TodoList[]> {
    return this.todoLists;
  }

  public getList(uuid:String): Observable<TodoList>{

    return this.todoLists.pipe(
      map(lists => lists.find(list => list.uuid === uuid))
    );
  }

  public getTodos(listUuid:String) : Observable<TodoItem[]> {
    //return Observable.of(this.thisTodoLists.find(d => d.uuid == uuid).items);
    return this.getList(listUuid).pipe(
      map(list => list.items)
    );
  }

  public editTodoList(list: TodoList) : Promise<void> {

    return this.todoListsRef.update(list.key, list);
  }

  public editTodo(listUuid : String, editedItem: TodoItem) : Observable<Promise<void>> {

    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === editedItem.uuid);
        todoList.items[index] = editedItem;
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteTodo(listUuid: String, uuid: String) : Observable<Promise<void>> {

    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === uuid);
        todoList.items.splice(index, 1);
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteList(listUuid: String) : Observable<Promise<void>> {

    return this.getList(listUuid).pipe(
      map (todoList => {
        return this.todoListsRef.remove(todoList.key);
      })
    );
  }

  public createList(name: string) : Promise<void> {
    
    const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : new Array()
    } as TodoList;

    return this.todoListsRef.push(newList).then(newListRef => {
      
      newList.key = newListRef.key;
      this.editTodoList(newList);
    });
  }

  public createItem(listUuid:string, item:TodoItem) : Observable<Promise<void>> {

    //let list = this.thisTodoLists.find(d => d.uuid == listUuid);
    //list.items.push(item);
    return this.getList(listUuid).pipe(
      
      tap (todoList => console.log('Creating item (' + JSON.stringify(item) + ')' + '\nin list : '  + JSON.stringify(todoList))),
      map(todoList => {
        if(!todoList.items) {
          todoList.items = new Array();
        }
        todoList.items.push(item);
        return this.editTodoList(todoList);   
      }) 
    );
  }
}*/
