import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { Observable } from 'rxjs';
import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';
import { User } from '../../app/TodoList/model/model';

@IonicPage()
@Component({
  selector: 'page-authentication',
  templateUrl: 'authentication.html',
})
export class AuthenticationPage {

  private userObs: Observable<User>
  public user: User

  constructor(
    private authProvider: AuthenticationProvider,
    private navController: NavController) {

    this.userObs = this.authProvider.getUser();
    this.updateUser();
  }

  updateUser() {
    this.userObs.subscribe(user => {
      
      this.user = user;
      if (this.user!=null){
        this.navController.setRoot(TabsPage);
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AuthenticationPage');
  }

  public loginUserGoogle() {

    (<Promise<any>>this.authProvider.googleLogin())
    .then((res) => {
      this.updateUser();
    });
  }

  canLoginUser(): boolean {
    return this.authProvider.canLoginUser();
  }

  logout() {
    this.authProvider.signOut();
  }
}
