import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { ToutDouxListeApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { TodoComponent } from './TodoList/todoList.component';
import { TodoServiceProvider } from '../providers/todo/todo-serviceProvider';
import { UtilitiesService } from './utilities/UtilitiesService';
import { TodoItemsPage } from "../pages/todo-items/todo-items";
import { TodoListItem } from './TodoList/TodoListItem/todoListItem.component';
import { TodoListItemCreationPageModule } from '../pages/todo-list-item-creation/todo-list-item-creation.module';
import { TodoListItemCreationPage } from '../pages/todo-list-item-creation/todo-list-item-creation';
import { AuthenticationPageModule } from '../pages/authentication/authentication.module';

import { HttpModule } from '@angular/http';

import { GooglePlus } from '@ionic-native/google-plus/ngx';      
import firebase from 'firebase';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AuthenticationProvider } from '../providers/authentication/authentication';
import { AcountPage } from '../pages/acount/acount';

export const firebaseConfig = {
  apiKey: "AIzaSyABNzMT2kEHr7fq3ONtZROlj_3Bh8GRC0M",
  authDomain: "toutdouxliste-1759c.firebaseapp.com",
  databaseURL: "https://toutdouxliste-1759c.firebaseio.com",
  projectId: "toutdouxliste-1759c",
  storageBucket: "toutdouxliste-1759c.appspot.com",
  messagingSenderId: "262426639490",
};
firebase.initializeApp(firebaseConfig);

@NgModule({
  declarations: [
    ToutDouxListeApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    TodoComponent,
    TodoListItem,
    TodoItemsPage,
    AcountPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    //AngularFirestoreModule.enablePersistence(), // Caching for offline use
    IonicModule.forRoot(ToutDouxListeApp),
    TodoListItemCreationPageModule,
    AuthenticationPageModule
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
    TodoListItemCreationPage,
    AcountPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    TodoServiceProvider,
    UtilitiesService,
    GooglePlus,
    AuthenticationProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ],
})
export class AppModule {}
