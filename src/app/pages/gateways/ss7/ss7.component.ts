import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertService, GatewaySs7, GatewaySs7Service, DataTableConfigService, ResponseI } from '@app/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;
@Component({
  selector: 'app-ss7',
  templateUrl: './ss7.component.html'
})
export class Ss7Component implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  ss7List: GatewaySs7[] = [];
  ss7!: GatewaySs7;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  itemOption!: number;

  constructor(
    private gatewaySs7Service: GatewaySs7Service,
    private dtConfigService: DataTableConfigService,
    private alertSvc: AlertService
  ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.loadSs7();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalGatewaySs7'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteGatewaySs7'),)
  }

  async loadSs7() {
    this.response = await this.gatewaySs7Service.getGatewaySs7();
    if (this.response.status == 200) {
      this.ss7List = this.response.data;
      this.ss7List.sort((a, b) => b.network_id - a.network_id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    this.module = {
      isEdit: false,
      gatewaySs7: null
    }
    this.formModal.show();
  }

  editData(gatewaySs7: any) {
    this.module = {
      isEdit: true,
      gatewaySs7: gatewaySs7
    }
    this.formModal.show();
  }

  onCloseModal(band: boolean) {
    if (band) {
      this.formModal.hide();
    }
    this.renderer();
  }

  async onCloseModalDelete(band: boolean) {
    this.formModalDelete.hide();
    if (band) {
      await this.changeStatus();
    }
    this.renderer();
  }

  async deleteGateway(gatewaySs7: any) {
    this.ss7 = gatewaySs7;
    this.formModalDelete.show();
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the gateway SS7?';
  }

  async runGateway(serviceProviders: any) {
    this.ss7 = serviceProviders;
    this.formModalDelete.show();
    this.itemOption = 1;
    this.messageShow = 'Are you sure you want to start the gateway SS7?';
  }

  async stopGateway(gateway: any) {
    this.ss7 = gateway;
    this.formModalDelete.show();
    this.itemOption = 2;
    this.messageShow = 'Are you sure you want to stop the gateway SS7?';
  }

  async changeStatus() {
    try {
      let menssage = '';
      let refreshSetting=false;
      switch (this.itemOption) {
        case 1:
          menssage = 'Initialized Gateway';
          this.ss7.enabled = 1;
          refreshSetting = true;
          break;
        case 2:
          menssage = 'Detained Gateway';
          this.ss7.enabled = 0;
          break;
        default:
          menssage = 'Delete Gateway';
          this.ss7.enabled = 2;
          refreshSetting=false;
          break;
      }
      let resp =  refreshSetting ? await this.gatewaySs7Service.refreshSettingSs7(this.ss7.network_id): await this.gatewaySs7Service.updateGatewaySs7(this.ss7);
      if (resp.status == 200) {
        this.alertSvc.showAlert(1, menssage, resp.comment);
      } else {
        this.alertSvc.showAlert(2, 'Could not change gateway status', 'Warning');
      }
    } catch (error) {
      this.alertSvc.showAlert(3, 'Server error', 'Error');
    }
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadSs7();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refresh() {
    this.renderer();
  }

  loadDtOptions() {
    this.dtOptions = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
            this.onPageLengthChange(len);
          });
        });
      }
    };
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }
}
