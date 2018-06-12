import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent} from './main/main.component';
import { AccountComponent } from './account/account.component';
import { ChannelDetailsComponent } from './channel-details/channel-details.component';
import { ChannelsComponent } from './channels/channels.component';
import { OperationComponent } from './operation/operation.component';
import { LightningComponent } from './lightning/lightning.component';
import { NotificationsComponent } from './notifications/notifications.component';

//Defines routes at app root level. :something refers to an object or variable encoded in the URL that can be retrieved in the
//destination components of the route
const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent}, 
  { path: 'notifications', component: NotificationsComponent}, 
  { path: 'accounts/:account', 
    component: AccountComponent,
    children: [ //Declares subroutes of accounts/:account (e.g. accounts/:account/channels/:channel) as child routes
      { path: 'channels', redirectTo: ''},
      { path: '', component: ChannelsComponent},
      { path: 'ethereum/:options', component: OperationComponent},
      { path: 'lightning/:options', component: LightningComponent},
      { path: 'channels/:channel', component: ChannelDetailsComponent}
    ]
  }
]

@NgModule({
  imports:[RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}
