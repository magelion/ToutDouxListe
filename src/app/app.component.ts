import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

//  import { TabsPage } from '../pages/tabs/tabs';
import { AuthenticationPage } from '../pages/authentication/authentication';


@Component({
  templateUrl: 'app.html'
})
export class ToutDouxListeApp {
  rootPage:any = AuthenticationPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
