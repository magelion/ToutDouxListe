import {Component, OnInit, OnDestroy, Input, OnChanges} from '@angular/core'
import {TodoItem} from "../model/model";
import {TodoServiceProvider} from '../services/todo-service';

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoListItem implements OnInit, OnDestroy, OnChanges {

  @Input('todoListId') todoListId?: string;
  @Input() items?: TodoItem[];

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
    console.log(item);
  }

  updateList() {

    console.log('todoListItem, id=' + this.todoListId)

    if(this.todoListId != null && this.todoListId != undefined) {
      this.todoService.getTodos(this.todoListId).subscribe(value => {
        this.items = value;
      });
    }
  }
}
