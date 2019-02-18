import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Constants} from "../../app/utilities/Constants";
import { TodoListItemCreationPage } from '../todo-list-item-creation/todo-list-item-creation';
import { ShareListPage } from '../share-list/share-list';
import { Observable } from 'rxjs';
import { TodoList } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';

@IonicPage()
@Component({
  selector: 'page-todo-items',
  templateUrl: 'todo-items.html',
})
export class TodoItemsPage {

  private listId?:string;
  private list$?: Observable<TodoList>
  private list: TodoList

  constructor(public navCtrl: NavController, public navParams: NavParams, private todoListProvider: TodoServiceProvider) {
    console.log('constructing todo item page');

    this.listId = this.navParams.get(Constants.TODOITEM_ID_NAME);

    // Get notified on list change
    this.todoListProvider.getTodoListsSub().subscribe(lists => {

      
      this.list$ = this.todoListProvider.getList(this.listId);
      this.list$.subscribe(list => {
        this.list = list;
        console.log('list = ' + JSON.stringify(this.list));
      });
    })
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad TodoItemsPage id=' + this.listId + '; list$=' + JSON.stringify(this.list$));
  }

  public createListItemCommand() {
    this.navCtrl.push(TodoListItemCreationPage, {
      uuid: this.listId
    });
  }

  public shareList() {
    this.navCtrl.push(ShareListPage, {
      listId: this.listId
    });
  }
}
