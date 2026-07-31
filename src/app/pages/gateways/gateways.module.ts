import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatewaysRoutingModule } from './gateways-routing.module';
import { GatewaysComponent } from './gateways.component';
import { GatewaysSharedModule } from './gateways-shared.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    GatewaysComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    GatewaysRoutingModule,
    GatewaysSharedModule,
  ],
  providers: []
})
export class GatewaysModule { }
