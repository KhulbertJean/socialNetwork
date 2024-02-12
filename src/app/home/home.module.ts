import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page.js';

import { HomePageRoutingModule } from './home-routing.module.js';
import { HeaderComponent } from './components/header/header.component.js';
import { ProfileSummaryComponent } from './components/profile-summary/profile-summary.component.js';
import { StartPostComponent } from './components/start-post/start-post.component.js';
import { AdvertisingComponent } from './components/advertising/advertising.component.js';
import { ModalComponent } from './components/start-post/modal/modal.component.js';
import { TabsComponent } from './components/tabs/tabs.component.js';
import { ConnectionProfileComponent } from './components/connection-profile/connection-profile.component.js';
import { PopoverComponent } from './components/header/popover/popover.component.js';
import { UserProfileComponent } from './components/user-profile/user-profile.component.js';
import { FriendRequestsPopoverComponent } from './components/header/friend-requests-popover/friend-requests-popover.component.js';
import { ChatComponent } from './components/chat/chat.component.js';
import {AllPostsComponent} from "./components/all-post/all-post.component.js";



@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
  declarations: [
    HomePage,
    HeaderComponent,
    ProfileSummaryComponent,
    StartPostComponent,
    AdvertisingComponent,
    ModalComponent,
    AllPostsComponent,
    TabsComponent,
    ConnectionProfileComponent,
    PopoverComponent,
    UserProfileComponent,
    FriendRequestsPopoverComponent,
    ChatComponent,
  ],
})
export class HomePageModule {}
