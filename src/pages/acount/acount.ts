import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { Observable } from 'rxjs';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { AuthenticationPage } from '../authentication/authentication';
import { User } from '../../app/TodoList/model/model';

/**
 * Generated class for the AcountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-acount',
  templateUrl: 'acount.html',
})
export class AcountPage {
  private userObs: Observable<User>
  public user: User

  constructor(
    private authProvider: AuthenticationProvider,
    private navController: NavController, private app: App) {

    this.userObs = this.authProvider.getUser();
    this.updateUser();
  }

  updateUser() {
    this.userObs.subscribe(user => {
      
      this.user = user;
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
    this.authProvider.signOut()
    .then(()=> {
      console.log('logout complete'); 
      // this.navController.setRoot(AuthenticationPage);});
      this.app.getRootNav().setRoot(AuthenticationPage);});
    
  }

}
