import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { PublicUser } from '../../app/TodoList/model/model';

@Component({
  selector: 'contact',
  templateUrl: 'contact.html'
})
export class ContactComponent implements OnChanges{

  @Input() contact?: PublicUser;

  constructor(private cdRef: ChangeDetectorRef) {

    console.log('ContactComponent : contact=' + JSON.stringify(this.contact));
  }

  ngOnChanges(changes: SimpleChanges): void {

    console.log('ContactComponent : change=' + JSON.stringify(this.contact));
    // For some reasons, angular doesn't get the changes on contactList
    this.cdRef.detectChanges();
  }
}
