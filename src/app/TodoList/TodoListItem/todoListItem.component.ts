import {Component, OnInit, OnDestroy, Input} from '@angular/core'
import {TodoItem} from "../model/model";

@Component({
  selector: 'todoListItem',
  templateUrl: './todoListItem.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {

  @Input() items: TodoItem[];

  constructor() {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  selectItem (item: TodoItem) {
    console.log(item);
  }
}
