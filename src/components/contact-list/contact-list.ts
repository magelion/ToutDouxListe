import { Component } from '@angular/core';

@Component({
  selector: 'contact-list',
  templateUrl: 'contact-list.html'
})
export class ContactListComponent {

  text: string;

  constructor() {
    console.log('Hello ContactListComponent Component');
    this.text = 'Hello World';
  }

}
