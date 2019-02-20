import { Component, Input } from '@angular/core';
import { TodoItem } from '../../app/TodoList/model/model';


@Component({
  selector: 'item-edit',
  templateUrl: 'item-edit.html'
})
export class ItemEditComponent {

  @Input('item') item?: TodoItem;

  constructor() {
    
  }

}
