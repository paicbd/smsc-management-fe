import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

import { AlertService, DataTableConfigService, ResponseI } from '@app/core';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { SipGatewaysService } from '@app/core/services/sip-gateways.service';
import { SipGateways } from '@app/core/interfaces/SipGateways';

declare var window: any;
@Component({
  selector: 'app-sip-gateways',
  templateUrl: './sip-gateways.component.html',
  styleUrl: './sip-gateways.component.scss'
})
export class SipGatewaysComponent implements OnInit, OnDestroy {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  ctx: ApiContext = ApiContext.IP_SM_GW;

  response!: ResponseI;
  sipList: SipGateways[] = [];
  messageShow = '';
  private formModalAction: any;
  private itemOption = 0;
  private current!: SipGateways;

  constructor(
    private sipSettingsService: SipGatewaysService,
    private dtConfigService: DataTableConfigService,
    private alertSvc: AlertService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadDtOptions();
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || ApiContext.IP_SM_GW;
    this.loadSipGateways();
    this.formModalAction = new window.bootstrap.Modal(
      document.getElementById('modalSipGatewaysAction')
    );
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  async loadSipGateways(): Promise<void> {
    this.response = await this.sipSettingsService.getSipGateways(this.ctx);

    if (this.response.status === 200) {
      // tu API devuelve data: [] directo
      this.sipList = (this.response.data ?? []) as SipGateways[];
      this.sipList.sort((a, b) => b.network_id - a.network_id);
    } else {
      this.alertSvc.showAlert(2, this.response.message, this.response.comment);
    }

    this.dtTrigger.next(this.dtOptions);
  }

  refresh(): void {
    this.renderer();
  }

  async refreshOne(networkId: number): Promise<void> {
    const resp = await this.sipSettingsService.refreshSipGateways(networkId);
    if (resp.status === 200) {
      this.alertSvc.showAlert(1, 'Success', resp.comment || 'Refreshed');
      this.renderer();
    } else {
      this.alertSvc.showAlert(2, resp.message || 'Error', resp.comment || 'Could not refresh');
    }
  }

  deleteSip(item: SipGateways): void {
    this.current = item;
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the SIP settings?';
    this.formModalAction.show();
  }

  runSip(item: SipGateways): void {
    this.current = item;
    this.itemOption = 1;
    this.messageShow = 'Are you sure you want to start the SIP settings?';
    this.formModalAction.show();
  }

  stopSip(item: SipGateways): void {
    this.current = item;
    this.itemOption = 2;
    this.messageShow = 'Are you sure you want to stop the SIP settings?';
    this.formModalAction.show();
  }

  async onCloseModal(confirm: boolean): Promise<void> {
    this.formModalAction.hide();
    if (!confirm) return;

    await this.changeStatus();
    this.renderer();
  }

  private async changeStatus(): Promise<void> {
    try {

      const payload: any = { ...this.current };

      let message = '';
      switch (this.itemOption) {
        case 1:
          payload.enabled = 1;
          message = 'Initialized SIP Settings';
          break;
        case 2:
          payload.enabled = 0;
          message = 'Stopped SIP Settings';
          break;
        default:
          payload.enabled = 2;
          message = 'Deleted SIP Settings';
          break;
      }

      const resp = await this.sipSettingsService.updateSipGateways(payload.network_id, payload);

      if (resp.status === 200) {
        this.alertSvc.showAlert(1, message, resp.comment);
      } else {
        this.alertSvc.showAlert(2, resp.message || 'Warning', resp.comment || 'Error');
      }
    } catch {
      this.alertSvc.showAlert(3, 'Server error', 'Error');
    }
  }




  renderer(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadSipGateways();
    });
  }

  loadDtOptions(): void {
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
