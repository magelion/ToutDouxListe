import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ContactProvider } from '../../providers/contact/contact';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User, PublicUser } from '../../app/TodoList/model/model';
import { Subscription } from 'rxjs';
import { AddContactPage } from '../contact/contact';

@IonicPage()
@Component({
  selector: 'page-contact-list',
  templateUrl: 'contact-list.html',
})
export class ContactListPage implements OnDestroy {

  private connectedUser: User;
  private connectedUserSubToken: Subscription;
  public contactList: PublicUser[];

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private contactProvider: ContactProvider,
    authProvider: AuthenticationProvider) {
  
      this.connectedUserSubToken = authProvider.getUserObs().subscribe(user => {

        this.contactList = [];
        this.connectedUser = user;
        this.contactProvider.getContactsOfUser(this.connectedUser).then(contacts => {

          this.contactList = contacts;
          //console.log("ContactListPage : contact list : " + JSON.stringify(this.contactList));
        });
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactListPage');
  }

  ngOnDestroy(): void {
    
    this.connectedUserSubToken.unsubscribe();
  }

  deleteContact(contact: PublicUser): void {

    var contactInd = this.contactList.indexOf(contact);

    if(contactInd >= 0) {

      this.contactProvider.deleteContact(contact).then(() => {
  
        // Re calcul index just in case because we are async
        contactInd = this.contactList.indexOf(contact);

        console.log('DeleteContact : index=' + contactInd);
        console.log('contactList length : ' + this.contactList.length);

        this.contactList.splice(contactInd, 1);

        console.log('contactList length : ' + this.contactList.length);
      });
    }
  }

  public addContactCommand() {

    this.navCtrl.push(AddContactPage);
  }
}
