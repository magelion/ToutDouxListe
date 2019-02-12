import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthenticationPage } from './authentication';
import { AuthenticationProvider } from '../../providers/authentication/authentication';

@NgModule({
  declarations: [
    AuthenticationPage,
  ],
  imports: [
    IonicPageModule.forChild(AuthenticationPage),
  ],
  exports: [
    AuthenticationPage
  ],
  providers: [
    AuthenticationProvider
  ]
})
export class AuthenticationPageModule {}
