import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ChatService} from "./chat.service";
import {ChatMessage, ChatRecipient} from "eisenstecken-openapi-angular-library";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  messages: ChatMessage[] = [];
  recipients$ : Observable<ChatRecipient[]>;

  chatGroup: FormGroup = new FormGroup({
    messageInput : new FormControl( ),
    recipientSelect : new FormControl()
  });

  buttonLocked = false;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.chatService.getMessages() //TODO: moving this to the constructor should load messages even though the component is not loaded sometimes
      .subscribe((message: ChatMessage) => { //TODO: maybe we could reset the index when lifecycle has ended
        this.messages.push(message);
      });
    this.recipients$ =  this.chatService.getRecipients();
  }

  @ViewChild('chatMsgBox') chatMsgBox: ElementRef;

  public scrollToBottom(): void {
    try {
      this.chatMsgBox.nativeElement.scrollTop = this.chatMsgBox.nativeElement.scrollHeight;
    } catch (e) {
      console.error(e);
    }
  }

  public send() : void{
    if(this.chatGroup.value.messageInput == null || this.chatGroup.value.messageInput.length == 0)
      return;
    this.lockSendButton();
    const chatMessageObservable = this.chatService.sendMessage(this.chatGroup.value.messageInput, this.chatGroup.value.recipientSelect);
    chatMessageObservable.subscribe(() => {
      this.resetChatControl();
    }, (message) => {
      console.error("Cannot send chat message");
      console.error(message);
    }, () => {
      this.releaseSendButton();
    }
    );
  }

  private resetChatControl() {
    console.log("clearing");
    this.chatGroup.reset({
      "messageInput" : "",
      "recipientSelect" : 0
    });
  }

  private lockSendButton() {
    this.buttonLocked = true;
  }

  private releaseSendButton() {
    this.buttonLocked = false;
  }

}

