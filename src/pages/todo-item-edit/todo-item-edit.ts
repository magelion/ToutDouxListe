import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TodoList, TodoItem } from '../../app/TodoList/model/model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';

@IonicPage()
@Component({
  selector: 'page-todo-item-edit',
  templateUrl: 'todo-item-edit.html',
})
export class TodoItemEditPage {

  itemId?: string;
  item?: TodoItem;
  listId : string;

  name:string;
  desc:string;

  formValidation: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private todoService: TodoServiceProvider, public viewCtrl: ViewController) {

    this.formValidation = new FormGroup(({
      name: new FormControl('', Validators.required),
      desc: new FormControl('')
    }));
  }

  ionViewDidLoad() {
    this.itemId = this.navParams.get('itemId');
    this.listId = this.navParams.get('listId');

    console.log('ionViewDidLoad TodoListItemEditPage with itemId=' + this.itemId + ' and listId=' + this.listId);
    this.updateItem();
  }

  ngOnChanges(arg: any) {
    this.updateItem();
  }

  public updateItem() {

    if(this.itemId != null && this.itemId != undefined && this.listId != null && this.listId != undefined) {

      this.item = await this.todoService.getTodoItem(this.listId,this.itemId);

      /*const subToken = this.todoService.getList(this.todoListId).subscribe(
        value => {
          this.list = value;
          console.log("Item edit page : list get : " + JSON.stringify(this.list));
          subToken.unsubscribe();
        },
        err => {
          console.log("Item edit page : error on getting list : " + err);
          subToken.unsubscribe();
        }
      );*/
    }
  }

}
