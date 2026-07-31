import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDeleteComponent } from './components/modal-delete/modal-delete.component';
import { ModalBalanceComponent } from './components/modal-balance/modal-balance.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { PasswordFormComponent } from './components/password-form/password-form.component';
import { FormInputRowComponent } from './components/form-input-row/form-input-row.component';
import { FormSelectRowComponent } from './components/form-select-row/form-select-row.component';
import { FormCheckboxRowComponent } from './components/form-checkbox-row/form-checkbox-row.component';
import { FormSectionComponent } from './components/form-section/form-section.component';

@NgModule({
  declarations: [
    ModalDeleteComponent,
    ModalBalanceComponent,
    PasswordFormComponent,
    FormInputRowComponent,
    FormSelectRowComponent,
    FormCheckboxRowComponent,
    FormSectionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule
  ],
  exports: [
    ModalDeleteComponent,
    ModalBalanceComponent,
    PasswordFormComponent,
    FormInputRowComponent,
    FormSelectRowComponent,
    FormCheckboxRowComponent,
    FormSectionComponent,
  ]
})
export class SharedModule { }
