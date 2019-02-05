import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class AuthenticationProvider {

  private user: Observable<firebase.User>

  constructor(private googlePlus: GooglePlus, private fireBasesAuth: AngularFireAuth, private platform: Platform, private db: AngularFirestore) {

    this.user = fireBasesAuth.authState;
  }

  public canLoginUser(): boolean {
    return this.user === null && this.googlePlus !== null && !this.isConnected();
  }

  public googleLogin(): Promise<firebase.User> {

    var result: Promise<firebase.User>;
    if (this.platform.is('cordova')) {
      console.log("Platform : Cordova");
      result = this.loginUserGoogleNative();
    } else {
      console.log("Platform : Other");
      result = this.loginUserGoogleWeb();
    }

    // Insert user in db if first connection
    result.then(user => {
      this.addUserInDbIfNotExist(user);
    });

    return result;
  }

  private addUserInDbIfNotExist(user: firebase.User) {

    const users = this.db.collection('Users/');
    users.doc(user.uid).snapshotChanges().map(action => {
      if(!action.payload.exists) {
        const data = {
          uid: user.uid,
          name: user.displayName,
          email: user.email
        }
        users.add(data);
      }
    })
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
        })

        return await this.fireBasesAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken))

      } catch (err) {
        console.log(err)
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
      return new Promise<firebase.User>(resolve => this.fireBasesAuth.auth.signInWithPopup(provider));
    } catch (err) {
      console.log(err)
    }
  }

  public getUser(): Observable<firebase.User> {
    return this.user;
  }

  public isConnected(): boolean {
    return this.fireBasesAuth.auth.currentUser !== null;
  }
}
