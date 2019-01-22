import { Component, OnInit, OnDestroy } from '@angular/core'
import { TodoList } from "./model/model";
import { TodoServiceProvider } from './services/todo-service'
import { NavController, AlertController } from "ionic-angular";
import { TodoItemsPage } from "../../pages/todo-items/todo-items";

@Component({
  selector: 'todoList',
  templateUrl: './todoList.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

  lists: TodoList[];

  constructor(
    private todoService: TodoServiceProvider,
    private navController: NavController,
    private alertCtrl: AlertController
  ) {

  }

  ngOnInit() {
    this.todoService.getLists().subscribe(value => {
      this.lists = value;
    });
  }

  ngOnDestroy() {

  }

  selectList(list: TodoList) {
    this.navController.push(TodoItemsPage, {
      uuid: list.uuid
    });
  }

  deleteList(list: TodoList) {
    this.todoService.deleteList(list.uuid);
  }

  nbUnfinishedItems(list: TodoList): number {
    return list.items.filter(value => {
      return !value.complete;
    }).length;
  }

  createList(name: string) {
    this.todoService.createList(name);
  }

  createListCommand() {
    const prompt = this.alertCtrl.create({
      title: 'Create List',
      message: 'Enter list name',
      inputs: [
        {
          name : 'name',
          placeholder : 'My awsome list'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
            this.createList(data.name);
          }
        }
      ]
    });
    prompt.present();
  }
}
