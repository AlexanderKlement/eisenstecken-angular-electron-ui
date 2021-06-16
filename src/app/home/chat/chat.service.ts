import { Injectable } from '@angular/core';
import {DefaultService, ChatMessageCreate, ChatMessage} from "eisenstecken-openapi-angular-library";
import {Observable, Subscriber} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  lastId = 0;

  constructor(private api: DefaultService) { }

  public sendMessage(message: string, sendTo: number): void {
    const chatMessage:ChatMessageCreate = {text:message};
    this.api.createChatMessageChatsUserIdPost(sendTo, chatMessage);
    // TODO: maybe show something if the chat Message could not be sent
  }

  public getMessages () : Observable<ChatMessage>{
    return new Observable((observer) => {
      setInterval(() => {
        this.doMessageStuff(observer);
        this.trySomething();
      }, 5000);
    });
  }

  public trySomething(): void {
    const new_messages = this.api.readUsersMeUsersMeGet();
    new_messages.subscribe({
      next: messages => {
        console.log(messages);
      },
      error: msg => {
        console.log('Error logging in: ', msg);
        //TODO: do something if no success -> display message chat service not available at the moment
      }
    });
  }


  private doMessageStuff(observer: Subscriber<ChatMessage>) {
    const new_messages = this.api.readChatMessagesSinceIdChatsLastIdGet(this.lastId);
    new_messages.subscribe({
      next: messages => {
        messages.forEach((message) => {
          if(this.lastId < message.id){
            this.lastId = message.id;
          }
          observer.next(message);
        });
      },
      error: msg => {
        console.log('Error logging in: ', msg);
        //TODO: do something if no success -> display message chat service not available at the moment
      }
    });
  }
}
