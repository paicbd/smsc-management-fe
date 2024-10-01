import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertService, SccpRemoteResource, SccpService, DataTableConfigService } from '@app/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-resources-sccp',
  templateUrl: './resources-sccp.component.html',
})
export class ResourcesSccpComponent implements OnInit {
  sccpId: number = 0;
  @Input() set dataSccpId(value: number) {
    this.sccpId = value;
  }
  @ViewChild(DataTableDirective, { static: false })
  dtElementRemoteResource!: DataTableDirective;
  dtOptionsRemoteResource: DataTables.Settings = {};
  dtTriggerRemoteResource: Subject<any> = new Subject<any>();
  dataTableRemoteResource: any;
  listRemoteResource: SccpRemoteResource[] = [];
  modalAdd!: any;
  modalDelete!: any;
  messageShow: string = '';
  remoteResource?: SccpRemoteResource = undefined;

  constructor(
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modalAdd = new window.bootstrap.Modal(document.getElementById('modalAddResource'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteResource'),)
    this.loadRemoteResource();
  }

  async loadRemoteResource() {
    let response = await this.sccpService.getRemoteResource(this.sccpId);
    if (response.status == 200) {
      this.listRemoteResource = response.data;
      this.dtTriggerRemoteResource.next(this.dtOptionsRemoteResource);
    } else {
      this.alertSvr.error('Error loading remote resources');
    }
  }

  async showModal() {
    this.modalAdd.show();
  }

  async editItem(item: SccpRemoteResource) {
    this.remoteResource = item;
    this.showModal();
  }

  onCloseModal(band: boolean) {
    this.remoteResource = {
      id: 0,
    }
    this.modalAdd.hide();
    if (band)
      this.renderer();
  }

  showConfirmationDelete(item: SccpRemoteResource) {
    this.remoteResource = item;
    this.messageShow = 'Are you sure you want to delete this remote resource?';
    this.modalDelete.show();
  }

  async onCloseModalDelete(band: boolean) {
    if (band && this.remoteResource?.id != null) {
        await this.deleteResource(this.remoteResource.id);
        this.renderer();
    }
    this.remoteResource = undefined;
    this.modalDelete.hide();
  }

  async deleteResource(id: number) {
    try {
      let resp = await this.sccpService.deleteRemoteResource(id);
      if (resp.status == 200) {
        this.alertSvr.success('Remote resource deleted successfully');
      } else {
        this.alertSvr.warning('Record could not be deleted', 'Warning');
      }
    } catch (error) {
      this.alertSvr.error('Server error', 'Error');
    }
  }

  renderer() {
    this.dtElementRemoteResource.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.destroy();
      this.loadRemoteResource();
    });
  }

  loadDtOptions() {
    this.dtOptionsRemoteResource = {
      ...this.dtConfigService.getConfig(),
      initComplete: () => {
        this.dtElementRemoteResource.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.on('length.dt', (e: Event, settings: any, len: number) => {
            this.onPageLengthChange(len);
          });
        });
      }
    };
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptionsRemoteResource.pageLength = newPageLength;
  }
}
