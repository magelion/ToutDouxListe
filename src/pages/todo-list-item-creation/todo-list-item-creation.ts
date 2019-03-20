import { Component, OnChanges } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TodoList, TodoItem } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { v4 as uuid } from 'uuid';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  formValidation: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams, private todoService: TodoServiceProvider, public viewCtrl: ViewController) {

    this.formValidation = new FormGroup(({
      name: new FormControl('', Validators.required),
      desc: new FormControl('')
    }));
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

      this.todoService.getList(this.todoListId).then(
        value => {
          this.list = value;
          console.log("Item creation page : list get : " + JSON.stringify(this.list));
        },
        err => {
          console.log("Item creation page : error on getting list : " + err);
        }
      );
    }
  }

  createTodoItemCommand() {

    if(this.todoListId && this.list && this.name) {
      
      let item : TodoItem = {
        uuid: uuid(),
        name: this.name,
        complete: false
      };

      this.desc ? item.desc = this.desc : item.desc = '';
      
      this.todoService.createItem(this.list.uuid, item).then(res => {
        this.viewCtrl.dismiss();
      });
    }
  }
}
