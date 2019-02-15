import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactProvider } from '../../providers/contact/contact';
import { Observable } from 'rxjs';
import { PublicUser } from '../../app/TodoList/model/model';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  // NgModels
  formValidation: FormGroup;
  userName: string;
  searchResult$?: Observable<PublicUser[]>

  constructor(public navCtrl: NavController, private contactProvider: ContactProvider) {

    this.formValidation = new FormGroup(({
      name: new FormControl('', Validators.required),
    }));

    this.searchResult$ = contactProvider.getContactSearchSub();
    this.searchResult$.subscribe(users => {
      console.log('ContactPage: users=' + JSON.stringify(users));
    });
  }

  public searchUsers() {

    if(this.userName) {

      this.contactProvider.searchOtherUser(this.userName);
    }
  }
}
