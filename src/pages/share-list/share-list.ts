import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { PublicUser, User, TodoList } from '../../app/TodoList/model/model';
import { ContactProvider } from '../../providers/contact/contact';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';

@IonicPage()
@Component({
  selector: 'page-share-list',
  templateUrl: 'share-list.html',
})
export class ShareListPage {

  private todoListId: string;
  private contactList: PublicUser[] = new Array();
  private user: User;
  private todoList : TodoList;

  constructor(private navParams: NavParams, private contactProvider: ContactProvider, private authProvider: AuthenticationProvider, private todoProvider: TodoServiceProvider) {

    this.authProvider.getUserObs().subscribe(user => this.user = user);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShareListPage');
    this.todoListId = this.navParams.get('listId');

    if (this.user && this.contactProvider) {

      const subToken = this.todoProvider.getList(this.todoListId).subscribe(todoList => {

        this.todoList = todoList;
        subToken.unsubscribe();
      })

      console.log('ShareListPage : user=' + JSON.stringify(this.user));
      this.contactProvider.getPublicUser(this.user.contacts[0]);

      const userContactsPromise = this.contactProvider.getContactsOfUser(this.user);
      if(userContactsPromise) {
        userContactsPromise.then(contacts => {
          this.contactList = this.getAvailableContacts(contacts);
        });
      }
    }
  }

  private getAvailableContacts(contacts : PublicUser[]) : PublicUser[]{

    return contacts;
    // return contacts.filter((user) => {
    //   return this.todoList.sharedTo.indexOf(user.uid);
    // })
  }

  public shareListTo(publicUser: PublicUser) {

    console.log('ShareListPage : publicUser=' + JSON.stringify(publicUser) + '; todoListId=' + this.todoListId);
    if(!this.todoListId) return null;

    console.log('ShareListPage : List=' + JSON.stringify(this.todoList));
    this.todoList.sharedTo.push(publicUser.uid);
    this.todoProvider.editTodoList(this.todoList);

    this.contactList = this.getAvailableContacts(this.contactList);
  }

  public isAdded(user : PublicUser) : boolean {

    if(!this.todoList) {
      return false;
    }
    else {
      return this.todoList.sharedTo.indexOf(user.uid) > -1;
    }
  }

  public unshareListTo(publicUser : PublicUser) {

    console.log('unshareListTo : publicUser=' + JSON.stringify(publicUser) + '; todoListId=' + this.todoListId);
    if(!this.todoListId) return null;

    console.log('unshareListTo : List=' + JSON.stringify(this.todoList));

    const ind = this.todoList.sharedTo.indexOf(publicUser.uid);
    if(ind < 0) return null;
    console.log('unshareListPage : index=' + ind);
    this.todoList.sharedTo.splice(ind, 1);
    this.todoProvider.editTodoList(this.todoList);

    this.contactList = this.getAvailableContacts(this.contactList);
  }
}
