import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from 'angularfire2/firestore';
import { User, PublicUser } from '../../app/TodoList/model/model';
import { map, take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { Action } from 'rxjs/internal/scheduler/Action';

@Injectable()
export class AuthenticationProvider {

  private userSub$: BehaviorSubject<User>;
  private isConnectedVar: boolean;
  private userCollection: AngularFirestoreCollection<User>;
  private userDoc: DocumentReference;

  constructor(private googlePlus: GooglePlus, private fireBasesAuth: AngularFireAuth, private platform: Platform, private db: AngularFirestore) {

    this.userSub$ = new BehaviorSubject(null);
    this.userSub$.subscribe(user => {
      if(user !== null && user !== undefined) {
        this.isConnectedVar = true;
      }
      else {
        this.isConnectedVar = false;
      }

      console.log('AuthenticationProvider : isConnectedVar=' + this.isConnectedVar);
    });

    this.userCollection = null;
  }

  public canLoginUser(): boolean {
    console.log('canLoginUser : googlePlus=' + this.googlePlus + ', this.isConnected=' + this.isConnected());
    return this.googlePlus !== null && !this.isConnected();
  }

  public googleLogin(): Promise<User> {

    var result: Promise<User>;

    var loginResult: Promise<firebase.User>;
    // Actually, those promises are useless as they login synchronously
    if (this.platform.is('cordova')) {
      console.log("Platform : Cordova");
      loginResult = this.loginUserGoogleNative();
    } else {
      console.log("Platform : Other");
      loginResult = this.loginUserGoogleWeb();
    }

    // Insert user in db if first connection
    result = loginResult.then(async firebaseUser => {
      console.log("google login -> then. User=" + JSON.stringify(firebaseUser));

      var user: User = await this.GetUserFromFirebaseUser(firebaseUser);

      console.log("User fetched : " + JSON.stringify(user));

      // If user doesn't exists
      if(!user) {
        user = await this.addUserInDbIfNotExist(firebaseUser);
      }

      if(user) {
        this.userSub$.next(user);
      }
      
      return user;
    });

    return result;
  }

  private GetUserFromFirebaseUser(firebaseUser : firebase.User) : Promise<User> {

    if (!firebaseUser) return null;

    console.log('GetUserFromFirebaseUser : uid=' + firebaseUser.uid);
    if(this.userCollection === null) {

      this.userCollection = this.db.collection('Users', ref => ref.where('uid', '==', firebaseUser.uid));
    }

    return this.userCollection.snapshotChanges().pipe(
      take(1),
      map(action => {
        
        const users: User[] = action.map(a => {

          if(!a.payload.doc.exists) return null;
          const data = a.payload.doc.data() as User;
          this.userDoc = a.payload.doc.ref;
          
          const user: User = data;
          
          if(!user.contacts) user.contacts = new Array();
  
          return user;
        });

        if(users !== null && users.length > 0) {
          return users[0];
        }
        else {
          return null;
        }
      })
    ).toPromise();
  }

  private addUserInDbIfNotExist(firebaseUser: firebase.User) : Promise<User> {

    console.log("addUserInDbIfNotExist : user=" + JSON.stringify(firebaseUser));
    if(this.userCollection === null) {

      this.userCollection = this.db.collection('Users', ref => ref.where('uid', '==', firebaseUser.uid));
    }

    return this.userCollection.snapshotChanges().pipe(
      
      take(1),
      map(action => {

        const users: User[] = action.map( a => {

          if(!a.payload.doc.exists) {

            const user : User = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL : firebaseUser.photoURL,
              publicUid: uuid(),
              contacts : []
            }
  
            const publicUser: PublicUser = {
  
              uid: user.publicUid,
              displayName: user.displayName,
              photoURL : user.photoURL,
            }
  
            
            // Add User
            this.userCollection.add(user).then(doc => this.userDoc = doc);
            
            // Add PublicUser
            this.db.collection('PublicUsers').add(publicUser);
            
            return user;
          }
          else {
            this.userDoc = a.payload.doc.ref;
            return a.payload.doc.data();
          }
        });

        if(users !== null && users.length > 0) {
          return users[0];
        }
        else {
          return null;
        }
      })
    ).toPromise();
  }


  public signOut() : Promise<void>{

    console.log('signing out');
    return this.fireBasesAuth.auth.signOut().then(() => {
      this.userSub$.next(null);
      console.log('signed out');
    });
  }

  private async loginUserGoogleNative(): Promise<firebase.User> {

    console.log('LogInUserGoogleNative');
    try {

      const gplusUser = await this.googlePlus.login({
        'webClientId': '262426639490-edt7n07dsvdkn1d4kmslcjd06qteaq23.apps.googleusercontent.com',
        'offline': true,
        'scopes': 'profile email'
      });

      console.log('gplusUser=' + JSON.stringify(gplusUser));
      return this.fireBasesAuth.auth.signInAndRetrieveDataWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken)).then(credentials => {

        const fireBaseUser: firebase.User = credentials.user;
        return fireBaseUser;
      });

    } catch (err) {
      console.log('LogInUserGoogleNative : Error : ' + JSON.stringify(err));
    }
  }

  /**
   * Log in with google by web.
   * Used with simulator.
   */
  private async loginUserGoogleWeb(): Promise<firebase.User> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      return this.fireBasesAuth.auth.signInWithPopup(provider).then(userCredential => {
        
        const fireBaseUser:firebase.User = userCredential.user;
        return fireBaseUser;
      });
    } catch (err) {
      console.log(err);
    }
  }

  public getUserObs(): Observable<User> {
    return this.userSub$.asObservable();
  }

  public isConnected(): boolean {
    return this.isConnectedVar;
  }

  public updateUser(user: User) : Promise<void> {

    if(this.isConnected() && this.userDoc) {

      return this.userDoc.update(user);
    }
    else {
      return null;
    }
  }
}
