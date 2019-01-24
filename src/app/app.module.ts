import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { ToutDouxListeApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TodoComponent } from './TodoList/todoList.component';
import { TodoServiceProvider } from './TodoList/services/todo-service';
import { UtilitiesService } from './utilities/UtilitiesService';
import {TodoItemsPage} from "../pages/todo-items/todo-items";
import { TodoListItem } from './TodoList/TodoListItem/todoListItem.component';
import { TodoListItemCreationPageModule } from '../pages/todo-list-item-creation/todo-list-item-creation.module';
import { TodoListItemCreationPage } from '../pages/todo-list-item-creation/todo-list-item-creation';

@NgModule({
  declarations: [
    ToutDouxListeApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    TodoComponent,
    TodoListItem,
    TodoItemsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(ToutDouxListeApp),
    TodoListItemCreationPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ToutDouxListeApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    TodoComponent,
    TodoListItem,
    TodoItemsPage,
    TodoListItemCreationPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    TodoServiceProvider,
    UtilitiesService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
