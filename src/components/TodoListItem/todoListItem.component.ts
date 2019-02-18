import {Component, Input} from '@angular/core';
import { TodoList, TodoItem } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoListItem {

  @Input('list') list?: TodoList;
  @Input('item') item?: TodoItem;

  constructor(private todoService: TodoServiceProvider) {
  
    console.log('TodoListItemComponent : list=' + JSON.stringify(this.list) + "; item=" + JSON.stringify(this.item));
  }
  
  public deleteItem () {

    console.log('TodoListItemComponent : deleteItem : item=' + JSON.stringify(this.item) + '; list=' + JSON.stringify(this.list));
    const subToken = this.todoService.deleteTodo(this.list.uuid, this.item.uuid).subscribe(res => {
      res.then(val => {subToken.unsubscribe()});
    })
    // if(this.todoListId != null && this.todoListId != undefined) {
    //   console.log('deleting : ' + JSON.stringify(item));
    //   this.todoService.deleteTodo(this.todoListId, item.uuid).subscribe().unsubscribe();
    // }
  }

  private dataChanged($event) {

    if (!this.list || !this.item) return;

    console.log('changed : ' + JSON.stringify(this.item));

    const subToken = this.todoService.editTodo(this.list.uuid, this.item).subscribe(res => {
      res.then(() => subToken.unsubscribe());
    });
  }

  /*updateList() {


    console.log('This todoListId=' + this.todoListId);
    if(this.todoListId !== null && this.todoListId !== undefined) {

      this.list$ = this.todoService.getList(this.todoListId);
    }
  }*/
}
