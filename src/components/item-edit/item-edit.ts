import { Component, Input } from '@angular/core';
import { TodoItem } from '../../app/TodoList/model/model';
import { FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'item-edit',
  templateUrl: 'item-edit.html'
})
export class ItemEditComponent {

  @Input('item') item?: TodoItem;

  public nameForm: FormControl;
  public descForm: FormControl;

  public name: string;
  public dest: string;

  constructor() {
    
    this.nameForm = new FormControl('', Validators.required);
    this.descForm = new FormControl('');
  }

}
