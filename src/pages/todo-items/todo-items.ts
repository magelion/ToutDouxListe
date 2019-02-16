import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Constants} from "../../app/utilities/Constants";
import { TodoListItemCreationPage } from '../todo-list-item-creation/todo-list-item-creation';
import { ShareListPage } from '../share-list/share-list';

@IonicPage()
@Component({
  selector: 'page-todo-items',
  templateUrl: 'todo-items.html',
})
export class TodoItemsPage {

  private listId?:string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log('constructing todo item page');  
  }

  ionViewDidLoad() {
    this.listId = this.navParams.get(Constants.TODOITEM_ID_NAME);
    console.log('ionViewDidLoad TodoItemsPage id=' + this.listId);
  }

  createListItemCommand() {
    this.navCtrl.push(TodoListItemCreationPage, {
      uuid: this.listId
    });
  }

  shareList() {
    this.navCtrl.push(ShareListPage, {
      uuid: this.listId
    });
  }
}
