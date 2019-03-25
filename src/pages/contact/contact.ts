import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactProvider } from '../../providers/contact/contact';
import { PublicUser, User, Contact, FriendRequestState, FriendRequest } from '../../app/TodoList/model/model';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-addContact',
  templateUrl: 'contact.html'
})
export class AddContactPage {

  formValidation: FormGroup;
  userName: string;
  searchResult?: PublicUser[]
  user: User;
  private contactRequests: FriendRequest[];
  private contactRequestsSubToken : Subscription;

  constructor(public navCtrl: NavController, private contactProvider: ContactProvider, private auth: AuthenticationProvider) {

    this.formValidation = new FormGroup(({
      name: new FormControl('', Validators.required),
    }));

    this.searchResult = [];
    
    auth.getUserObs().subscribe(user => {
      this.user = user
      if(this.contactRequestsSubToken) {
        this.contactRequestsSubToken.unsubscribe();
        this.contactRequestsSubToken = null;
      }

      this.contactRequestsSubToken = this.contactProvider.getContactRequestsObs().subscribe(request => {
        this.contactRequests = request;
      })
    });

    // Filter users already in contact
    contactProvider.getContactSearchSub().pipe(

      map(users => {
        
        if(this.user) {
          return users.filter(value => {
            
            return this.user.contacts.find(contact => {
              return contact.contactId === value.uid && contact.state === FriendRequestState.ACCEPTED;
            }) === undefined;
            //return this.user.contacts.indexOf(value.uid) === -1
          });
        }
      })
    )
    .subscribe(users => {

      console.log('contact page : search result : ' + JSON.stringify(users));
      this.searchResult = users;
    });

  }

  public searchUsers(input) {

    if(input) {

      const value = input.value;
      console.log('searching ' + value);

      //this.searchResult = [];
      this.contactProvider.searchOtherUser(value);
    }
  }

  public addContact(newPubUserContact: PublicUser) {

    this.contactProvider.sendFriendRequest(newPubUserContact);

    /*if(this.searchResult) {

      const userInd: number = this.searchResult.indexOf(newPubUserContact);
      this.searchResult.splice(userInd, 1);
    }*/
  }

  public isFriendRequestSent(pubUser: PublicUser) {

    //console.log('isFriendRequestSent : pubUser=' + JSON.stringify(pubUser));
    const contact = this.user.contacts.find(contact => {
      return contact.contactId === pubUser.uid;
    });

    if(contact) {
      //console.log('contact found : state=' + contact.state);
      return contact.state === FriendRequestState.PENDING;
    }
    else {
      //console.log('else : false');
      return false;
    }
  }

  public cancelFriendRequest(publicUser: PublicUser): Promise<void> {

    return this.contactProvider.cancelFriendRequest(publicUser);
  }

  public hasAlreadySentUs(pubUser: PublicUser): boolean{

    const request: FriendRequest = this.contactRequests.find(request => {
      return request.from === pubUser.uid;
    });

    return request !== undefined;
  }
}
