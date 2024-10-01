import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertService, SccpAddress, SccpService, DataTableConfigService } from '@app/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

declare var window: any;

@Component({
  selector: 'app-sccp-address',
  templateUrl: './sccp-address.component.html',
})
export class SccpAddressComponent implements OnInit {

  sccpId: number = 0;
  @Input() set dataSccpId(value: number) {
    this.sccpId = value;
  }

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dataTable: any;

  listAddresses: SccpAddress[] = [];

  modalAddresses!: any;
  modalDelete!: any;
  messageShow: string = '';

  address?: SccpAddress;
  isDeleting: boolean = false;

  constructor(
    private sccpService: SccpService,
    private alertSvr: AlertService,
    private dtConfigService: DataTableConfigService,
  ) { }

  ngOnInit(): void {
    this.loadDtOptions();
    this.modalAddresses = new window.bootstrap.Modal(document.getElementById('modalAddAddresses'),)
    this.modalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteAddresses'),)
    this.loadAddresses();
  }

  async loadAddresses() {
    let response = await this.sccpService.getAddresses(this.sccpId);
    if (response.status == 200) {
      this.listAddresses = response.data;
      this.dtTrigger.next(this.dtOptions);
    } else {
      this.alertSvr.error('Error loading addresses');
    }
  }

  showModal() {
    this.modalAddresses.show();
  }

  openModalEditView(item: SccpAddress) {
    this.address = item;
    this.showModal();
  }

  onCloseModal(band: boolean) {
    this.modalAddresses.hide();
    this.address = undefined;
    this.renderer();
  }

  showConfirmationDelete(item: SccpAddress) {
    this.isDeleting = true;
    this.address = item;
    this.messageShow = 'Are you sure you want to delete this Address?';
    this.modalDelete.show();
  }

  async onCloseModalDelete(band: boolean) {
    this.modalDelete.hide();
    if (band && this.address?.id != null) {
      await this.deleteAddress(this.address.id);
      this.renderer();
    }
    this.address = undefined;
  }

  async deleteAddress(id: number) {
    try {
      let resp = await this.sccpService.deleteAddress(id);
      if (resp.status == 200) {
        this.alertSvr.success('Address deleted successfully');
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
      this.loadAddresses();
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
