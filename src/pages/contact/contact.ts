import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactProvider } from '../../providers/contact/contact';
import { PublicUser, User, Contact } from '../../app/TodoList/model/model';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { map } from 'rxjs/operators';

@Component({
  selector: 'page-addContact',
  templateUrl: 'contact.html'
})
export class AddContactPage {

  // NgModels
  formValidation: FormGroup;
  userName: string;
  searchResult?: PublicUser[]
  user: User;

  constructor(public navCtrl: NavController, private contactProvider: ContactProvider, private auth: AuthenticationProvider) {

    this.formValidation = new FormGroup(({
      name: new FormControl('', Validators.required),
    }));

    this.searchResult = [];
    
    auth.getUserObs().subscribe(user => this.user = user);

    // Filter users already in contact
    contactProvider.getContactSearchSub().pipe(

      map(users => {
        
        if(this.user) {
          return users.filter(value => {
            
            return this.user.contacts.find(contact => {
              return contact.contactId == value.uid;
            }) == undefined;
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

      this.searchResult = [];
      this.contactProvider.searchOtherUser(value);
    }
  }

  public addContact(newContact: PublicUser) {

    this.contactProvider.sendFriendRequest(newContact);

    // TODO : view contact request sent
    if(this.searchResult) {

      const userInd: number = this.searchResult.indexOf(newContact);
      this.searchResult.splice(userInd, 1);
    }
  }
}
