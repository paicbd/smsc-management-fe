import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppLayoutComponent } from '@theme/layout/app-layout/app-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'service-providers', loadChildren: () => import('./service-providers/service-providers.module').then(m => m.ServiceProvidersModule)
      },
      {
        path: 'gateways', loadChildren: () => import('./gateways/gateways.module').then(m => m.GatewaysModule)
      },
      {
        path: 'mnos', loadChildren: () => import('./mnos/mnos.module').then(m => m.MnosModule)
      },
      {
        path: 'rules-and-routing', loadChildren: () => import('./rules-service-providers/rules-service-providers.module').then(m => m.RulesServiceProvidersModule)
      },
      {
        path: 'delivery-error-code', loadChildren: () => import('./delivery-error-code/delivery-error-code.module').then(m => m.DeliveryErrorCodeModule)
      },
      {
        path: 'error-code', loadChildren: () => import('./error-code/error-code.module').then(m => m.ErrorCodeModule)
      },
      {
        path: 'error-code-mappging', loadChildren: () => import('./error-code-mapping/error-code-mapping.module').then(m => m.ErrorCodeMappingModule)
      },
      {
        path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'reports', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'broadcast', loadChildren: () => import('./broadcast/broadcast.module').then(m => m.BroadCastModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      // {
      //   path: '**',
      //   component: NotFoundComponent,
      // },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
