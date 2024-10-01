import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceProvidersRoutingModule } from './service-providers-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { ServiceProvidersComponent } from './service-providers.component';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '@app/shared';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ServiceProvidersComponent,
    AddComponent,
  ],
  imports: [
    CommonModule,
    ServiceProvidersRoutingModule,
    ReactiveFormsModule,
    DataTablesModule,
    SharedModule,
    DragDropModule,
  ],
  providers: []
})
export class ServiceProvidersModule { }
