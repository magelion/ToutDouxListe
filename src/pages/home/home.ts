import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { GooglePlus } from '@ionic-native/google-plus/ngx';
import firebase from 'firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
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
	
  loginUser(): void {

    this.googlePlus.login({
      'webClientId': '262426639490-edt7n07dsvdkn1d4kmslcjd06qteaq23.apps.googleusercontent.com',
      'offline': true
    }).then( res => console.log(res))
      .catch(err => console.error(err));
  }
}
