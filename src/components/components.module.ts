import { NgModule } from '@angular/core';
import { ContactListComponent } from './contact-list/contact-list';
import { TodoListItem } from './TodoListItem/todoListItem.component';
import { TodoComponent } from './TodoList/todoList.component';
import { TodoServiceProvider } from '../providers/todo/todo-serviceProvider';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { ContactProvider } from '../providers/contact/contact';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { ContactComponent } from './contact/contact';
import { ItemEditComponent } from './item-edit/item-edit';

@NgModule({
	declarations: [
		ContactListComponent,
		TodoListItem,
		TodoComponent,
    	ContactComponent,
    ItemEditComponent
	],
	imports: [
		CommonModule,
		IonicPageModule.forChild(ComponentsModule),
	],
	providers: [
		TodoServiceProvider,
		AuthenticationProvider,
		ContactProvider
	],
	exports: [
		ContactListComponent,
		TodoListItem,
		TodoComponent,
    	ContactComponent,
    ItemEditComponent
	]
})
export class ComponentsModule {}
