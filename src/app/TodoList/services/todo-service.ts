import { Injectable } from '@angular/core';
import {TodoItem, TodoList} from "../model/model";
import {Observable} from "rxjs/Observable";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TodoServiceProvider {

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

  constructor() {
    console.log('Hello TodoServiceProvider Provider');
  }

  public getLists(): Observable<TodoList[]> {
    return Observable.of(this.data);
  }

  public getList(uuid:String): Observable<TodoList>{
    return Observable.of(this.data.find(d => d.uuid == uuid));
  }

  public getTodos(uuid:String) : Observable<TodoItem[]> {
    return Observable.of(this.data.find(d => d.uuid == uuid).items);
  }


  public editTodo(listUuid : String, editedItem: TodoItem) {
    let items = this.data.find(d => d.uuid == listUuid).items;
    let index = items.findIndex(value => value.uuid == editedItem.uuid);
    items[index] = editedItem;
  }

  public deleteTodo(listUuid: String, uuid: String) {
    let items = this.data.find(d => d.uuid == listUuid).items;
    let index = items.findIndex(value => value.uuid == uuid);
    if (index != -1) {
      items.splice(index,1);
    }
  }

  public deleteList(listUuid: String) {
    let index = this.data.findIndex(value => value.uuid == listUuid);
    console.log("list to delete index : " + index);
    if(index != -1) {
      this.data.splice(index, 1);
    }
  }

  public createList(name: string) {
    
    const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : []
    } as TodoList;

    console.log("new uuid created : " + newUuid + ";name=" + name);
    this.data.push(newList);
  }

  public createItem(listUuid:string, item:TodoItem) {

    let list = this.data.find(d => d.uuid == listUuid);
    list.items.push(item);
  }
}
