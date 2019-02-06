import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { User } from '../../app/TodoList/model/model';

@Injectable()
export class AuthenticationProvider {

  private user: Observable<firebase.User>

  constructor(private googlePlus: GooglePlus, private fireBasesAuth: AngularFireAuth, private platform: Platform, private db: AngularFirestore) {

    this.user = fireBasesAuth.authState;
  }

  public canLoginUser(): boolean {
    return this.user === null && this.googlePlus !== null && !this.isConnected();
  }

  public googleLogin(): Promise<User> {

    var result: Promise<firebase.User>;

    if (this.platform.is('cordova')) {
      console.log("Platform : Cordova");
      result = this.loginUserGoogleNative();
    } else {
      console.log("Platform : Other");
      result = this.loginUserGoogleWeb();
    }

    console.log("result = " + JSON.stringify(result));

    // Insert user in db if first connection
    result = result.then(user => {
      console.log("google login -> then");
      this.addUserInDbIfNotExist(user);
      return user;
    });

    return result;
  }

  private addUserInDbIfNotExist(user: firebase.User) {

    console.log("addUserInDbIfNotExist");
    const users: AngularFirestoreCollection<User> = this.db.collection('Users/');
    console.log("user collection = " + users);

    const userDoc = users.doc(user.uid);
    userDoc.snapshotChanges().map(action => {

      if(!action.payload.exists) {

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


  public signOut() {
    this.fireBasesAuth.auth.signOut();
  }

  private async loginUserGoogleNative(): Promise<firebase.User> {

    // Check if plug in available
    if (this.canLoginUser()) {

      try {

        const gplusUser = await this.googlePlus.login({
          'webClientId': 'your-webClientId-XYZ.apps.googleusercontent.com',
          'offline': true,
          'scopes': 'profile email'
        });

        return this.fireBasesAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken));

      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * Log in with google by web.
   * UNUSED as it opens a web tab.
   */
  private async loginUserGoogleWeb(): Promise<firebase.User> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      return this.fireBasesAuth.auth.signInWithPopup(provider).then(userCredential => userCredential.user);
    } catch (err) {
      console.log(err);
    }
  }

  public getUser(): Observable<firebase.User> {
    return this.user;
  }

  public isConnected(): boolean {
    return this.fireBasesAuth.auth.currentUser !== null;
  }
}
