import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TodoList } from '../../app/TodoList/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {
  
  public lists: TodoList[];
  private subToken : Subscription;

  constructor(private todoService: TodoServiceProvider, private alertCtrl: AlertController, private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.todoService.getTodoListsSub().subscribe(obs => {

      if(this.subToken) {
        this.subToken.unsubscribe();
      }
      this.subToken = obs.subscribe(lists => {

        console.log('Home : updated : ' + JSON.stringify(lists));
        this.lists = lists
      })
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
