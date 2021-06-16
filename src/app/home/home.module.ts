import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import {ChatComponent} from "./chat/chat.component";
import { ChatMessageComponent } from './chat/chat-message/chat-message.component';
import {MatCardModule} from "@angular/material/card";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
  declarations: [HomeComponent, ChatComponent, ChatMessageComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, MatCardModule, FlexLayoutModule]
})
export class HomeModule {}
