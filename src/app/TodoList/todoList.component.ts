import { Component, OnInit, OnDestroy } from '@angular/core'
import {TodoList} from "./model/model";
import {TodoServiceProvider} from './services/todo-service'
import {NavController} from "ionic-angular";
import {TodoItemsPage} from "../../pages/todo-items/todo-items";

@Component({
    selector: 'todoList',
    templateUrl: './todoList.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

    lists: TodoList[];

    constructor(
        private todoService: TodoServiceProvider,
        private navController: NavController
    ) {

    }

    ngOnInit() {
        this.todoService.getLists().subscribe(value => {
          this.lists = value;
        });
    }

    ngOnDestroy() {

    }

    selectList (list: TodoList) {
      this.navController.push(TodoItemsPage, {
        uuid: list.uuid
      });
    }

  nbUnfinishedItems(list: TodoList) : number {
    return list.items.filter(value => {
      return !value.complete;
    }).length;
  }
}
