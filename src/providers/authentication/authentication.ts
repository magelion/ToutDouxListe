import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from 'angularfire2/firestore';
import { User, PublicUser } from '../../app/model/model';
import { map, take } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { Facebook } from '@ionic-native/facebook/ngx'

@Injectable()
export class AuthenticationProvider {

  private userSub$: BehaviorSubject<User>;
  private publicUserSub$: BehaviorSubject<PublicUser>

  private isConnectedVar: boolean;
  private userCollection: AngularFirestoreCollection<User>;
  private userDoc: DocumentReference;
  private connectedPubUser: PublicUser;

  constructor(
    private googlePlus: GooglePlus,
     private fireBasesAuth: AngularFireAuth, 
     private platform: Platform, 
     private db: AngularFirestore, 
     private facebook: Facebook) {

    this.userSub$ = new BehaviorSubject(null);
    this.publicUserSub$ = new BehaviorSubject(null);

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

    var loginResult: Promise<firebase.User>;
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    // Actually, those promises are useless as they login synchronously
    if (this.platform.is('cordova')) {
      console.log("Platform : Cordova");
      loginResult = this.loginUserGoogleNative();
    } else {
      console.log("Platform : Other");
      loginResult = this.logInWithPopup(provider);
    }

    if(loginResult) {
      return this.loginFollowUp(loginResult);
    }
  }

  private getPublicUser(user: User, firebaseUser: firebase.User): Promise<PublicUser> {

    /*const docRef: AngularFirestoreDocument = this.db.collection('PublicUsers').doc(user.publicUid);
    
    return docRef.get().map(value => {

      return value.data() as PublicUser;
    }).toPromise();*/

    const publicUser: PublicUser = {

      uid: user.publicUid,
      displayName: firebaseUser.displayName,
      photoURL : firebaseUser.photoURL,
    }

    console.log('getPublicUser : ' + JSON.stringify(publicUser));

    return this.db.collection('PublicUsers').doc(publicUser.uid).set(publicUser).then(() => {
      return publicUser;
    });
  }

  public getPublicUserObs(): Observable<PublicUser> {
    return this.publicUserSub$.asObservable();
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
          const key = a.payload.doc.id;
          
          this.userDoc = a.payload.doc.ref;
          
          const user: User = data;
          user.uid = key;
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

  private addUserInDb(firebaseUser: firebase.User) : Promise<{user:User, publicUser:PublicUser}> {

    console.log("addUserInDb : user=" + JSON.stringify(firebaseUser));

    const result = {user: null, publicUser: null};

    const user : User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      publicUid: uuid(),
      contacts : []
    }

    const publicUser: PublicUser = {

      uid: user.publicUid,
      displayName: firebaseUser.displayName,
      photoURL : firebaseUser.photoURL,
    }

    return this.userCollection.doc(user.uid).set(user).then(() => {

      this.db.collection('PublicUsers').doc(publicUser.uid).set(publicUser);

      result.user = user;
      result.publicUser = user;

      return result;
    });
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

  public getUserObs(): Observable<User> {
    return this.userSub$.asObservable();
  }

  public isConnected(): boolean {
    return this.isConnectedVar;
  }

  public updateUser(user: User) : Promise<void> {

    if(this.isConnected() && this.userDoc) {

      const result = this.userDoc.update(user);
      this.userSub$.next(user);
      return result;
    }
    else {
      return null;
    }
  }

  public updatePublicUser(publicUser: PublicUser) {

    this.db.doc('PublicUsers/' + publicUser.uid).update(publicUser);
  }

  public logInWithFacebook() : Promise<User>{

    const provider : firebase.auth.FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();

    provider.addScope('public_profile');
    provider.addScope('email');

    console.log('Facebook provider = ' + JSON.stringify(provider));

    var loginResult: Promise<firebase.User>;
    
    // Actually, those promises are useless as they login synchronously
    if (this.platform.is('cordova')) {
      console.log("Platform : Cordova");
      loginResult = this.loginUserFacebookNative(provider);
    } else {
      console.log("Platform : Other");
      loginResult = this.logInWithPopup(provider);
    }

    return this.loginFollowUp(loginResult);
  }

  private logInWithPopup(provider : firebase.auth.AuthProvider) : Promise<firebase.User> {

    const result = firebase.auth().signInWithPopup(provider).then((result) => {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      //var token = result.credential.accessToken;
      // The signed-in user info.
      const user : firebase.User = result.user;
      return user;

    });
    
    result.catch((error) => {

      console.log('Error logging with popup : ' + JSON.stringify(error));
    });

    return result;
  }

  private loginUserFacebookNative(provider : firebase.auth.FacebookAuthProvider): Promise<firebase.User> {
    
    // Redirect (opens a webpage)
    /*const result = firebase.auth().signInWithRedirect(provider).then(() => {
      
      return firebase.auth().getRedirectResult().then((result) => {

        return result.user;
      });

    });
    
    result.catch((error) => {
      
      console.log(JSON.stringify(error));
    });

    return result;*/

    const result =  this.facebook.login(['email', 'public_profile'])
    .then( response => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(response.authResponse.accessToken);    
      return firebase.auth().signInWithCredential(facebookCredential);
    });
    result.catch(e => console.log('Error logging into Facebook (native)', e));
    return result;
  }

  private loginFollowUp(loginResult : Promise<firebase.User>) : Promise<User> {

    var result: Promise<User>;

    // Insert user in db if first connection
    result = loginResult.then(firebaseUser => {
      console.log("login -> then. User=" + JSON.stringify(firebaseUser));

      return this.GetUserFromFirebaseUser(firebaseUser).then(user => {
        var publicUser: PublicUser;
      
        // If user doesn't exists
        if(!user) {
          return this.addUserInDb(firebaseUser).then(result => {

            user = result.user;
            publicUser = result.publicUser;

            return this.loginEnd(user, publicUser);
          });
        }
        else {
          return this.getPublicUser(user, firebaseUser).then(publicUser => {

            return this.loginEnd(user, publicUser);
          });
        }        
      });
    });

    return result;
  }

  private loginEnd(user: User, publicUser: PublicUser) : User {

    console.log("User fetched : " + JSON.stringify(user));
    console.log("Public User fetched : " + JSON.stringify(publicUser));

    if(user) {
    }
    if(publicUser) {
      this.connectedPubUser = publicUser;
    }

    if(user) {
      this.userSub$.next(user);
    }
    if(publicUser) {
      this.publicUserSub$.next(publicUser);
    }
    
    return user;
  }

  public getConnectedPublicUser(): PublicUser {
    return this.connectedPubUser;
  }
}
