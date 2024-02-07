import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './gateway/chat.gateway';
import { ActiveConversationEntity } from './models/active-conversation.entity';
import { ConversationEntity } from './models/conversation.entity';
import { MessageEntity } from './models/message.entity';
import { ConversationService } from './services/conversation.service';
import {AuthModule} from "../auth/security.module";

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([
            ConversationEntity,
            ActiveConversationEntity,
            MessageEntity,
        ]),
    ],
    providers: [ChatGateway, ConversationService],
})
export class ChatModule {}