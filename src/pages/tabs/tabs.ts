import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { HomePage } from '../home/home';
import { AcountPage } from '../acount/acount';
import { ContactListPage } from '../contact-list/contact-list';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = ContactListPage;
  tab4Root = AcountPage;

  constructor() {

  }
}
