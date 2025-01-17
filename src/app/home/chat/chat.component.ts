import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatService} from './chat.service';
import {ChatMessage, ChatRecipient} from 'eisenstecken-openapi-angular-library';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('chatMsgBox') chatMsgBox: ElementRef;

  messages: ChatMessage[] = [];
  recipients$: Observable<ChatRecipient[]>; //This will fail if we have more than 1 chat component -> ReplaySubject
  ivan: boolean;
  chatGroup: FormGroup = new FormGroup({
    messageInput: new FormControl(''),
    recipientSelect: new FormControl(0)
  });

  buttonLocked = false;

  subscription: Subscription;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    const iv = localStorage.getItem('ivan');
    if (iv) {
      this.ivan = iv === '1';
    } else {
      this.ivan = false;
    }
    this.subscription = new Subscription();
    this.subscription.add(this.chatService.getMessages()
      .subscribe((message: ChatMessage) => {
        this.messages.push(message);
      }));
    this.recipients$ = this.chatService.getRecipients(); //unsubscribes automatically
    console.log('Chat component started');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('Chat component destroyed');
  }

  public scrollToBottom(): void {
    try {
      this.chatMsgBox.nativeElement.scrollTop = this.chatMsgBox.nativeElement.scrollHeight;
    } catch (e) {
      console.warn(e);
    }
  }

  public send(): void {
    if (this.chatGroup.value.messageInput == null || this.chatGroup.value.messageInput.length === 0) {
      return;
    }
    if (this.chatGroup.value.messageInput.startsWith('!beautify') ||
      this.chatGroup.value.messageInput.startsWith('!whatsapp')) {
      this.ivan = true;
      localStorage.setItem('ivan', '1');
      this.resetChatControl();
      return;
    }
    if (this.chatGroup.value.messageInput.startsWith('!uglify')) {
      this.ivan = false;
      localStorage.setItem('ivan', '0');
      this.resetChatControl();
      return;
    }
    this.lockSendButton();
    const chatMessageObservable = this.chatService.sendMessage(this.chatGroup.value.messageInput, this.chatGroup.value.recipientSelect);
    chatMessageObservable.pipe(first()).subscribe(() => {
        this.resetChatControl();
      }, (message) => {
        console.error('Cannot send chat message');
        console.error(message);
      }, () => {
        this.releaseSendButton();
      }
    );
  }

  private resetChatControl() {
    this.chatGroup.reset({
      messageInput: '',
      recipientSelect: 0
    });
  }

  private lockSendButton() {
    this.buttonLocked = true;
  }

  private releaseSendButton() {
    this.buttonLocked = false;
  }

}

