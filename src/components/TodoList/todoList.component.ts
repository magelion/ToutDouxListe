import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { TodoList, User, PublicUser } from "../../app/TodoList/model/model";
import { TodoServiceProvider } from '../../providers/todo/todo-serviceProvider'
import { NavController, AlertController } from "ionic-angular";
import { TodoItemsPage } from "../../pages/todo-items/todo-items";
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { ContactProvider } from '../../providers/contact/contact';

@Component({
  selector: 'todoList',
  templateUrl: './todoList.component.html'
})
export class TodoComponent implements OnChanges{

  @Input() list?: TodoList;

  private user: User;
  public ownerName: string = "";

  constructor(
    public todoService: TodoServiceProvider,
    private navController: NavController,
    private alertCtrl: AlertController,
    private auth: AuthenticationProvider,
    private contactProvider: ContactProvider
  ) {

    this.auth.getUserObs().subscribe(user => {
      this.user = user;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    for(let propName in changes) {

      console.log('todoListComponent : ngOnChanges : propName=' + propName);
      if(propName === 'list') {
        console.log('todoListComponent : ngOnChanges : list.owner=' + this.list.owner);
        this.getListOwnerName(this.list).then(value => {
          this.ownerName = value;
          console.log('todoListComponent : ngOnChanges : ownerName=' + this.ownerName);
        });
      }
    }
  }

  selectList(list: TodoList) {
    console.log('selectList: uuid=', list.uuid);
    this.navController.push(TodoItemsPage, {
      uuid: list.uuid
    });
  }

  deleteList(list: TodoList) {
    this.todoService.deleteList(list.uuid);
  }

  nbUnfinishedItems(list: TodoList): number {

    if(list.items) {
      return list.items.filter(value => {
        return !value.complete;
      }).length;
    }
    else {
      return 0;
    }
  }

  editListCommand(list: TodoList) {
    const prompt = this.alertCtrl.create({
      title: 'Edit List',
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
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
            list.name = data.name;
            this.todoService.editTodoList(list);
          }
        }
      ]
    });
    prompt.present();
  }

  public isListCompleted(list: TodoList) : boolean {

    return this.nbUnfinishedItems(list) === 0;
  }

  public isSharedList(list: TodoList) : boolean {

    return (this.user && list.owner !== this.user.uid);
  }

  public async getListOwnerName(list: TodoList) : Promise<string> {

    console.log('todoListComponent : getListOwnerName : list.publicOwner=' + list.publicOwner);
    return this.contactProvider.getPublicUser(list.publicOwner).then(value => {
      console.log('todoListComponent : getListOwnerName : value=' + JSON.stringify(value));

      if(value) {
        return value.displayName
      }
      else {
        return null;
      }
    });
    // const promise: Promise<PublicUser>  = this.contactProvider.getPublicUser(list.owner); 
    // console.log('todoListComponent : getListOwnerName : list.owner=' + list.owner);
    // if(promise) {
    //   const pubUser: PublicUser = await promise;
    //   if(pubUser) {
    //     console.log('todoListComponent : getListOwnerName : pubUserName=' + pubUser.displayName);
    //     return pubUser.displayName;
    //   }
    // }
    // console.log('todoListComponent : getListOwnerName : null!!!');
    // return null;
  }
}
