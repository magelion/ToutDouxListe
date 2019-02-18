import { Component } from '@angular/core';
import { IonicPage, App } from 'ionic-angular';
import { Observable } from 'rxjs';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { User, PublicUser } from '../../app/TodoList/model/model';
import { AuthenticationPage } from '../authentication/authentication';

@IonicPage()
@Component({
  selector: 'page-acount',
  templateUrl: 'acount.html',
})
export class AcountPage {

  private userObs: Observable<User>

  public user: User
  public publicUser: PublicUser;

  constructor(
    private authProvider: AuthenticationProvider,
    private app: App) {

    this.userObs = this.authProvider.getUserObs();
    this.updateUser();

    this.authProvider.getPublicUserObs().subscribe(publicUser => {
      this.publicUser = publicUser;
    })
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
    .then(() => {
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
      this.app.getRootNav().setRoot(AuthenticationPage);
    });
  }

}
