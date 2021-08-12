import { Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogService  {

  constructor() {

  }

  handleError(error: any): void {
    console.log(error);
    console.log("error-log");
  }


}

