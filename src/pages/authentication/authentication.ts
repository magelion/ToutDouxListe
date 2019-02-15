import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { Observable } from 'rxjs';
import { TabsPage } from '../tabs/tabs';
import { User } from '../../app/TodoList/model/model';

@IonicPage()
@Component({
  selector: 'page-authentication',
  templateUrl: 'authentication.html',
})
export class AuthenticationPage {

  private userObs: Observable<User>

  constructor(
    private authProvider: AuthenticationProvider,
    private navController: NavController) {

    this.userObs = this.authProvider.getUserObs();
    this.userObs.subscribe(user => {
      
      console.log('Authentication : user=' + JSON.stringify(user));
      if (user !== null){
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
    this.authProvider.googleLogin();
  }

  public isConnected(): boolean {
    return this.authProvider.isConnected();
  }

  logout() {
    console.log('AuthenticationPage : logout');
    this.authProvider.signOut();
  }
}
