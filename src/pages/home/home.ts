import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TodoList } from '../../app/model/model';
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit, OnDestroy {
  public lists: TodoList[];
  private subToken : Subscription;
  
  constructor(private todoService: TodoServiceProvider, private alertCtrl: AlertController) {

    this.subToken = this.todoService.getTodoListsObs().subscribe(lists => {
      
      console.log('Home : updated : ' + JSON.stringify(lists));
      this.lists = lists;
    });
  }
  
  ngOnInit() {
    
  }
  
  ngOnDestroy(): void {
    this.subToken.unsubscribe();
  }

  createListCommand() {
    const prompt = this.alertCtrl.create({
      title: 'Enter list name',
      message: '',
      inputs: [
        {
          name : 'name',
          placeholder : 'My awsome list',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
            const valid:boolean = this.validateListName(data.name);
            if(valid) {

              this.createList(data.name);
              return true;
            }
            else {
              prompt.setMessage('Invalid list name entered');
              return false;
            }
          }
        }
      ]
    });
    prompt.present();
  }

  private createList(name: string) {
    this.todoService.createList(name);
  }

  private validateListName(name: string) : boolean {

    if(name) {
      return true;
    }
    else {
      return false;
    }
  }
}
