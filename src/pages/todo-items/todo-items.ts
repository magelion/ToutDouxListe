import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Constants} from "../../app/utilities/Constants";
import { TodoListItemCreationPage } from '../todo-list-item-creation/todo-list-item-creation';
import { Subscription } from 'rxjs';
import { TodoList } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { ShareListPage } from '../share-list/share-list';

@IonicPage()
@Component({
  selector: 'page-todo-items',
  templateUrl: 'todo-items.html',
})
export class TodoItemsPage implements OnInit, OnDestroy{
  
  private listId?:string;
  private list: TodoList;

  private _listsSubToken: Subscription;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private todoListProvider: TodoServiceProvider) {
    console.log('constructing todo item page');
    
    this.listId = this.navParams.get(Constants.TODOITEM_ID_NAME);

    // Get notified on list change
    this._listsSubToken = this.todoListProvider.getTodoListsObs().subscribe(lists => {
      this.updateList();
    })
  }

  private updateList() {

    console.log('updateList : listId=' + this.listId);
    this.todoListProvider.getList(this.listId).then(list => {
      this.list = list;
      console.log('list = ' + JSON.stringify(this.list));
    })
    .catch(error => {
      console.error('todo-item page : error on list update : ' + JSON.stringify(error));
    });
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad TodoItemsPage id=' + this.listId);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    
    if(this._listsSubToken) {
      this._listsSubToken.unsubscribe();
    }
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
