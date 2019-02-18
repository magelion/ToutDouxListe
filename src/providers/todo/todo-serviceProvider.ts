import { Injectable } from '@angular/core';
import {TodoItem, TodoList, User, PublicUser} from "../../app/TodoList/model/model";
import {Observable, BehaviorSubject, from, forkJoin} from "rxjs";
import 'rxjs/Rx';
import { v4 as uuid } from 'uuid';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map, tap, take } from 'rxjs/operators';
import { AuthenticationProvider } from '../authentication/authentication';

@Injectable()
export class TodoServiceProvider {

  public static readonly TODO_LISTS_DB_NAME:string = 'TodoLists';

  private todoListsRef: AngularFirestoreCollection<TodoList>;
  private todoLists$:Observable<TodoList[]>;
  private todoListsSub$: BehaviorSubject<Observable<TodoList[]>>;
  private user: User;

  constructor(private afs: AngularFirestore, authProvider: AuthenticationProvider) {
    console.log('Hello TodoServiceProvider Provider');

    this.todoListsRef = null;
    this.todoLists$ = null;
    this.todoListsSub$ = new BehaviorSubject(null);
    
    authProvider.getUserObs().subscribe(user => {
      
      if(user != null) {
        this.user = user;
        console.log('TodoService : user = ' + JSON.stringify(user));

        this.todoListsRef = null;
        this.todoListsRef = afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME, 
          ref => ref.where('owner', '==', user.uid));

        this.todoListsSub$.next(this.updateLists());
      }
    });
  }

  public getTodoListsSub() : Observable<Observable<TodoList[]>> {
    return this.todoListsSub$.asObservable();
  }

  private updateLists() : Observable<TodoList[]> {

    console.log('updateList called');

    this.todoListsRef = this.afs.collection(TodoServiceProvider.TODO_LISTS_DB_NAME);
    const colRef = this.todoListsRef.ref;

    const ownedListSnap$ = from(colRef.where('owner', '==', this.user.uid).get());
    const sharedListSnap$ = from(colRef.where('sharedTo', 'array-contains', this.user.publicUid).get());

    const finalObs$ = forkJoin(ownedListSnap$, sharedListSnap$).map(data => {
      return data[0].docs.concat(data[1].docs);
    });
    //const finalObs$ = Observable.merge(ownedListSnap$, sharedListSnap$);

    this.todoLists$ = finalObs$.pipe(
      
      map(docs => {
        return docs.map(doc => {
          return doc.data() as TodoList;
        });
      }),
      tap(lists => console.log("Lists fetched : " + JSON.stringify(lists)))
    );

    // if(this.todoListsRef === null) {
    //   return Observable.empty();
    // }
    // this.todoLists = this.todoListsRef.snapshotChanges().pipe(

    //   map(actions => actions.map(a => {

    //     var data = a.payload.doc.data() as TodoList;

    //     data = this.mapFetchedList(data);
    //     return data;

    //   })),
    //   tap(lists => console.log("Lists fetched : " + JSON.stringify(lists)))
    // );
    return this.todoLists$;
  }

  private mapFetchedList(list : TodoList) : TodoList{

    if(!list.items) {
      list.items = new Array();
    }
    if(!list.sharedTo) list.sharedTo = new Array();

    return list;
  }

  public getLists(): Observable<TodoList[]> {

    return this.updateLists();
  }

  public getList(key: string): Observable<TodoList>{

    if(this.todoListsRef === null) {
      console.log('TodoProvider : getList : ref null');
      return Observable.empty();
    }
    return this.getTodoListDoc(key).valueChanges().map(value => {

      value = this.mapFetchedList(value);
      return value;
    });
  }

  private getTodoListDoc(listKey: string) : AngularFirestoreDocument<TodoList> {

    if(this.todoListsRef === null) {
      return null;
    }
    return this.afs.doc(TodoServiceProvider.TODO_LISTS_DB_NAME + '/' + listKey);
  }

  public editTodoList(list: TodoList) : Promise<void> {

    if(this.todoListsRef === null) {
      console.log('TodoProvider : editTodoList : ref null : nothing updated');
      return new Promise<void>(() => {});
    }
    console.log('TodoProvider : editTodoList : list=' + JSON.stringify(list));
    return this.getTodoListDoc(list.uuid).update(list);
  }

  public editTodo(listUuid : string, editedItem: TodoItem) : Observable<Promise<void>> {

    if(this.todoListsRef === null || !editedItem || !listUuid) {
      return Observable.empty();
    }
    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === editedItem.uuid);
        todoList.items[index] = editedItem;
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteTodo(listUuid: string, uuid: String) : Observable<Promise<void>> {

    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    return this.getList(listUuid).pipe(
      
      map((todoList) => {
        const index = todoList.items.findIndex(item => item.uuid === uuid);
        todoList.items.splice(index, 1);
        return this.editTodoList(todoList);
      })
    );
  }

  public deleteList(listKey: string) : Promise<void> {

    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    return this.getTodoListDoc(listKey).delete()
      .then(value => console.log("List deleted " + listKey))
      .catch(reason => console.log("error while deleting list" + reason));
  }

  public createList(name: string) : Promise<void> {
    
    if(this.todoListsRef === null) {
      return new Promise<void>(() => {});
    }
    const newUuid = uuid();
    let newList = {
      uuid : newUuid,
      name : name,
      items : new Array(),
      owner : this.user.uid
    } as TodoList;

    return this.todoListsRef.add(newList)
    .then(newListRef => {
      
      newList.uuid = newListRef.id;
      this.editTodoList(newList);
    })
    .catch(error => {
      console.log("CreateList error : " + JSON.stringify(error));
    });
  }

  public createItem(listUuid:string, item:TodoItem) : Observable<Promise<void>> {

    if(this.todoListsRef === null) {
      return Observable.empty();
    }
    return this.getList(listUuid).pipe(
      
      take(1), // Avoid loop creation
      tap (todoList => console.log('Creating item (' + JSON.stringify(item) + ')' + '\nin list(uuid=' + listUuid + ': ' +  JSON.stringify(todoList))),
      map(todoList => {
        if(!todoList.items) {
          todoList.items = new Array();
        }
        todoList.items.push(item);
        return this.editTodoList(todoList);   
      }) 
    );
  }
}
