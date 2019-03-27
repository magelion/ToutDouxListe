import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { PublicUser, User, TodoList, FriendRequestState } from '../../app/model/model';
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

      this.todoProvider.getList(this.todoListId).then(todoList => {

        this.todoList = todoList;
      })

      console.log('ShareListPage : user=' + JSON.stringify(this.user));

      const userContactsPromise = this.contactProvider.getContactsPublicUserOfUser(this.user);
      if(userContactsPromise) {
        userContactsPromise.then(contacts => {

          this.contactList = this.getAvailableContacts(contacts);
        });
      }
    }
  }

  private getAvailableContacts(pubUsers : PublicUser[]) : PublicUser[]{

    // Display only confirmed contacts and contact other than the owner
    const filteredUsers = pubUsers.filter(pubUser => {
            
      const correpsondingContact = this.user.contacts.find(contact => {
        return contact.contactId === pubUser.uid;
      });
      if(correpsondingContact && correpsondingContact.state === FriendRequestState.ACCEPTED) {
        
        if(this.todoList.publicOwner !== this.user.publicUid) {
          return correpsondingContact.contactId !== this.todoList.publicOwner;
        }
      }
      else {
        return false;
      }
    });
    return filteredUsers;
  }

  public shareListTo(publicUser: PublicUser) {

    console.log('ShareListPage : publicUser=' + JSON.stringify(publicUser) + '; todoListId=' + this.todoListId);
    if(!this.todoListId) return null;

    console.log('ShareListPage : List=' + JSON.stringify(this.todoList));
    this.todoList.sharedTo.push(publicUser.uid);
    this.todoProvider.editTodoList(this.todoList);

    this.contactList = this.getAvailableContacts(this.contactList);
  }

  public isListSharedToContact(user : PublicUser) : boolean {

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
