import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent} from './main/main.component';
import { AccountComponent } from './account/account.component';
import { ChannelDetailsComponent } from './channel-details/channel-details.component';
import { ChannelsComponent } from './channels/channels.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent},  
  { path: 'accounts/:account', 
    component: AccountComponent,
    children: [
      { path: 'channels', redirectTo: ''},
      { path: '', component: ChannelsComponent},
      { path: 'channels/:channel', component: ChannelDetailsComponent}
    ]
  }
]

@NgModule({
  imports:[ RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

  


}
