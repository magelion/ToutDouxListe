import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShareListPage } from './share-list';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ShareListPage,
  ],
  imports: [
    IonicPageModule.forChild(ShareListPage),
    ComponentsModule
  ],
  exports: [
    ShareListPage
  ],
  entryComponents: [
    ShareListPage
  ]
})
export class ShareListPageModule {}