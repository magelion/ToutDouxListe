import { Component, OnInit, OnDestroy } from '@angular/core'
import {TodoItem, TodoList} from "./model/model";
import {Observable} from "rxjs/Observable";
import {TodoServiceProvider} from './services/todo-service'

@Component({
    selector: 'todo',
    templateUrl: './todoList.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

    items: TodoList[];

    constructor(
        private todoService: TodoServiceProvider
    ) {

    }

    ngOnInit() {
        this.items = this.todoService.getList().toArray();
    }

    ngOnDestroy() {

    }
}