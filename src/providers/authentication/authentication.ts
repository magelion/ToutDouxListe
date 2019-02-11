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

  private user: BehaviorSubject<User>;
  private userObs: Observable<User>;

  constructor(private googlePlus: GooglePlus, private fireBasesAuth: AngularFireAuth, private platform: Platform, private db: AngularFirestore) {

    this.userObs = fireBasesAuth.authState;
    this.user = new BehaviorSubject(null);
  }

  public canLoginUser(): boolean {
    return this.userObs === null && this.googlePlus !== null && !this.isConnected();
  }

  public googleLogin(): Promise<User> {

    var result: Promise<firebase.User>;

    // Actually, those promises are useless as they login synchronously
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

      this.user.next(user);
      return user;
    });

    return result;
  }

  private addUserInDbIfNotExist(user: firebase.User) {

    console.log("addUserInDbIfNotExist");
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

  public getUser(): Observable<User> {
    return this.user.asObservable();
  }

  public isConnected(): boolean {
    return this.fireBasesAuth.auth.currentUser !== null;
  }
}
