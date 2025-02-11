import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private toastrSvc: ToastrService
  ) { }

  /*
  * @param {string} message
  * @param {string} title
  * @param {string} type (1: success, 2: warning, 3: info, 4: error)
  * */
  showAlert(type: number, title: string, message: string) {
    switch (type) {
      case 1: this.toastrSvc.success(message, title); break;
      case 2: this.toastrSvc.warning(message, title); break;
      case 3: this.toastrSvc.info(message, title); break;
      default:
        this.toastrSvc.error(message, title);
        break;
    }
  }

  show(message: string, title?: string) {
    this.toastrSvc.show(message, title);
  }

  info(message: string, title?: string) {
    this.toastrSvc.info(message, title);
  }

  success(message: string, title?: string) {
    this.toastrSvc.success(message, title);
  }

  warning(message: string, title?: string) {
    this.toastrSvc.warning(message, title);
  }

  error(message: string, title?: string) {
    this.toastrSvc.error(message, title);
  }

}
