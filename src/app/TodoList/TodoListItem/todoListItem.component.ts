import {Component, OnInit, OnDestroy, Input, OnChanges} from '@angular/core'
import {TodoItem, TodoList} from "../model/model";
import {TodoServiceProvider} from '../services/todo-service';

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoListItem implements OnInit, OnDestroy, OnChanges {

  @Input('todoListId') todoListId?: string;

  list?: TodoList;
  items?: TodoItem[];

  constructor(private todoService: TodoServiceProvider) {
  }

  ngOnChanges(arg: any) {
    this.updateList();
  }

  ngOnInit() {

    this.updateList();
  }

  ngOnDestroy() {

  }

  selectItem (item: TodoItem) {
    console.log("item:" + item.name + ";desc=" + item.desc);
  }
  
  deleteItem (item: TodoItem) {

    if(this.todoListId != null && this.todoListId != undefined) {
      this.todoService.deleteTodo(this.todoListId, item.uuid);
    }
  }

  updateList() {

    console.log('todoListItem, id=' + this.todoListId);

    if(this.todoListId != null && this.todoListId != undefined) {

      this.todoService.getList(this.todoListId).subscribe(value => {
        this.list = value;
        this.items = value.items;
      });
    }
  }
}
