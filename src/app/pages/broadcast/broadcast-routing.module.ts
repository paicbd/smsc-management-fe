import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { BroadCastComponent } from './broadcast.component';
const routes: Routes = [
  {
    path: '',
    component: BroadCastComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BroadCastRoutingModule {
}
