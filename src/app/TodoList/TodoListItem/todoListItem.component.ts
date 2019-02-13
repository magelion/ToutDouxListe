import {Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges} from '@angular/core'
import {TodoItem, TodoList} from "../model/model";
import { TodoServiceProvider } from '../../../providers/todo/todo-serviceProvider';
import { Observable } from 'rxjs';

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoListItem implements OnInit, OnDestroy, OnChanges {

  @Input('todoListId') todoListId?: string;

  list$?: Observable<TodoList>;

  constructor(private todoService: TodoServiceProvider) {
  }

  ngOnChanges(changeRecord: SimpleChanges) {

    console.log('change=' + JSON.stringify(changeRecord));
    if(changeRecord.todoListId !== undefined) {

      this.todoListId = changeRecord.todoListId.currentValue;
      this.updateList();
    }
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
      this.todoService.deleteTodo(this.todoListId, item.uuid).subscribe().unsubscribe();
    }
  }

  dataChanged(newObj: TodoItem, listId: string) {

    if (!listId || !newObj) return;

    console.log('changed : ' + JSON.stringify(newObj));
    this.todoService.editTodo(listId, newObj);
  }

  updateList() {


    console.log('This todoListId=' + this.todoListId);
    if(this.todoListId !== null && this.todoListId !== undefined) {

      this.list$ = this.todoService.getList(this.todoListId);
    }
  }
}
