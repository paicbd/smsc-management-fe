
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IpSmGwRoutingModule } from './ip-sm-gw-routing.module';
import { SipGatewaysComponent } from './sip-gateways/sip-gateways.component';
import { AddSipGatewaysComponent } from './sip-gateways/add/add-sip-gateways.component';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '@app/shared';
import { GatewaysSharedModule } from '../gateways/gateways-shared.module';
import { SipGatewayRoutingSectionComponent } from './sip-gateways/sip-gateway-routing-section.component';

@NgModule({
  declarations: [
    SipGatewaysComponent,
    AddSipGatewaysComponent,
    SipGatewayRoutingSectionComponent,
  ],
  imports: [
    CommonModule,
    IpSmGwRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DataTablesModule,
    SharedModule,
    GatewaysSharedModule,
  ],
})
export class IpSmGwModule {}
