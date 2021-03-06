import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { Observable } from 'rxjs';
import { TabsPage } from '../tabs/tabs';
import { User } from '../../app/model/model';

@IonicPage()
@Component({
  selector: 'page-authentication',
  templateUrl: 'authentication.html',
})
export class AuthenticationPage {

  private userObs: Observable<User>;
  private connectedUser:User = null;

  constructor(
    private authProvider: AuthenticationProvider,
    private navController: NavController) {

    this.userObs = this.authProvider.getUserObs();
    this.userObs.subscribe(user => {
      
      // console.log('Authentication : user=' + JSON.stringify(user));
      
      if(user === null) {
        this.connectedUser = null;
      }
      else if (this.connectedUser === null) {
        this.connectedUser = user;
        this.navController.setRoot(TabsPage);
      }
    });
    console.log('AuthenticationPage : construction completed');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AuthenticationPage');
  }

  public loginUserGoogle() {

    console.log('AuthenticationPage : loginUserGoogle');
    this.authProvider.googleLogin().catch((e) => {
      alert(e);
      console.log("Authentication page : loginUserGoogle error : " + JSON.stringify(e));
    });
  }

  public isConnected(): boolean {
    return this.authProvider.isConnected();
  }

  public loginUserFacebook() {

    console.log('AuthenticationPage : loginUserFacebook');
    this.authProvider.logInWithFacebook();
  }

  public logout() {
    console.log('AuthenticationPage : logout');
    this.authProvider.signOut();
  }
}
