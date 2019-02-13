import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import firebase, { firestore } from 'firebase';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { User } from '../../app/TodoList/model/model';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthenticationProvider {

  private userSub$: BehaviorSubject<User>;
  private userObs$: Observable<User>;
  private isConnectedVar: boolean;

  constructor(private googlePlus: GooglePlus, private fireBasesAuth: AngularFireAuth, private platform: Platform, private db: AngularFirestore) {

    this.userObs$ = fireBasesAuth.authState.map(fireBaseUser => {
      const data : User = {
        uid: fireBaseUser.uid,
        displayName: fireBaseUser.displayName,
        email: fireBaseUser.email,
        photoURL : fireBaseUser.photoURL,
        contacts : []
      }
      
      return data;
    });

    this.userSub$ = new BehaviorSubject(null);
    this.userSub$.subscribe(user => {
      if(user !== null && user !== undefined) {
        this.isConnectedVar = true;
      }
      else {
        this.isConnectedVar = false;
      }

      console.log('AuthenticationProvider : isConnectedVar=' + this.isConnectedVar);
    })
  }

  public canLoginUser(): boolean {
    console.log('canLoginUser : userObs=' + this.userObs$ + ', googlePlus=' + this.googlePlus + ', this.isConnected=' + this.isConnected());
    return this.userObs$ === null && this.googlePlus !== null && !this.isConnected();
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

      const user = await this.GetUserFromFirebaseUser(firebaseUser);

      console.log("User fetched : " + JSON.stringify(user))
      if(user) {
        
        this.addUserInDbIfNotExist(user);
        this.userSub$.next(user);
      }
      return user;
    });

    return result;
  }

  private GetUserFromFirebaseUser(firebaseUser : firebase.User) : Promise<User> {

    if (!firebaseUser) return null;

    console.log('GetUserFromFirebaseUser : uid=' + firebaseUser.uid);
    const users: AngularFirestoreCollection<User> = this.db.collection('Users', ref => ref.where('uid', '==', firebaseUser.uid));

    return users.valueChanges().pipe(
      take(1),
      map(userList => {
        
        if(userList.length < 1) return null;

        const user: User = userList[0];
        
        if(!user.contacts) user.contacts = new Array();

        return user;
      }),
    ).toPromise();
  }

  private addUserInDbIfNotExist(user: User) {

    console.log("addUserInDbIfNotExist : user=" + JSON.stringify(user));
    const users: AngularFirestoreCollection<User> = this.db.collection('Users', ref => ref.where('uid', '==', user.uid));
    //console.log("user collection = " + users);

    users.snapshotChanges().pipe(
      
      take(1),
      map(action => {
        if(action.length === 0) {
          const data : User = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL : user.photoURL,
            contacts : []
          }
          users.add(data);
        }
      })
    ).subscribe().unsubscribe();
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

  public getUser(): Observable<User> {
    return this.userSub$.asObservable();
  }

  public isConnected(): boolean {
    return this.isConnectedVar;
  }
}
