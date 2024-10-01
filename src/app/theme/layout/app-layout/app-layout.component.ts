import { Component } from '@angular/core';

@Component({
  selector: 'app-app-layout',
  template: `
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <app-sidebar></app-sidebar>
        <div class="layout-page">
          <app-header></app-header>
          <div class="content-wrapper">
            <div class="container-xl flex-grow-1">
              <router-outlet></router-outlet>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
})
export class AppLayoutComponent { }