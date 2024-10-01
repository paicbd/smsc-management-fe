import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDeleteComponent } from './components/modal-delete/modal-delete.component';
import { ModalBalanceComponent } from './components/modal-balance/modal-balance.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [
    ModalDeleteComponent,
    ModalBalanceComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule
  ],
  exports: [
    ModalDeleteComponent,
    ModalBalanceComponent
  ]
})
export class SharedModule { }
