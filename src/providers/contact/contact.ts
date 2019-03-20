import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from 'angularfire2/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { PublicUser, User, Contact, FriendRequestState } from '../../app/TodoList/model/model';
import { AuthenticationProvider } from '../authentication/authentication';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ContactProvider {

  private contactSearchSub$: BehaviorSubject<PublicUser[]>;
  private connectedUser: User;

  constructor(private db: AngularFirestore, private auth: AuthenticationProvider) {
    console.log('Hello ContactProvider Provider');

    this.contactSearchSub$ = new BehaviorSubject(new Array());

    this.auth.getUserObs().subscribe(user => this.connectedUser = user );
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

          //console.log('SearchOtherUser : docId=' + JSON.stringify(doc.id) + ", data=" + JSON.stringify(doc.data) + ', doc.get(uid)=' + doc.get('uid'));
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
    return this.db.collection('PublicUsers').doc(uid).get().map(doc => {

      return doc.data() as PublicUser;
    }).toPromise()
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
  }

  public cancelFriendRequest(publicUser: PublicUser): Promise<void> {
    
    const correspondingContact = this.connectedUser.contacts.find(contact => {

      return contact.contactId == publicUser.uid;
    });

    if(correspondingContact) {
      return this.deleteContact(correspondingContact);
    }
  }
}
