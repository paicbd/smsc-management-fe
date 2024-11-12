import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { CreditBalance, ResponseI, cleanObject } from '@core/index';
import { ServiceProvidersService, ServiceProvider, AlertService, HandleStatusService, DataTableConfigService } from '@core/index';

declare var window: any;

@Component({
  selector: 'app-service-providers',
  templateUrl: './service-providers.component.html',
})
export class ServiceProvidersComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  creditBalance!: CreditBalance;

  dataTable: any;
  response!: ResponseI;
  providers: ServiceProvider[] = [];
  itemProvider!: ServiceProvider;
  itemOption!: number;
  messageShow!: string;
  env = environment;
  public module: any;
  public formModal: any;
  public formModalDelete: any;
  public formModalBalance: any;
  public run: boolean = false;
  public defaultObjet: ServiceProvider = {
    network_id: 0,
    name: '',
    system_id: '',
    password: '',
    system_type: '',
    interface_version: this.env.ServiceProviderDefaults.interface_version,
    sessions_number: this.env.ServiceProviderDefaults.sessions_number,
    address_ton: this.env.ServiceProviderDefaults.address_ton,
    address_npi: this.env.ServiceProviderDefaults.address_npi,
    address_range: this.env.ServiceProviderDefaults.address_range,
    balance_type: this.env.ServiceProviderDefaults.balance_type,
    balance: this.env.ServiceProviderDefaults.balance,
    tps: this.env.ServiceProviderDefaults.tps,
    validity: this.env.ServiceProviderDefaults.validity,
    status: this.env.ServiceProviderDefaults.status,
    enabled: this.env.ServiceProviderDefaults.enabled,
    enquire_link_Leriod: 0,
    pdu_timeout: 0,
    request_dlr: false,
    active_sessions_numbers: 0,
    contact_name: this.env.ServiceProviderDefaults.contact_name,
    email: this.env.ServiceProviderDefaults.email,
    phone_number: this.env.ServiceProviderDefaults.phone_number,
    protocol: this.env.ServiceProviderDefaults.protocol,
    bind_type: this.env.ServiceProviderDefaults.bind_type,
  };

  private subscription!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private handleStatusService: HandleStatusService,
    private serviceProvidersService: ServiceProvidersService,
    private dtConfigService: DataTableConfigService,
    private alertsvr: AlertService,
  ) {
    this.subscription = this.handleStatusService.startEventStream()
      .subscribe((data: string | any) => {
        const handlerStatus = data !== '' ? data.split(',') : null;
        if (handlerStatus && handlerStatus[0] === 'sp') {
          const [_, systemId, action, value] = handlerStatus;
          this.providers.forEach((provider: ServiceProvider) => {
            if (provider.system_id === systemId) {
              if (action === 'status') {
                provider.status = (provider.status === 'STARTED' && value === 'BINDING') ? provider.status : value;
              } else if (action === 'sessions') {
                provider.active_sessions_numbers = (value !== undefined) ? parseInt(value) : provider.active_sessions_numbers;
              }
            }
          });
          this.cdr.detectChanges();
        }
      });
  }

  ngOnInit() {
    this.loadDtOptions();
    this.loadProviders();
    this.formModal = new window.bootstrap.Modal(document.getElementById('modalServiceProvider'),)
    this.formModalDelete = new window.bootstrap.Modal(document.getElementById('modalDeleteServiceProvider'),)
    this.formModalBalance = new window.bootstrap.Modal(document.getElementById('modalBalanceServiceProvider'),)
  }

  async loadProviders() {
    this.response = await this.serviceProvidersService.getProviders();
    if (this.response.status == 200) {
      this.providers = this.response.data;
      this.providers.sort((a, b) => b.network_id - a.network_id);
    }
    this.dtTrigger.next(this.dtOptions);
  }

  showModal(e: boolean) {
    if (!e) { return; }
    this.formModal.show();
  }

  async showCreditBalance(serviceProvider : ServiceProvider) {
    let resp = await this.serviceProvidersService.getCreditBalance(String(serviceProvider.network_id));
    let { status, message, comment } = resp;
    if (status == 200) {
      this.creditBalance = resp.data;
      this.creditBalance.network_id = serviceProvider.network_id;
      this.formModalBalance.show();
    } else {
      this.alertsvr.showAlert(2, 'Warning', comment);
    }

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

  onCloseModalBalance(band: boolean) {
    this.formModalBalance.hide();
    this.renderer();
  }

  async changeStatus() {
    try {
      let menssage = '';
      switch (this.itemOption) {
        case 1:
          menssage = 'Initialized service provider';
          this.itemProvider.enabled = 1;
          break;
        case 2:
          menssage = 'Detained service provider';
          this.itemProvider.enabled = 0;
          break;
        default:
          menssage = 'Delete service provider';
          this.itemProvider.enabled = 2;
          break;
      }
      const cleanedProvider = await cleanObject(this.itemProvider, this.defaultObjet);
      let resp = await this.serviceProvidersService.updateProvider(cleanedProvider);
      if (resp.status == 200) {
        this.alertsvr.showAlert(1, menssage, resp.comment);
      } else {
        this.alertsvr.showAlert(2, 'Could not change service provider status', 'Warning');
      }
    } catch (error) {
      this.alertsvr.showAlert(3, 'Server error', 'Error');
    }

    this.itemOption = 0;
    this.itemProvider;
    this.messageShow = '';
  }

  async runServiceProviders(serviceProviders: any) {
    this.itemProvider = serviceProviders;
    this.formModalDelete.show();
    this.itemOption = 1;
    this.messageShow = 'Are you sure you want to start the service provider?';
  }

  async stopServiceProviders(serviceProviders: any) {
    this.itemProvider = serviceProviders;
    this.formModalDelete.show();
    this.itemOption = 2;
    this.messageShow = 'Are you sure you want to stop the service provider?';
  }

  async deleteServiceProveider(serviceProviders: any) {
    this.itemProvider = serviceProviders;
    this.formModalDelete.show();
    this.itemOption = 3;
    this.messageShow = 'Are you sure you want to delete the service provider?';
  }

  renderer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.loadProviders();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.handleStatusService.stopEventStream();
    if (this.subscription) {
      this.subscription.unsubscribe();
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
  }

  onPageLengthChange(newPageLength: number): void {
    this.dtConfigService.updateConfig({ pageLength: newPageLength });
    this.dtOptions.pageLength = newPageLength;
  }
}
