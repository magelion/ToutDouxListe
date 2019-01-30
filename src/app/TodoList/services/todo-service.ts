import { Injectable } from '@angular/core';
import {TodoItem, TodoList} from "../model/model";
import {Observable} from "rxjs";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { map } from 'rxjs/operators';

@Injectable()
export class TodoServiceProvider {

  private static readonly TODO_LIST_DB_NAME:string = "/TodoLists";

  data:TodoList[] = [
    {
      uuid : "a351e558-29ce-4689-943c-c3e97be0df8b",
      name : "List 1",
      items : [
        {
          uuid : "7dc94eb4-d4e9-441b-b06b-0ca29738c8d2",
          name : "Item 1-1",
          desc : "Description for 1",
          complete : false
        },
        {
          uuid : "20c09bdd-1cf8-43b0-9111-977fc4d343bc",
          name : "Item 1-2",
          complete : false
        },
        {
          uuid : "bef88351-f4f1-4b6a-965d-bb1a4fa3b444",
          name : "Item 1-3",
          complete : true
        }
      ]
    },
    { uuid : "90c04913-c1a2-47e5-9535-c7a430cdcf9c",
      name : "List 2",
      items : [
        {
          uuid : "72849f5f-2ef6-444b-98b0-b50fc019f97c",
          name : "Item 2-1",
          complete : false
        },
        {
          uuid : "80d4cbbe-1c64-4603-8d00-ee4932045333",
          name : "Item 2-2",
          complete : true
        },
        {
          uuid : "a1cd4568-590b-428b-989d-165f22365485",
          name : "Item 2-3",
          complete : true
        }
      ]
    }
  ];

  private todoListsRef:AngularFireList<TodoList>;
  private todoLists:Observable<TodoList[]>

  constructor(private afd: AngularFireDatabase) {
    console.log('Hello TodoServiceProvider Provider');
    this.todoListsRef = afd.list(TodoServiceProvider.TODO_LIST_DB_NAME);
    
    this.todoLists = this.todoListsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.todoLists.subscribe(value => {

      console.log(JSON.stringify(value));
    });
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

  public editTodo(listUuid : String, editedItem: TodoItem)/*: Observable<TodoItem>*/ {
    /*let items = this.thisTodoLists.find(d => d.uuid == listUuid).items;
    let index = items.findIndex(value => value.uuid == editedItem.uuid);
    items[index] = editedItem;*/

    /*this.getList(listUuid).pipe(
      map(items => {
        items.items.find(item => item.uuid === editedItem.uuid) = editedItem
      })
    )*/
  }

  public deleteTodo(listUuid: String, uuid: String) {
    /*let items = this.thisTodoLists.find(d => d.uuid == listUuid).items;
    let index = items.findIndex(value => value.uuid == uuid);
    if (index != -1) {
      items.splice(index,1);
    }*/
  }

  public deleteList(listUuid: String) {
    /*let index = this.thisTodoLists.findIndex(value => value.uuid == listUuid);
    console.log("list to delete index : " + index);
    if(index != -1) {
      this.thisTodoLists.splice(index, 1);
    }*/
  }

  public createList(name: string) {
    
    /*const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : []
    } as TodoList;

    console.log("new uuid created : " + newUuid + ";name=" + name);
    this.thisTodoLists.push(newList);
    return this.thisTodoLists;*/
  }

  public createItem(listUuid:string, item:TodoItem) {

    /*let list = this.thisTodoLists.find(d => d.uuid == listUuid);
    list.items.push(item);*/
  }
}
