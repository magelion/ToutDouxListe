import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TodoItemsPage } from './todo-items';

@NgModule({
  declarations: [
    TodoItemsPage,
  ],
  imports: [
    IonicPageModule.forChild(TodoItemsPage),
  ],
})
export class TodoItemsPageModule {}
