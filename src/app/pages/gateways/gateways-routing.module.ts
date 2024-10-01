import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Ss7Component } from './ss7/ss7.component';
import { SmppComponent } from './smpp/smpp.component';
import { ConfigurationsComponent } from './ss7/configurations/configurations.component';
import { M3uaComponent } from './ss7/configurations/m3ua/m3ua.component';
import { SccpComponent } from './ss7/configurations/sccp/sccp.component';
import { TcapMapComponent } from './ss7/configurations/tcap-map/tcap-map.component';


const routes: Routes = [
  {
    path: 'smpp',
    component: SmppComponent,
  },
  {
    path: 'ss7',
    component: Ss7Component,
  },
  {
    path: 'ss7/configurations/:network_id',
    component: ConfigurationsComponent
  },
  {
    path: 'ss7/configurations/:network_id/m3ua',
    component: M3uaComponent,
  },
  {
    path: 'ss7/configurations/:network_id/sccp',
    component: SccpComponent,
  },
  {
    path: 'ss7/configurations/:network_id/tcap-map',
    component: TcapMapComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatewaysRoutingModule {
}
