import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { FeedPostEntity } from './models/post.entity';
import { IsCreatorGuard } from './guards/is-creator.guard';
import {AuthModule} from "../auth/security.module";

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([FeedPostEntity])],
    providers: [FeedService, IsCreatorGuard],
    controllers: [FeedController],
})
export class FeedModule {}