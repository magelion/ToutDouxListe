import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TodoItemEditPage } from './todo-item-edit';

@NgModule({
  declarations: [
    TodoItemEditPage,
  ],
  imports: [
    IonicPageModule.forChild(TodoItemEditPage),
  ],
})
export class TodoItemEditPageModule {}
