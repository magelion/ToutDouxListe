import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TodoListItemCreationPage } from './todo-list-item-creation';
import { TodoServiceProvider } from '../../app/TodoList/services/todo-serviceProvider';

@NgModule({
  declarations: [
    TodoListItemCreationPage,
  ],
  imports: [
    IonicPageModule.forChild(TodoListItemCreationPage),
  ],
  entryComponents: [
    TodoListItemCreationPage
  ],
  providers: [
    TodoServiceProvider,
  ]
})
export class TodoListItemCreationPageModule {}
