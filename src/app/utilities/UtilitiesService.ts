import { Injectable } from '@angular/core';
import 'rxjs/Rx';

@Injectable()
export class UtilitiesService {

  private varExtractor:RegExp;

  constructor() {
    console.log('Hello Utilities Service');
    this.varExtractor = new RegExp("return (.*);")
  }

  public getVariableName<TResult>(name: () => TResult) {
    var m = this.varExtractor.exec(name + "");
    if (m == null) throw new Error("The function does not contain a statement matching 'return variableName;'");
    return m[1];
  }
}
