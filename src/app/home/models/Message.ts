import { User } from 'src/app/auth/models/user.model.js';
import { Conversation } from './Conversation.js';

export interface Message {
    id?: number;
    message?: string;
    user?: User;
    conversation?: Conversation;
    createdAt?: Date;
}
