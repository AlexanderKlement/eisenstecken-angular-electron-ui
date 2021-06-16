import { Component, OnInit } from '@angular/core';
import {ChatService} from "./chat.service";
import {ChatMessage} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  messages: ChatMessage[] = [];

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService
      .getMessages()
      .subscribe((message: ChatMessage) => {
        this.messages.push(message);
      });
  }

}

