import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  sender: string;
  sendtime: string;
  message: string;

  constructor() { }

  ngOnInit(): void {
  }

}
