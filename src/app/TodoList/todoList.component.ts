import { Component, OnInit, OnDestroy } from '@angular/core'
import { TodoList } from "./model/model";
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider'
import { NavController, AlertController } from "ionic-angular";
import { TodoItemsPage } from "../../pages/todo-items/todo-items";
import { Observable } from 'rxjs';

@Component({
  selector: 'todoList',
  templateUrl: './todoList.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

  lists: Observable<TodoList[]>;

  constructor(
    public todoService: TodoServiceProvider,
    private navController: NavController,
    private alertCtrl: AlertController
  ) {

  }

  ngOnInit() {
    this.lists = this.todoService.getLists();
  }

  ngOnDestroy() {

  }

  selectList(list: TodoList) {
    this.navController.push(TodoItemsPage, {
      uuid: list.uuid
    });
  }

  deleteList(list: TodoList) {
    this.todoService.deleteList(list.key);
  }

  nbUnfinishedItems(list: TodoList): number {

    if(list.items) {
      return list.items.filter(value => {
        return !value.complete;
      }).length;
    }
    else {
      return 0;
    }
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



  editListCommand(list: TodoList) {
    const prompt = this.alertCtrl.create({
      title: 'Edit List',
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
            list.name = data.name;
            this.todoService.editTodoList(list);
          }
        }
      ]
    });
    prompt.present();
  }
}
