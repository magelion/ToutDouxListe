import {Component, OnInit, OnDestroy, Input} from '@angular/core'
import {TodoItem} from "../model/model";
import {TodoServiceProvider} from "../services/todo-service";
import {Constants} from "../../utilities/Constants";

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

  @Input() todoListId: string;
  @Input() items: TodoItem[];

  constructor(private todoService: TodoServiceProvider) {
  }


  ngOnInit() {

    this.todoService.getTodos(this.todoListId);
  }

  ngOnDestroy() {

  }

  selectItem (item: TodoItem) {
    console.log(item);
  }
}
