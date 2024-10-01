import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertService, SccpRule, SccpService, DataTableConfigService } from '@app/core';
import { environment } from '@env/environment';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-sccp-rules',
  templateUrl: './sccp-rules.component.html',
})
export class SccpRulesComponent implements OnInit {

  sccpId: number = 0;
  @Input() set dataSccpId(value: number) {
    this.sccpId = value;
  }

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dataTable: any;

  listRules: SccpRule[] = [];

  modalAdd!: any;
  modalDelete!: any;
  messageShow: string = '';

  rule?: SccpRule;

  constructor(
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modalAdd = new window.bootstrap.Modal(document.getElementById('modalAddRule'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteRule'),)
    this.loadRules();
  }

  async loadRules() {
    let response = await this.sccpService.getRules(this.sccpId);
    if (response.status == 200) {
      this.listRules = response.data;
      this.dtTrigger.next(this.dtOptions);
    } else {
      this.alertSvr.error('Error loading rules');
    }
  }

  showModal() {
    this.rule = undefined;
    this.modalAdd.show();
  }

  openModalEdit(item: SccpRule) {
    this.rule = item;
    this.modalAdd.show();
  }

  onCloseModal(band: boolean) {
    this.rule = {
      id: 0,
    }
    this.modalAdd.hide();
    if (band)
      this.renderer();
  }

  showConfirmationDelete(item: SccpRule) {
    this.rule = item;
    this.messageShow = 'Are you sure you want to delete this Rule?';
    this.modalDelete.show();
  }

  async onCloseModalDelete(band: boolean) {
    if (band && this.rule?.id != null) {
      await this.delete(this.rule.id);
      this.renderer();
    }

    this.rule = undefined;
    this.modalDelete.hide();
  }

  async delete(id: number) {
    try {
      let resp = await this.sccpService.deleteRule(id);
      if (resp.status == 200) {
        this.alertSvr.success('Rule deleted successfully');
      } else {
        this.alertSvr.warning('Record could not be deleted', 'Warning');
      }
    } catch (error) {
      this.alertSvr.error('Server error', 'Error');
    }
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.destroy();
      this.loadRules();
    });
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
