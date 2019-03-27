import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, AngularFirestoreCollection, DocumentChangeAction } from 'angularfire2/firestore';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { PublicUser, User, Contact, FriendRequestState, FriendRequest } from '../../app/model/model';
import { AuthenticationProvider } from '../authentication/authentication';
import { v4 as uuid } from 'uuid';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ContactProvider {

  private static readonly PENDING_CONTACT_REQUESTS_DB: string = 'PendingContactRequests';
  private static readonly PUBLIC_USER_DB: string = 'PublicUsers';

  private contactSearchSub$: BehaviorSubject<PublicUser[]>;

  private contactRequestsObs$: BehaviorSubject<FriendRequest[]>;

  private connectedUser: User;
  private friendRequests: FriendRequest[] = new Array<FriendRequest>();

  private contactRequestSub: Subscription;
  private allRequestCol: AngularFirestoreCollection<FriendRequest>;

  constructor(private db: AngularFirestore, private auth: AuthenticationProvider) {
    console.log('Hello ContactProvider Provider');

    this.contactSearchSub$ = new BehaviorSubject(new Array());
    this.contactRequestsObs$ = new BehaviorSubject(new Array());

    this.allRequestCol = this.db.collection(ContactProvider.PENDING_CONTACT_REQUESTS_DB);

    this.auth.getUserObs().subscribe(user => {
      
      this.connectedUser = user;

      if(this.contactRequestSub) {
        this.contactRequestSub.unsubscribe();
        this.contactRequestSub = null;
      }

      if(!user) {
        return;
      }

      // Get all requests where we are involved
      const toRequestsObs$:Observable<DocumentChangeAction<{}>[]> = this.db.collection(ContactProvider.PENDING_CONTACT_REQUESTS_DB, ref => ref.where('to', '==', this.connectedUser.publicUid)).snapshotChanges();
      const fromRequestObs$:Observable<DocumentChangeAction<{}>[]> = this.db.collection(ContactProvider.PENDING_CONTACT_REQUESTS_DB, ref => ref.where('from', '==', this.connectedUser.publicUid)).snapshotChanges();

      const finalObs$:Observable<FriendRequest[]> = combineLatest(toRequestsObs$, fromRequestObs$).pipe(
        map(data => {
          
          const actions = data[0].concat(data[1]);
          return actions.map(action => {

            return action.payload.doc.data() as FriendRequest;
          });
        }),
        tap(requests => console.log('contactProvider : pendingContactRequests=' + JSON.stringify(requests)))
      );
      
      this.contactRequestSub = finalObs$.subscribe(requests => {
        
        // Update contact list of user
        requests.forEach(request => {
          
          const contactList:Contact[] = this.connectedUser.contacts;
          
          const existingContact = contactList.find(contact => {
            return contact.uid === request.from;
          });
          
          // If contact not set, then there has been an error so delete the request
          if(existingContact === undefined) {
            // Doesn't work
            //this.deleteFriendRequest(request.uid);
          }
        });

        this.friendRequests = requests;
        this.contactRequestsObs$.next(requests);
      });
    });

  }

  public getContactSearchSub() : Observable<PublicUser[]> {
    return this.contactSearchSub$;
  }

  public searchOtherUser(nameLike: string) : Promise<void> {

    console.log('SearchOtherUser : pattern=' + nameLike);
    const usersRef: CollectionReference = this.db.collection('PublicUsers').ref;

    usersRef.orderBy('displayName').startAt(nameLike).endAt(nameLike+'\uf8ff');

    return usersRef.get().then((result) => {

      if(!result.empty) {

        console.log('nbUser fetched = ' + result.size);
        const searchResult: PublicUser[] = new Array();
        result.forEach((doc) => {

          const publicUser: PublicUser = {

            uid: doc.get('uid'),
            displayName: doc.get('displayName'),
            photoURL: doc.get('photoURL')
          };

          // Don't display ourself
          if(this.connectedUser && this.connectedUser.publicUid !== publicUser.uid) {
            
            console.log('Fetched PublicUser=' + JSON.stringify(publicUser));
            searchResult.push(publicUser);
          }

        });

        this.contactSearchSub$.next(searchResult);
      }
    });
  }

  public getContactsPublicUserOfUser(user: User) : Promise<PublicUser[]> {

    var resultPromise : Promise<PublicUser[]>;
    const resultList : PublicUser[] = new Array();
    
    console.log('ContactProvider : getContactsOfUser');
    user.contacts.forEach(contact => {

      if(!resultPromise) {

        const publicUserPromise = this.getPublicUser(contact.contactId);
        if(publicUserPromise) {

          resultPromise = publicUserPromise.then(publicUser => {

            resultList.push(publicUser);
            return resultList;
          });
        }
      }
      else {

        resultPromise = resultPromise.then(val => {
            
          const publicUserPromise = this.getPublicUser(contact.contactId);
          if(publicUserPromise) {
 
            return publicUserPromise.then(publicUser => {
    
              resultList.push(publicUser);
              return resultList;
            });
          }
        });
      }
    });

    return resultPromise;
  }

  public getPublicUser(uid: string) : Promise<PublicUser> {

    if(!uid) return null;
    return this.db.doc(ContactProvider.PUBLIC_USER_DB + '/' + uid).get().map(doc => {

      const pubUser:PublicUser = doc.data() as PublicUser;
      console.log('contact : getPublicUser : map : pubUser=' + JSON.stringify(pubUser));
      return pubUser;
    }).toPromise();
  }

  public deleteContact(contact: Contact) : Promise<void> {

    if(this.connectedUser) {

      const contactInd = this.connectedUser.contacts.indexOf(contact);
      if(contactInd >= 0) {

        this.connectedUser.contacts.splice(contactInd, 1);
        return this.auth.updateUser(this.connectedUser);
      }
    }
  }

  public sendFriendRequest(newContact: PublicUser): any {
    
    let contact: Contact = {
      uid : uuid(),
      contactId : newContact.uid,
      state : FriendRequestState.PENDING
    };

    this.connectedUser.contacts.push(contact);

    this.auth.updateUser(this.connectedUser);

    this.createFriendRequest(newContact.uid);
  }

  public cancelFriendRequest(publicUser: PublicUser): Promise<void> {
    
    const correspondingContact = this.connectedUser.contacts.find(contact => {

      return contact.contactId == publicUser.uid;
    });

    const correspondingRequest = this.friendRequests.find(request => request.to === publicUser.uid);
    console.log('ContactProvider : cancelFriendRequest : correspondingRequest : ' + JSON.stringify(correspondingRequest));
    if(correspondingRequest) {
      this.deleteFriendRequest(correspondingRequest.uid);
    }

    if(correspondingContact) {
      return this.deleteContact(correspondingContact);
    }
  }

  public getContactRequestsObs() : Observable<FriendRequest[]> {
    return this.contactRequestsObs$.asObservable();
  }

  public createFriendRequest(toId: string): Promise<FriendRequest> {

    const requestId: string = uuid();
    const request: FriendRequest = {
      uid: requestId,
      from: this.connectedUser.publicUid,
      to: toId,
      state: FriendRequestState.PENDING
    };

    const promise = this.allRequestCol.doc(request.uid).set(request);

    return promise.then(value => {
      console.log('ContactProvider : createFriendRequets : request created : ' + JSON.stringify(request));
      return request;
    }).catch(error => {
      console.log('ContactProvider : createFriendRequets : request creation error  : ' + JSON.stringify(error));
      return request;
    });
  }

  public deleteFriendRequest(requestId: string): Promise<void> {

    console.log('ContactProvider : deleteFriendRequest : request to delete : ' + requestId);
    if(requestId) {
      return this.allRequestCol.doc(requestId).delete();
    }
    else {
      return;
    }
  }

  public acceptIncomingFriendRequest(request: FriendRequest) : Promise<void> {

    const contact: Contact = {
      contactId: request.from,
      state: FriendRequestState.ACCEPTED,
      uid: uuid()
    }
    this.connectedUser.contacts.push(contact);

    console.log('contactProvider : acceptIncomingFriendRequest : newContact : ' + JSON.stringify(contact) + '; request : ' + JSON.stringify(request));

    this.auth.updateUser(this.connectedUser);

    console.log('ContactProvider : acceptIncomingFriendRequest : request to delete : ' + JSON.stringify(request));
    return this.deleteFriendRequest(request.uid);
  }
}
