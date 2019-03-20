import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TodoItem } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-todo-item-edit',
  templateUrl: 'todo-item-edit.html',
})
export class TodoItemEditPage {

  private itemId?: string;
  public item?: TodoItem;
  private listId : string;
  formValidation: any;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private todoService: TodoServiceProvider, 
    public viewCtrl: ViewController) {
      this.formValidation = new FormGroup(({
        name: new FormControl('', Validators.required),
        desc: new FormControl('')
      }));
  }

  ionViewDidLoad() {
    this.itemId = this.navParams.get('itemId');
    this.listId = this.navParams.get('listId');

    console.log('ionViewDidLoad TodoListItemEditPage with itemId=' + this.itemId + ' and listId=' + this.listId);
    this.getItem();
  }

  ngOnChanges() {
    this.getItem();
  }

  public async getItem() {

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

  public async editItem() {

    if(this.item && this.listId) {

      await this.todoService.editTodo(this.listId, this.item);
      this.viewCtrl.dismiss();
    }
  }

}
