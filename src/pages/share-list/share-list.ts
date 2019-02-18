import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { PublicUser, User } from '../../app/TodoList/model/model';
import { ContactProvider } from '../../providers/contact/contact';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';

@IonicPage()
@Component({
  selector: 'page-share-list',
  templateUrl: 'share-list.html',
})
export class ShareListPage {

  todoListId: string;
  contactList: PublicUser[] = new Array();
  user: User;

  constructor(private navParams: NavParams, private contactProvider: ContactProvider, private authProvider: AuthenticationProvider, private todoProvider: TodoServiceProvider) {

    this.authProvider.getUserObs().subscribe(user => this.user = user);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShareListPage');
    this.todoListId = this.navParams.get('listId');

    if (this.user && this.contactProvider) {

      console.log('ShareListPage : user=' + JSON.stringify(this.user));
      this.contactProvider.getPublicUser(this.user.contacts[0]);

      const userContactsPromise = this.contactProvider.getContactsOfUser(this.user);
      if(userContactsPromise) {
        userContactsPromise.then(contacts => this.contactList = contacts);
      }
    }
  }

  public shareListTo(publicUser: PublicUser) {

    console.log('ShareListPage : publicUser=' + JSON.stringify(publicUser) + '; todoListId=' + this.todoListId);
    if(!this.todoListId) return null;

    const listObs = this.todoProvider.getList(this.todoListId);

    const subToken = listObs.subscribe(todoList => {

      console.log('ShareListPage : List=' + JSON.stringify(todoList));
      todoList.sharedTo.push(publicUser.uid);
      this.todoProvider.editTodoList(todoList);
      subToken.unsubscribe();
    })
  }
}
