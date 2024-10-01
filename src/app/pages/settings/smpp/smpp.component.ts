import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService, Catalog, SMPPServerConfig, SettingServices } from '@app/core';

declare var window: any;

@Component({
  selector: 'app-smpp',
  templateUrl: './smpp.component.html',
})
export class SmppComponent implements OnInit {

  public smppServerConfig!: SMPPServerConfig;
  public state!: string;
  public messageShow!: string;
  public formModalSmppServer: any;
  
  constructor(
    private settingServices: SettingServices,
    private alertsvr: AlertService,
  ) { 
    this.smppServerConfig = {
      state: 'STOPPED'
    }
  }

  ngOnInit(): void {
    this.formModalSmppServer = new window.bootstrap.Modal(document.getElementById('modalSmppServer'),);
    this.getSmppServerConfig();
  }

  async getSmppServerConfig() {
    const response = await this.settingServices.getSmppServerConfig();

    if (response.status === 200) {
      this.smppServerConfig = response.data;
    } else {
      this.smppServerConfig = {
        state: 'STOPPED'
      }
    }
  }

  openModal(state: string) {
    this.state = state;
    this.formModalSmppServer.show();
    this.messageShow = state !== 'STARTED' ? 'Do you want to stop the smpp server?' : 'Do you want to start the smpp server?';
  }

  async changeStatus(band: boolean) {
    this.formModalSmppServer.hide();
    if (!band) return;

    try {
      await this.settingServices.updateStatus(this.state);
      this.getSmppServerConfig();

      this.alertsvr.showAlert(1, 'Success', this.state !== 'STARTED' ? 'The smpp server has been stopped' : 'The smpp server has been started');
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }
  }

}