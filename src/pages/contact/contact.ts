import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactProvider } from '../../providers/contact/contact';
import { PublicUser, User } from '../../app/TodoList/model/model';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { map } from 'rxjs/operators';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  // NgModels
  formValidation: FormGroup;
  userName: string;
  searchResult?: PublicUser[]
  user: User;

  constructor(public navCtrl: NavController, private contactProvider: ContactProvider, private auth: AuthenticationProvider) {

    this.formValidation = new FormGroup(({
      name: new FormControl('', Validators.required),
    }));

    this.searchResult = null ;
    
    auth.getUserObs().subscribe(user => this.user = user);

    // Filter users already in contact
    contactProvider.getContactSearchSub().pipe(

      map(users => {
        
        if(this.user) {
          return users.filter(value => {
            
            return this.user.contacts.indexOf(value.uid) === -1
          });
        }
      })
    )
    .subscribe(users => {
      this.searchResult = users;
    });

  }

  public searchUsers() {

    if(this.userName) {

      this.searchResult = null;
      this.contactProvider.searchOtherUser(this.userName);
    }
  }

  public addContact(newContact: PublicUser) {

    this.user.contacts.push(newContact.uid);
    this.auth.updateUser(this.user);
    
    if(this.searchResult) {

      const userInd: number = this.searchResult.indexOf(newContact);
      this.searchResult.splice(userInd, 1);
    }
  }
}
