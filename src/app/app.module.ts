import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import { ChannelDetailsComponent } from './channel-details/channel-details.component';
import { AppRoutingModule } from './/app-routing.module';
import { MainComponent } from './main/main.component';
import { AccountComponent } from './account/account.component';
import { ChannelsComponent } from './channels/channels.component';
import { OperationComponent } from './operation/operation.component';
import { LightningComponent } from './lightning/lightning.component';

@NgModule({
  declarations: [
    AppComponent,
    ChannelDetailsComponent,
    MainComponent,
    AccountComponent,
    ChannelsComponent,
    OperationComponent,
    LightningComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
