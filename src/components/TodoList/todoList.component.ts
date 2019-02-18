import { Component, Input } from '@angular/core'
import { TodoList } from "../../app/TodoList/model/model";
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider'
import { NavController, AlertController } from "ionic-angular";
import { TodoItemsPage } from "../../pages/todo-items/todo-items";

@Component({
  selector: 'todoList',
  templateUrl: './todoList.component.html'
})
export class TodoComponent {

  @Input() list?: TodoList;

  constructor(
    public todoService: TodoServiceProvider,
    private navController: NavController,
    private alertCtrl: AlertController
  ) {

  }

  selectList(list: TodoList) {
    console.log('selectList: uuid=', list.uuid);
    this.navController.push(TodoItemsPage, {
      uuid: list.uuid
    });
  }

  deleteList(list: TodoList) {
    this.todoService.deleteList(list.uuid);
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
          handler: () => {
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
