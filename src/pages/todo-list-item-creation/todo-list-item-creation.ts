import { Component, OnChanges } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TodoList } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../app/TodoList/services/todo-service';
import { v4 as uuid } from 'uuid';

@IonicPage()
@Component({
  selector: 'page-todo-list-item-creation',
  templateUrl: 'todo-list-item-creation.html',
})
export class TodoListItemCreationPage implements OnChanges {

  todoListId?: string;
  list?: TodoList;

  name:string;
  desc:string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private todoService: TodoServiceProvider, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    this.todoListId = this.navParams.get('uuid');
    console.log('ionViewDidLoad TodoListItemCreationPage with uuid=' + this.todoListId);
    this.updateList();
  }

  ngOnChanges(arg: any) {
    this.updateList();
  }

  updateList() {

    if(this.todoListId != null && this.todoListId != undefined) {

      this.todoService.getList(this.todoListId).subscribe(value => {
        this.list = value;
      });
    }
  }

  createTodoItemCommand() {

    if(this.todoListId != null && this.todoListId != undefined) {
      
      let item = {
        uuid: uuid(),
        name: this.name,
        desc: this.desc,
        complete: false,
      };
      this.todoService.createItem(this.list.uuid, item).subscribe();

      this.viewCtrl.dismiss();
    }
  }
}
