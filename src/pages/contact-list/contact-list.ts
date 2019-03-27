import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ContactProvider } from '../../providers/contact/contact';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User, PublicUser, FriendRequestState, FriendRequest } from '../../app/model/model';
import { Subscription } from 'rxjs';
import { AddContactPage } from '../contact/contact';

@IonicPage()
@Component({
  selector: 'page-contact-list',
  templateUrl: 'contact-list.html',
})
export class ContactListPage implements OnDestroy {

  private connectedUser: User;
  private connectedPubUser: PublicUser;

  private connectedUserSubToken: Subscription;
  private incomingRequestsSubToken: Subscription = null;
  public contactPublicUserList: PublicUser[];

  public incomingRequests: FriendRequest[] = new Array();
  public incomingContact: PublicUser[] = new Array();

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private contactProvider: ContactProvider,
    authProvider: AuthenticationProvider) {
  
    this.connectedUserSubToken = authProvider.getUserObs().subscribe(user => {

      this.contactPublicUserList = new Array();
      this.connectedUser = user;
      this.connectedPubUser = authProvider.getConnectedPublicUser();

      const publicUserPromise: Promise<PublicUser[]> = this.contactProvider.getContactsPublicUserOfUser(this.connectedUser);
      
      if(publicUserPromise) {
        publicUserPromise.then(publicUser => {
  
          this.contactPublicUserList = publicUser;
        });
      }

      if(this.incomingRequestsSubToken) {
        this.incomingRequestsSubToken.unsubscribe();
        this.incomingRequestsSubToken = null;
      }

      this.incomingRequestsSubToken = this.contactProvider.getContactRequestsObs().subscribe(requests => {
        this.incomingRequests = requests;
        this.incomingContact = [];

        requests.forEach(request => {
          
          if(request.from !== this.connectedPubUser.uid && request.state === FriendRequestState.PENDING) {

            console.log('contact-list : incoming request : ' + JSON.stringify(request));

            const promise = this.contactProvider.getPublicUser(request.from);

            if(promise) {
              promise.then(pubUser => this.incomingContact.push(pubUser));
            }
          }
        });
      })
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

    return this.contactProvider.cancelFriendRequest(publicUser);
  }

  public acceptRequest(publicUser: PublicUser) {

    const request: FriendRequest = this.incomingRequests.find(req => req.from === publicUser.uid);

    if(request) {
      console.log('contact-list : acceptRequest : request : ' + JSON.stringify(request));
      this.contactProvider.acceptIncomingFriendRequest(request);
      return true;
    }
    else {
      return;
    }
  }

  public denyRequest(publicUser: PublicUser): Promise<void> {

    const request: FriendRequest = this.incomingRequests.find(req => req.from === publicUser.uid);
    if(request) {

      return this.contactProvider.deleteFriendRequest(request.uid);
    }
    else {
      return;
    }
  }
}
