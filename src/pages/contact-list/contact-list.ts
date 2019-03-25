import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ContactProvider } from '../../providers/contact/contact';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User, PublicUser, FriendRequestState } from '../../app/model/model';
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
  public contactPublicUserList: PublicUser[];

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private contactProvider: ContactProvider,
    authProvider: AuthenticationProvider) {
  
    this.connectedUserSubToken = authProvider.getUserObs().subscribe(user => {

      this.contactPublicUserList = [];
      this.connectedUser = user;

      const publicUserPromise: Promise<PublicUser[]> = this.contactProvider.getContactsPublicUserOfUser(this.connectedUser);
      
      if(publicUserPromise) {
        publicUserPromise.then(publicUser => {
  
          this.contactPublicUserList = publicUser;
        });
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactListPage');
  }

  ngOnDestroy(): void {
    
    this.connectedUserSubToken.unsubscribe();
  }

  deleteContact(publicUser: PublicUser): Promise<void> {

    var pubUserInd = this.contactPublicUserList.indexOf(publicUser);
    const contact = this.connectedUser.contacts[pubUserInd];

    if(pubUserInd >= 0) {

      return this.contactProvider.deleteContact(contact).then(() => {
  
        // Re calcul index just in case because we are async
        pubUserInd = this.contactPublicUserList.indexOf(publicUser);

        console.log('DeleteContact : index=' + pubUserInd);
        console.log('contactList length : ' + this.contactPublicUserList.length);

        this.contactPublicUserList.splice(pubUserInd, 1);

        console.log('contactList length : ' + this.contactPublicUserList.length);
      });
    }
  }

  public addContactCommand() {

    this.navCtrl.push(AddContactPage);
  }

  public isPublicUserAdded(publicUser: PublicUser): boolean {

    var pubUserInd = this.contactPublicUserList.indexOf(publicUser);
    const contact = this.connectedUser.contacts[pubUserInd];
    return contact.state === FriendRequestState.ACCEPTED;
  }

  public cancelFriendRequest(publicUser: PublicUser): Promise<void> {

    return null; // TODO
  }
}
