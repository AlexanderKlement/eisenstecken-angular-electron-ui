import { Component, OnInit } from '@angular/core';
import {ChatService} from "./chat.service";
import {ChatMessage, ChatRecipient} from "eisenstecken-openapi-angular-library";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  messages: ChatMessage[] = [];
  recipients: ChatRecipient[] = [];

  chatGroup: FormGroup = new FormGroup({
    message : new FormControl( "",[
      Validators.minLength(1)
    ]),
    recipient : new FormControl()
  });

  buttonLocked = false;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.chatService
      .getMessages()
      .subscribe((message: ChatMessage) => {
        this.messages.push(message);
      });
    this.chatService.getRecipients().subscribe((recipients) => {
      this.recipients = recipients;
    });
  }

  public send() : void{
    this.lockSendButton(); //TODO: validate message and recipient
    const chatMessageObservable = this.chatService.sendMessage(this.chatGroup.value.message, this.chatGroup.value.recipient);
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
      "message" : "",
      "recipient" : 0
    });
  }

  private lockSendButton() {
    this.buttonLocked = true;
  }

  private releaseSendButton() {
    this.buttonLocked = false;
  }

}

