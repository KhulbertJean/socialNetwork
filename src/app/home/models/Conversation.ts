import { User } from 'src/app/auth/models/user.model.js';

export interface Conversation {
    id?: number;
    users?: User[];
    lastUpdated?: Date;
}
