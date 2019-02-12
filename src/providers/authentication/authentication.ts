import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase from 'firebase';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { User } from '../../app/TodoList/model/model';

@Injectable()
export class AuthenticationProvider {

  private userSub$: BehaviorSubject<User>;
  private userObs$: Observable<User>;

  constructor(private googlePlus: GooglePlus, private fireBasesAuth: AngularFireAuth, private platform: Platform, private db: AngularFirestore) {

    this.userObs$ = fireBasesAuth.authState.map(fireBaseUser => {
      const data : User = {
        uid: fireBaseUser.uid,
        displayName: fireBaseUser.displayName,
        email: fireBaseUser.email,
        photoURL : fireBaseUser.photoURL
      }
      return data;
    });
    this.userSub$ = new BehaviorSubject(null);
  }

  public canLoginUser(): boolean {
    console.log('canLoginUser : userObs=' + this.userObs$ + ', googlePlus=' + this.googlePlus + ', this.isConnected=' + this.isConnected());
    return this.userObs$ === null && this.googlePlus !== null && !this.isConnected();
  }

  public googleLogin(): Promise<User> {

    var result: Promise<User>;

    // Actually, those promises are useless as they login synchronously
    if (this.platform.is('cordova')) {
      console.log("Platform : Cordova");
      result = this.loginUserGoogleNative();
    } else {
      console.log("Platform : Other");
      result = this.loginUserGoogleWeb();
    }

    // Insert user in db if first connection
    result = result.then(user => {
      console.log("google login -> then. User=" + JSON.stringify(user));

      if(user) {
        
        this.addUserInDbIfNotExist(user);
        this.userSub$.next(user);
      }
      return user;
    });

    return result;
  }

  private addUserInDbIfNotExist(user: User) {

    console.log("addUserInDbIfNotExist : user=" + JSON.stringify(user));
    const users: AngularFirestoreCollection<User> = this.db.collection('Users', ref => ref.where('uid', '==', user.uid));
    //console.log("user collection = " + users);

    users.snapshotChanges().map(action => {

      if(action.length === 0) {
        const data : User = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL : user.photoURL
        }
        users.add(data);
      }
    }).subscribe();
  }


  public signOut() : Promise<void>{
    return this.fireBasesAuth.auth.signOut().then(() => {
      this.userSub$.next(null);
    });
  }

  private async loginUserGoogleNative(): Promise<User> {

    console.log('LogInUserGoogleNative');
    // Check if plug in available
    // Test
    if (this.canLoginUser()) {
    }

      try {

        const gplusUser = await this.googlePlus.login({
          'webClientId': '262426639490-edt7n07dsvdkn1d4kmslcjd06qteaq23.apps.googleusercontent.com',
          'offline': true,
          'scopes': 'profile email'
        });

        console.log('gplusUser=' + JSON.stringify(gplusUser));
        return this.fireBasesAuth.auth.signInAndRetrieveDataWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken)).then(credentials => {

          const fireBaseUser: firebase.User = credentials.user;
          console.log('firebase user=' + JSON.stringify(fireBaseUser));
          const data : User = {
            uid: fireBaseUser.uid,
            displayName: fireBaseUser.displayName,
            email: fireBaseUser.email,
            photoURL : fireBaseUser.photoURL
          }
          return data;
        });

      } catch (err) {
        console.log(err);
      }
    //}
  }

  /**
   * Log in with google by web.
   * UNUSED as it opens a web tab.
   */
  private async loginUserGoogleWeb(): Promise<User> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      return this.fireBasesAuth.auth.signInWithPopup(provider).then(userCredential => {
        
        const fireBaseUser:firebase.User = userCredential.user;
        console.log('firebase user=' + JSON.stringify(fireBaseUser));
        const data : User = {
          uid: fireBaseUser.uid,
          displayName: fireBaseUser.displayName,
          email: fireBaseUser.email,
          photoURL : fireBaseUser.photoURL
        }

        return data;
      });
    } catch (err) {
      console.log(err);
    }
  }

  public getUser(): Observable<User> {
    return this.userSub$.asObservable();
  }

  public isConnected(): boolean {
    console.log('IsConnected.uid=' + this.fireBasesAuth.auth.currentUser.uid);
    if (this.fireBasesAuth.auth.currentUser && this.fireBasesAuth.auth.currentUser.uid) {
      return true;
    }
    else {
      return false;
    }
  }
}
