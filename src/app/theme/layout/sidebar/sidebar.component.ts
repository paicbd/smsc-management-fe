import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService, RouteInfo } from '@app/core';
import { ROUTES } from './sidebar-items';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  public sidebarItems!: RouteInfo[];
  hidden = false;
  document: any = document;
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { 
   this.currentRoute = this.router.url;
  }

  ngOnInit(): void {
    this.sidebarItems = ROUTES.filter((sidebarItem) => sidebarItem);
    let currentRouteItem = this.sidebarItems.find(item => this.currentRoute.startsWith(item.path));
    if (currentRouteItem?.submenu !== undefined) {
      currentRouteItem.show = true;
    }
  }

  changeItemClass(title: String) {
    this.sidebarItems.map((item: any) => {
      if (item.title === title) {
        item.selected = true;
      }
      else {
        item.selected = false;
      }
    })
  }

  onSubmit() {
    if (this.hidden) {
      this.document.getElementById('layout-menu').classList.remove('layout-menu-active');
      this.document.getElementById('layout-menu').classList.add('layout-menu-hidden');
    }
  }

  toggleDropdown(index: number): void {
    this.sidebarItems[index].show = !this.sidebarItems[index].show;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth < 1250) {
      this.hidden = true;
    } else {
      this.hidden = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
