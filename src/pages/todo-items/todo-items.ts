import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TodoComponent } from "../../app/TodoList/todoList.component";
import {Constants} from "../../app/utilities/Constants";

@IonicPage()
@Component({
  selector: 'page-todo-items',
  templateUrl: 'todo-items.html',
})
export class TodoItemsPage {

  private listId:string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TodoItemsPage');
    this.listId = this.navParams.get(Constants.TODOITEM_ID_NAME);
  }

}
