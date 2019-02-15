import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from 'angularfire2/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { PublicUser, User } from '../../app/TodoList/model/model';
import { AuthenticationProvider } from '../authentication/authentication';

@Injectable()
export class ContactProvider {

  private contactSearchSub$: BehaviorSubject<PublicUser[]>;
  private user: User;

  constructor(private db: AngularFirestore, private auth: AuthenticationProvider) {
    console.log('Hello ContactProvider Provider');

    this.contactSearchSub$ = new BehaviorSubject(new Array());

    this.auth.getUserObs().subscribe(user => this.user = user );
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
          if(this.user && this.user.publicUid !== publicUser.uid) {
            
            console.log('Fetched PublicUser=' + JSON.stringify(publicUser));
            searchResult.push(publicUser);
          }

        });

        this.contactSearchSub$.next(searchResult);
      }
    });
  }
}
