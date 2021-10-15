import {Injectable} from '@angular/core';
import {DefaultService, ChatMessageCreate, ChatMessage, ChatRecipient} from 'eisenstecken-openapi-angular-library';
import {Observable, Subscriber} from 'rxjs';
import {first, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    // TODO: Nachrichten kommen oft nicht an
    // TODO: Mehrzeilige Nachichten haben nicht den gewünschten effekt

    private secondsBetweenNewMessageCheck = 300;

    private readonly messages$: Observable<ChatMessage>;
    private readonly amountOfUnreadMessages$: Observable<number>;
    private amountOfUnreadMessagesSubscriber: Subscriber<number>;

    private amountOfUnreadMessages = 0;
    private lastId = 0;
    private messageSubscriber: Subscriber<ChatMessage>;

    constructor(private api: DefaultService) {
        this.messages$ = new Observable((messageSubscriber) => {
            this.messageSubscriber = messageSubscriber;
            this.check4Messages();
            setInterval(() => { //this can go endlessly, because this service is a singleton -> maybe stop it if there are no active subscribers
                this.check4Messages();
            }, 1000 * this.secondsBetweenNewMessageCheck);
        });
        this.amountOfUnreadMessages$ = new Observable((amountOfUnreadMessagesSubscriber) => {
            this.amountOfUnreadMessagesSubscriber = amountOfUnreadMessagesSubscriber;
        });
    }

    public resetUnreadMessageCount(): void {
        this.amountOfUnreadMessages = 0;
        this.pushUnreadMessageCountToSubscriber();
    }

    public getRecipients(): Observable<ChatRecipient[]> {
        return this.api.readChatRecipientsChatsRecipientsGet();
    }

    public sendMessage(message: string, sendTo: number): Observable<ChatMessage> {
        const chatMessage: ChatMessageCreate = {text: message};
        return this.api.createChatMessageChatsUserIdPost(sendTo, chatMessage).pipe(
            tap(() => {
                this.check4Messages();
            }));
    }

    public getMessages(): Observable<ChatMessage> {
        this.lastId = 0;
        return this.messages$;
    }

    public getAmountOfUnreadMessages(): Observable<number> {
        return this.amountOfUnreadMessages$;
    }

    private check4Messages() {
        this.api.readChatMessagesSinceIdChatsLastIdGet(this.lastId).pipe(first()).subscribe({
            next: messages => {//TODO: move this style to other components. This is way more clean than the stuff is used now
                messages.forEach((message) => {
                    if (this.lastId < message.id) {
                        this.lastId = message.id;
                    }
                    this.messageSubscriber.next(message);
                    this.checkIfUnreadMessageCountNeedsIncrement(message);
                });
            },
            error: msg => {
                console.error('ChatService: Could not check for new Messages. ' +
                    'Retrying in ' + this.secondsBetweenNewMessageCheck.toString() + ' seconds.');
                console.error(msg);
            }
        });
    }

    private pushUnreadMessageCountToSubscriber(): void {
        if (this.amountOfUnreadMessagesSubscriber !== undefined) {
            this.amountOfUnreadMessagesSubscriber.next(this.amountOfUnreadMessages);
        } else {
            console.warn('ChatService: Skipped refreshing unread chat messages, because the Subscriber was not ready yet');
        }
    }

    private checkIfUnreadMessageCountNeedsIncrement(message: ChatMessage): void {
        if (!message.own) {
            this.incrementUnreadMessageCount();
        }
    }

    private incrementUnreadMessageCount(): void {
        this.amountOfUnreadMessages++;
        this.pushUnreadMessageCountToSubscriber();
    }


}
