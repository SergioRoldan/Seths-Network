import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { ChannelComponent } from './channel/channel.component';
import { ChannelDetailsComponent } from './channel-details/channel-details.component';

@NgModule({
  declarations: [
    AppComponent,
    ChannelComponent,
    ChannelDetailsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
