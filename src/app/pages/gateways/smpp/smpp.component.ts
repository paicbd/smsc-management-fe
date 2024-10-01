import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription, count } from 'rxjs';
import { GatewaySmpp, ResponseI } from '@core/index';
import { GatewaySmppService, HandleStatusService, AlertService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-smpp',
  templateUrl: './smpp.component.html',
})
export class SmppComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  gateways: GatewaySmpp[] = [];
  itemGateways!: GatewaySmpp;
  itemOption!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public run: boolean = false;
  private subscription!: Subscription;
  private countSessions: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private handleStatusService: HandleStatusService,
    private gatewaySmppService: GatewaySmppService,
    private dtConfigService: DataTableConfigService,
    private alertsvr: AlertService
  ) {
    this.subscription = this.handleStatusService.startEventStream()
      .subscribe((data: string | any) => {
        const handlerStatus = data !== '' ? data.split(',') : null;
        if (handlerStatus && handlerStatus[0] === 'gw') {
          const [_, systemId, action, value] = handlerStatus;
          this.gateways.forEach((gateway: GatewaySmpp) => {
            if (gateway.system_id === systemId) {
              if (action === 'status') {
                gateway.status = (gateway.status === 'STARTED' && value === 'BINDING') ? gateway.status : value;
                if (gateway.status === 'STOPPED') {
                  this.countSessions = 0;
                  gateway.active_sessions_numbers = 0;
                  gateway.enabled = 0;
                }
              } else if (action === 'sessions') {
                
                if ( gateway.protocol === 'HTTP') {
                  gateway.active_sessions_numbers = 1;
                } else {
                  let newValue = parseInt(value);
                  if (newValue !== undefined && newValue >= 0) {
                    this.countSessions = this.countSessions < gateway.sessions_number ? this.countSessions + newValue : this.countSessions;
                  } else {
                    if (gateway.status === 'STOPPED') {
                      this.countSessions = 0;
                    } else {
                      this.countSessions = Math.max(0, this.countSessions - 1);
                    }
                  }
                  gateway.active_sessions_numbers = (value !== undefined) ? this.countSessions : gateway.active_sessions_numbers;
                }
                
              }
            }
          });
          this.cdr.detectChanges();
        }
      });
  }

  ngOnInit() {
    this.loadDtOptions();
    this.loadGateways();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalGateways'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteGateways'),)
  }

  async loadGateways() {
    this.response = await this.gatewaySmppService.getGateways();
    if (this.response.status == 200) {
      this.gateways = this.response.data;
      this.gateways.sort((a, b) => b.network_id - a.network_id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  editData(providerEdit: any, disableControls?:boolean) {
    this.module = {
      title: 'Edit Item',
      isEdit: true,
      providerEdit: providerEdit,
      disableControls: disableControls
    }
    this.showModal(true);
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

  async changeStatus() {
    try {
      let menssage = '';
      switch (this.itemOption) {
        case 1:
          menssage = 'Initialized Gateway';
          this.itemGateways.enabled = 1;
          break;
        case 2:
          menssage = 'Detained Gateway';
          this.itemGateways.enabled = 0;
          break;
        default:
          menssage = 'Delete Gateway';
          this.itemGateways.enabled = 2;
          break;
      }
      let resp = await this.gatewaySmppService.updateGateway(this.itemGateways);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not change gateway status', 'Warning');
      }
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }

    this.itemOption = 0;
    this.itemGateways;
    this.messageShow = '';
  }

  async runGateway(serviceProviders: any) {
    this.itemGateways = serviceProviders;
    this.formModalDelete.show();
    this.itemOption = 1;
    this.messageShow = 'Are you sure you want to start the gateway?';
  }

  async stopGateway(gateway: any) {
    this.itemGateways = gateway;
    this.formModalDelete.show();
    this.itemOption = 2;
    this.messageShow = 'Are you sure you want to stop the gateway?';
  }

  async deleteGateway(gateway: any) {
    this.itemGateways = gateway;
    this.formModalDelete.show();
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the gateway?';
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadGateways();
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
