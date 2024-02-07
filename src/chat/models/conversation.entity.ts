import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';
import { UserEntity } from "../../auth/models/user.entity";


@Entity('conversation')
export class ConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.conversation)
  messages: MessageEntity[];

  @UpdateDateColumn()
  lastUpdated: Date;
}
