import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TodoItemEditPage } from './todo-item-edit';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    TodoItemEditPage,
  ],
  imports: [
    IonicPageModule.forChild(TodoItemEditPage),
    ComponentsModule
  ],
})
export class TodoItemEditPageModule {}
