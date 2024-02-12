import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { User } from 'src/app/auth/models/user.model.js';
import { AuthService } from 'src/app/auth/services/auth.service.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { ChatService } from '../../services/chat.service.js';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @ViewChild('form') form!: NgForm;

    userFullImagePath!: string;
    userId!: number;

    conversations$!: Observable<Conversation[]>;
    conversations: Conversation[] = [];
    conversation!: Conversation;

    newMessage$!: Observable<string>;
    messages: Message[] = [];

    friends: User[] = [];
    friend!: User;
    friend$: BehaviorSubject<User> = new BehaviorSubject<User>({});

    selectedConversationIndex: number = 0;

    private userImagePathSubscription!: Subscription;
    private userIdSubscription!: Subscription;
    private messagesSubscription!: Subscription;
    private conversationSubscription!: Subscription;
    private newMessagesSubscription!: Subscription;
    private friendsSubscription!: Subscription;
    private friendSubscription!: Subscription;

    constructor(
        private chatService: ChatService,
        private authService: AuthService
    ) {
    }

    ionViewDidEnter() {
        console.log(
            123,
            this.selectedConversationIndex,
            this.conversations,
            this.conversation,
            this.messages,
            this.friends,
            this.friend
        );

        this.userImagePathSubscription =
            this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
                this.userFullImagePath = fullImagePath;
            });

        this.userIdSubscription = this.authService.userId.subscribe(
            (userId: number) => {
                this.userId = userId;
            }
        );

        this.conversationSubscription = this.chatService
            .getConversations()
            .subscribe((conversations: Conversation[]) => {
                this.conversations.push(conversations[0]); // Note: from mergeMap stream
            });

        this.messagesSubscription = this.chatService
            .getConversationMessages()
            .subscribe((messages: Message[]) => {
                messages.forEach((message: Message) => {
                    const allMessageIds = this.messages.map(
                        (message: Message) => message.id
                    );
                    if (!allMessageIds.includes(message.id)) {
                        this.messages.push(message);
                    }
                });
            });

        this.newMessagesSubscription = this.chatService
            .getNewMessage()
            .subscribe((message: Message) => {
                message.createdAt = new Date();

                const allMessageIds = this.messages.map(
                    (message: Message) => message.id
                );
                if (!allMessageIds.includes(message.id)) {
                    this.messages.push(message);
                }
            });

        this.friendSubscription = this.friend$.subscribe((friend: any) => {
            if (friend && friend.id) { // Vérifier si friend est défini et a une propriété id
                this.chatService.joinConversation(friend.id);
            }
        });


        this.friendsSubscription = this.chatService
            .getFriends()
            .subscribe((friends: User[]) => {
                this.friends = friends;

                if (friends.length > 0) {
                    this.friend = this.friends[0];
                    this.friend$.next(this.friend);

                    friends.forEach((friend: User) => {
                        this.chatService.createConversation(friend);
                    });

                    if (this.friend && this.friend.id) { // Vérifier si this.friend est défini et a une propriété id
                        this.chatService.joinConversation(this.friend.id);
                    }
                }
            });

    }

    onSubmit() {
        const { message } = this.form.value;
        if (!message) return;

        let conversationUserIds = [this.userId, this.friend.id].sort();

        this.conversations.forEach((conversation: Conversation) => {
            if (conversation.users) { // Vérifier si conversation.users est défini
                let userIds = conversation.users.map((user: User) => user.id).sort();

                if (JSON.stringify(conversationUserIds) === JSON.stringify(userIds)) {
                    this.conversation = conversation;
                }
            }
        });

        this.chatService.sendMessage(message, this.conversation);
        this.form.reset();
    }


    openConversation(friend: User, index: number): void {
        this.selectedConversationIndex = index;

        this.chatService.leaveConversation();

        this.friend = friend;
        this.friend$.next(this.friend);

        this.messages = [];
    }

    deriveFullImagePath(user: User): string {
        let url = 'http://localhost:3000/api/feed/image/';

        if (user.id === this.userId) {
            return this.userFullImagePath;
        } else if (user.imagePath) {
            return url + user.imagePath;
        } else if (this.friend.imagePath) {
            return url + this.friend.imagePath;
        } else {
            return url + 'blank-profile-picture.png';
        }
    }

    ionViewDidLeave() {
        this.chatService.leaveConversation();

        this.selectedConversationIndex = 0;
        this.conversations = [];
        this.conversation = {} as Conversation;
        this.messages = [];
        this.friends = [];
        this.friend = {} as User; // Initialiser avec un objet vide

        //les abonnements sont annulés uniquement si ils sont définis
        if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
        if (this.userImagePathSubscription) this.userImagePathSubscription.unsubscribe();
        if (this.userIdSubscription) this.userIdSubscription.unsubscribe();
        if (this.conversationSubscription) this.conversationSubscription.unsubscribe();
        if (this.newMessagesSubscription) this.newMessagesSubscription.unsubscribe();
        if (this.friendsSubscription) this.friendsSubscription.unsubscribe();
        if (this.friendSubscription) this.friendSubscription.unsubscribe();
    }
}
