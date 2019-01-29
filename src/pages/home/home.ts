import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { GooglePlus } from '@ionic-native/google-plus/ngx';
import firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [GooglePlus]
})
export class HomePage {

  userProfile: any = null;

  constructor(public navCtrl: NavController, private googlePlus: GooglePlus) {

    firebase.auth().onAuthStateChanged( user => {
      if (user){
        this.userProfile = user;
      } else { 
        this.userProfile = null;
      }
    });
  }

  public canLoginUser(): boolean {
    return this.userProfile === null && this.googlePlus !== null;
  }
	
  public loginUser(): void {

    console.log(this.googlePlus);
    console.log(this.googlePlus.login);

    // Check if plug in available
    if (this.canLoginUser()) {
      this.googlePlus.login({
        'webClientId': '262426639490-edt7n07dsvdkn1d4kmslcjd06qteaq23.apps.googleusercontent.com',
        'offline': true
      }).then( res => {
        const googleCredential = firebase.auth.GoogleAuthProvider
              .credential(res.idToken);
 
        firebase.auth().signInWithCredential(googleCredential)
        .then( response => {
            console.log("Firebase success: " + JSON.stringify(response));});
      })
        .catch(err => console.error(err));
    }
  }
}
