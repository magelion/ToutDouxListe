import { Component, OnInit, OnDestroy } from '@angular/core'
import {TodoList} from "./model/model";
import {TodoServiceProvider} from './services/todo-service'

@Component({
    selector: 'todoList',
    templateUrl: './todoList.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

    lists: TodoList[];

    constructor(
        private todoService: TodoServiceProvider
    ) {

    }

    ngOnInit() {
        this.todoService.getList().subscribe(value => {
          this.lists = value;
        });
    }

    ngOnDestroy() {

    }

    selectList (list: TodoList) {

    }

  nbUnfinishedItems(list: TodoList) : number {
    return list.items.filter(value => {
      return !value.complete;
    }).length;
  }
}
