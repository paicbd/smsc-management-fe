import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ResponseI, Broadcast } from '@core/index';
import { BroadCastService, AlertService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-broadcast',
  templateUrl: './broadcast.component.html',
})
export class BroadCastComponent implements OnInit {
  
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  dataTable: any;
  response!: ResponseI;
  data: Broadcast[] = [];
  itemBroadcast!: Broadcast;
  idBroadcast!: number;
  messageShow!: string;
  public module: any;
  public formModal: any;
  public formModalStart: any;
  public run: boolean = false;
  public downloading: { [key: number]: boolean } = {};
  private statusSubscription: Subscription | null = null;
  private fileDownloadSubscription!: Subscription;
  fileContent: string = '';
  currentFileName: string = ''; 

  constructor(
    private broadCastService: BroadCastService,
    private alertsvr: AlertService,
    private dtConfigService: DataTableConfigService,
  ) {}

  ngOnInit() {
    this.loadDtOptions();
    this.loadBroadcasts();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalBroadcast'),)
    this.formModalStart = new window.bootstrap.Modal(document.getElementById('modalStartBroadcast'),)
  }

  async loadBroadcasts() {
    this.response = await this.broadCastService.getBroadCast();
    if (this.response.status == 200) {
      this.data = this.response.data;
      this.data.sort((a, b) => b.broadcast_id - a.broadcast_id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  editData(mnoEdit: any) {
    this.module = {
      title: 'Edit Item',
      isEdit: true,
      mnoEdit: mnoEdit
    }
    this.showModal(true);
  }

  onStartBroadcast(broadcast: Broadcast) {
    this.formModalStart.show();
    this.idBroadcast = broadcast.broadcast_id;
    this.messageShow = 'Are you sure you want to start this broadcast?';
  }

  async onCloseModalStartBroadcast(band: boolean) {
    this.formModalStart.hide();
    if (band) {
      this.broadCastService.startBroadCast(this.idBroadcast).then((response) => {
      if (response.status == 200) {
        this.alertsvr.success(response.message, 'Success');
        this.renderer();
      } else {
        this.alertsvr.error(response.message, 'Error');
      }
    });
    }
    this.renderer();
  }

  async refreshStatistic() {
    this.broadCastService.refreshStatistic().then((response) => {
      if (response.status == 200) {
        this.alertsvr.success(response.comment, 'Success');
        this.renderer();
      } else {
        this.alertsvr.error(response.comment, 'Error');
      }
    });
  }

  async downloadFile(broadcast: Broadcast) {
    this.downloading[broadcast.broadcast_id] = true;

    try {
      const fileResponse = await this.broadCastService.requestFileDownload(broadcast.broadcast_id);
      if (fileResponse.status !== 200) {
        this.alertsvr.error('Error initiating file download: ' + fileResponse.message);
        this.downloading[broadcast.broadcast_id] = false;
        return;
      }

      let { data } = fileResponse;

      if ( data.status == 'FAILED' ) {
        this.alertsvr.error('Error initiating file download: ' + data.message);
        this.downloading[broadcast.broadcast_id] = false;
        return;
      }

      const fileId = data.id;
      this.currentFileName = data.filename;
      
      this.monitorFileStatus(fileId, broadcast.broadcast_id, data.token);
    } catch (error) {
      this.alertsvr.error('Error initiating file download: ' + error);
      this.downloading[broadcast.broadcast_id] = false;
    }
  }

  monitorFileStatus(fileId: number, broadcastId: number, token: string) {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }

    this.statusSubscription = interval(5000).subscribe(async () => {
      try {
        const statusResponse = await this.broadCastService.checkFileStatus(fileId);

        if (statusResponse.status === 200) {
          if (statusResponse.data.status === 'CREATED') {
            await this.broadCastService.downloadReportStream(token)
            this.alertsvr.success('File download starting successfully');
            this.downloading[broadcastId] = false;
            this.statusSubscription?.unsubscribe();
          } else if (statusResponse.data.status === 'FAILED') {
            this.alertsvr.error('File creation failed');
            this.downloading[broadcastId] = false;
            this.statusSubscription?.unsubscribe();
          }
        } else {
          this.alertsvr.error('Error checking file status: ' + statusResponse.message);
          this.downloading[broadcastId] = false;
          this.statusSubscription?.unsubscribe();
        }
      } catch (error) {
        this.alertsvr.error('Error monitoring file status: ' + error);
        this.downloading[broadcastId] = false;
        this.statusSubscription?.unsubscribe();
      }
    });
  }

  onCloseModal(band: boolean) {
    if (band) {
      this.formModal.hide();
    }
    this.renderer();
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadBroadcasts();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.statusSubscription?.unsubscribe();

    if (this.fileDownloadSubscription) {
      this.fileDownloadSubscription.unsubscribe();
    }
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
    this.dtTrigger.next({ ...this.dtOptions });
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }
}
