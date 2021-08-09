import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import {ChatComponent} from "./chat/chat.component";
import { ChatMessageComponent } from './chat/chat-message/chat-message.component';
import {MatCardModule} from "@angular/material/card";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import { NoteComponent } from './note/note.component';
import { SingleNoteComponent } from './note/single-note/single-note.component';
import {MenuTilesComponent} from "./menu-tiles/menu-tiles.component";
import {MatGridListModule} from "@angular/material/grid-list";
import { SingleMenuTileComponent } from './menu-tiles/single-menu-tile/single-menu-tile.component';
import {CalendarsChatFrameComponent} from "./calendars-chat-frame/calendars-chat-frame.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTabsModule} from "@angular/material/tabs";

@NgModule({
  declarations: [HomeComponent, ChatComponent, ChatMessageComponent, NoteComponent, SingleNoteComponent, MenuTilesComponent, SingleMenuTileComponent, CalendarsChatFrameComponent],
  exports: [
    ChatComponent
  ],
  imports: [CommonModule, SharedModule, HomeRoutingModule, MatCardModule, FlexLayoutModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, MatGridListModule, MatProgressSpinnerModule, MatTabsModule]
})
export class HomeModule {}
