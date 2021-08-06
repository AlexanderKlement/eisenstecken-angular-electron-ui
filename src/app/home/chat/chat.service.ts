import { Injectable } from '@angular/core';
import {DefaultService, ChatMessageCreate, ChatMessage, ChatRecipient} from "eisenstecken-openapi-angular-library";
import {Observable, Subscriber} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  lastId = 0;
  messageObserver:Observable<ChatMessage>;

  constructor(private api: DefaultService) {
    this.messageObserver = new Observable((observer) => {
      setInterval(() => {
        this.check4Messages(observer);
      }, 5000);
    });
  }

  public sendMessage(message: string, sendTo: number): Observable<ChatMessage> {
    const chatMessage:ChatMessageCreate = {text:message};
    return this.api.createChatMessageChatsUserIdPost(sendTo, chatMessage);
  }

  public getMessages () : Observable<ChatMessage>{
    return this.messageObserver;
  }

  private check4Messages(observer: Subscriber<ChatMessage>) {
    const new_messages = this.api.readChatMessagesSinceIdChatsLastIdGet(this.lastId);
    new_messages.subscribe({ //TODO: this should be piped through a "first()" to ensure we have no memory leak??
      next: messages => {//TODO: check if this could be a bad idea and a lot of overheat
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

  public getRecipients(): Observable<ChatRecipient[]>{
    return this.api.readChatRecipientsChatsRecipientsGet();
  }
}
