import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { User } from 'src/app/auth/models/user.model.js';
import { ChatSocketService } from 'src/app/core/chat-socket.service.js';
import { environment } from 'src/environments/environment.js';
import {Conversation} from "../models/Conversation.js";
import {Message} from "../models/Message.js";


@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private socket: ChatSocketService, private http: HttpClient) {}

    getFriends(): Observable<User[]> {
        return this.http.get<User[]>(`${environment.baseApiUrl}/user/friends/my`);
    }

    sendMessage(message: string, conversation: Conversation): void {
        const newMessage: Message = {
            message,
            conversation,
        };
        this.socket.emit('sendMessage', newMessage);
    }

    getNewMessage(): Observable<Message> {
        return this.socket.fromEvent<Message>('newMessage');
    }

    createConversation(friend: User): void {
        this.socket.emit('createConversation', friend);
    }

    joinConversation(friendId: number): void {
        this.socket.emit('joinConversation', friendId);
    }

    leaveConversation(): void {
        this.socket.emit('leaveConversation');
    }

    getConversationMessages(): Observable<Message[]> {
        return this.socket.fromEvent<Message[]>('messages');
    }

    getConversations(): Observable<Conversation[]> {
        return this.socket.fromEvent<Conversation[]>('conversations');
    }
}
