import {Component, Input, OnInit} from '@angular/core';
import {ChatMessage} from 'eisenstecken-openapi-angular-library';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input() message: ChatMessage;
  @Input() ivan: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
