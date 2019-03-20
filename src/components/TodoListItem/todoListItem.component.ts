import {Component, Input} from '@angular/core';
import { TodoList, TodoItem } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { NavController } from 'ionic-angular';
import { TodoItemEditPage } from '../../pages/todo-item-edit/todo-item-edit';

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoListItem {

  @Input('list') list?: TodoList;
  @Input('item') item?: TodoItem;

  private isDescShown: boolean;

  constructor(private todoService: TodoServiceProvider, private navCtrl: NavController) {
  
    console.log('TodoListItemComponent : list=' + JSON.stringify(this.list) + "; item=" + JSON.stringify(this.item));
    this.isDescShown = false;
  }
  
  public deleteItem (): void {

    if(this.list) {
      console.log('TodoListItemComponent : deleteItem : item=' + JSON.stringify(this.item) + '; list=' + JSON.stringify(this.list));
      this.todoService.deleteTodo(this.list.uuid, this.item.uuid);
    }
  }

  public editItem(): void {

    this.navCtrl.push(TodoItemEditPage, {
      itemId: this.item.uuid,
      listId: this.list.uuid
    });
  }

  public completeItem(): void {

    if(this.item && this.list) {

      console.log('TodoListItemComponent : completeItem : item=' + JSON.stringify(this.item) + '; listId=' + JSON.stringify(this.list.uuid));
      this.item.complete = !this.item.complete;
      this.todoService.editTodo(this.list.uuid, this.item);
    }
  }

  public toogleDesc(): void {
    this.isDescShown = ! this.isDescShown;
  }
}
