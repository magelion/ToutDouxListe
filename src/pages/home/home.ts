import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TodoList } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {
  
  lists: Observable<TodoList[]>;

  constructor(private todoService: TodoServiceProvider, private alertCtrl: AlertController) {
  }

  ngOnInit() {
    this.todoService.getTodoListsSub().subscribe(obs => {

      this.lists = obs;
    });
  }

  createListCommand() {
    const prompt = this.alertCtrl.create({
      title: 'Create List',
      message: 'Enter list name',
      inputs: [
        {
          name : 'name',
          placeholder : 'My awsome list'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
            this.createList(data.name);
          }
        }
      ]
    });
    prompt.present();
  }

  createList(name: string) {
    this.todoService.createList(name);
  }
}
