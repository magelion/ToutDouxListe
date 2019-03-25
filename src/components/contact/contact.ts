import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { PublicUser } from '../../app/model/model';

@Component({
  selector: 'contact',
  templateUrl: 'contact.html'
})
export class ContactComponent{

  @Input() contact?: PublicUser;

  constructor() {

  }
}
