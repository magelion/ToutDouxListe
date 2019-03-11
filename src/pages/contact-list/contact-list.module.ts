import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactListPage } from './contact-list';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ContactListPage
  ],
  imports: [
    IonicPageModule.forChild(ContactListPage),
    ComponentsModule
  ],
})
export class ContactListPageModule {}
