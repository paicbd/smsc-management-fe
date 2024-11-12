import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadCastRoutingModule } from './broadcast-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { AddComponent } from './add/add.component';
import { BroadCastComponent } from './broadcast.component';

@NgModule({
  declarations: [
    BroadCastComponent,
    AddComponent
  ],
  imports: [
    CommonModule,
    BroadCastRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class BroadCastModule { }
