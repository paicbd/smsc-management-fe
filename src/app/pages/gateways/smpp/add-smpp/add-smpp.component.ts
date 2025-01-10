import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { 
  CatalogService, 
  AlertService, 
  GatewaySmppService, 
  MnosService,
  SettingServices,
  Catalog, 
  ResponseI, 
  Mno, 
  SmscSetting,
  convertToSmscSetting
} from '@core/index';

@Component({
  selector: 'app-add-smpp',
  templateUrl: './add-smpp.component.html'
})
export class AddSmppComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.load();
      this.loadDataForm(value.providerEdit, value.disableControls);
    }
  }

  title = '';
  form!: FormGroup;
  reponse!: ResponseI;
  catalogStatus: Catalog[] = [];
  catalogInterfaces: Catalog[] = [];
  mnoList: Mno[] = [];
  tonCatalog: Catalog[] = [];
  npiCatalog: Catalog[] = [];
  bindTypes: Catalog[] = [];
  encodingList: Catalog[] = [];
  smscSetting!: SmscSetting;
  saveDisabled = false;
  password: string = '';
  isPasswordVisible: boolean = false;
  passwordFieldType: string = 'password';



  isEdit = false;
  defaultValues = environment.GatewaySmppDefaults;
  network_id: number = 0;

  showOptHttp: boolean = false;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    private gatewaySmppService: GatewaySmppService,
    private mnoService: MnosService,
    private alertSvr: AlertService,
    private settingServices: SettingServices,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loadDataForm(null, false);
    this.getCatalogInterfaces();
    this.getCatalogEncodings();
    this.getMnos();
    this.getTonCatalog();
    this.getNpiCatalog();
    this.getBindTypes();

    this.initializeForm();
    this.getSmscSetting();
  }

  initializeForm(): void {
    let request_dlr: number = 2; //Transparent as default value
    let split_message: boolean = this.defaultValues.split_message === 'true' ? true : false;

    let maxLengthSystemId = environment.generalSettings.general.max_system_id_length || 15;
    let maxLengthPassword = environment.generalSettings.general.max_password_length || 9;

    this.form = this.fb.group({
      network_id: [{value: 0, disabled: true }, [Validators.required]],
      name: ['', [Validators.required]],
      system_id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthSystemId), Validators.pattern(environment.PatternSystemId)]],
      password: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthPassword)]],
      ip: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(environment.MaxLengthIp)]],
      port: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5), Validators.pattern('^[0-9]*$')]],
      bind_type: [this.defaultValues.bind_type, [Validators.required]],
      system_type: ['', [Validators.minLength(0), Validators.maxLength(13), Validators.pattern('^[A-Za-z0-9 ]*$')]],
      interface_version: [this.defaultValues.interface_version, [Validators.required]],
      sessions_number: [this.defaultValues.sessions_number, [Validators.required, Validators.min(1), Validators.max(50), Validators.pattern('^[0-9]*$')]],
      address_ton: [this.defaultValues.address_ton, [Validators.required, Validators.pattern('^[0-9]*')]],
      address_npi: [this.defaultValues.address_npi, [Validators.required, Validators.pattern('^[0-9]*')]],
      address_range: [''],
      tps: [this.defaultValues.tps, [Validators.required, Validators.minLength(1), Validators.pattern('^[0-9]*$')]],
      status: [this.defaultValues.status, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      enquire_link_period: [this.defaultValues.enquire_link_period, [Validators.required, Validators.pattern('^[0-9]*$')]],
      request_dlr: [request_dlr, [Validators.required]],
      auto_retry_error_code: [''],
      no_retry_error_code: [''],
      retry_alternate_destination_error_code: [''],
      bind_timeout: [this.defaultValues.bind_timeout, [Validators.required, Validators.pattern('^[0-9]*$')]],
      bind_retry_period: [this.defaultValues.bind_retry_period, [Validators.required, Validators.pattern('^[0-9]*$')]],
      pdu_timeout: [this.defaultValues.pdu_timeout, [Validators.required, Validators.pattern('^[0-9]*$')]],
      pdu_degree: [this.defaultValues.pdu_degree, [Validators.required, Validators.pattern('^[0-9]*$')]],
      thread_pool_size: [this.defaultValues.thread_pool_size, [Validators.required, Validators.min(100), Validators.pattern('^[0-9]*$')]],
      mno_id: [0, [Validators.required]],
      protocol: [this.defaultValues.protocol, [Validators.required]],
      encoding_gsm7: [this.defaultValues.encoding_gsm7, [Validators.required]],
      encoding_iso88591: [this.defaultValues.encoding_iso88591, [Validators.required]],
      encoding_ucs2: [this.defaultValues.encoding_ucs2, [Validators.required]],
      split_message: [split_message, [Validators.required]],
      split_smpp_type: [this.defaultValues.split_smpp_type],
    });

    this.form.get('network_id')?.enable();
    this.form.get('protocol')?.setValue('SMPP');
    this.onChangeProtocol({ target: { value: 'SMPP' } });
  }

  async save() {
    if (this.form.invalid) {
      return
    }
    let obj = this.form.value;

    let resp;
    if (this.isEdit) {
      obj.network_id = this.network_id;
      resp = await this.gatewaySmppService.updateGateway(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.gatewaySmppService.createGateway(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    }

    if (resp.status == 200) {
      this.close();
    }
  }

  async getSmscSetting() {
    this.reponse = await this.settingServices.getSmscSetting();
    if (this.reponse.status == 200) {
      this.smscSetting = convertToSmscSetting(this.reponse.data);
      
      if ( this.smscSetting?.max_system_id_length != undefined ) {
        this.form.get('system_id')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(this.smscSetting.max_system_id_length),Validators.pattern(environment.PatternSystemId)]);
      }

      if ( this.smscSetting?.max_password_length != undefined ) {
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(this.smscSetting.max_password_length)]);
      }
    }
  }

  async getCatalogInterfaces() {
    this.reponse = await this.catalogService.getByCatalogType('interfazversion');
    if (this.reponse.status == 200) {
      this.catalogInterfaces = this.reponse.data;
    }
  }

  async getMnos() {
    this.reponse = await this.mnoService.getMnos();

    if (this.reponse.status == 200) {
      this.mnoList = this.reponse.data;
    }
  }

  async getTonCatalog() {
    this.reponse = await this.catalogService.getByCatalogType('toncatalog');

    if (this.reponse.status == 200) {
      this.tonCatalog = this.reponse.data;
    }
  }

  async getNpiCatalog() {
    this.reponse = await this.catalogService.getByCatalogType('npicatalog');
    if (this.reponse.status == 200) {
      this.npiCatalog = this.reponse.data;
    }
  }

  async getBindTypes() {
    this.reponse = await this.catalogService.getByCatalogType('bindtypes');
    if (this.reponse.status == 200) {
      this.bindTypes = this.reponse.data;
    }
  }

  async getCatalogEncodings() {
    const resp = await this.catalogService.getByCatalogType('encodingType');

    if (resp.status == 200) {
      this.encodingList = resp.data;
    }
  }

  loadDataForm(data: any, disableControls: boolean): void {
    this.saveDisabled = false;
    if (data == null || data == undefined) {
      this.title = 'Create Gateway';
      this.isEdit = false;
      return;
    } else {
      let split_message: boolean = this.defaultValues.split_message === 'true' ? true : false;
      this.title = 'Edit Gateway';
      this.isEdit = true;
      this.network_id = data.network_id;
      this.form.reset({
        network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
        name: (data.name == null || data.name == undefined) ? '' : data.name,
        system_id: (data.system_id == null || data.system_id == undefined) ? '' : data.system_id,
        password: (data.password == null || data.password == undefined) ? '' : data.password,
        ip: (data.ip == null || data.ip == undefined) ? '' : data.ip,
        port: (data.port == null || data.port == undefined) ? '' : parseInt(data.port),
        bind_type: (data.bind_type == null || data.bind_type == undefined) ? '' : data.bind_type,
        system_type: (data.system_type == null || data.system_type == undefined) ? '' : data.system_type,
        interface_version: (data.interface_version == null || data.interface_version == undefined) ? '' : data.interface_version,
        sessions_number: (data.sessions_number == null || data.sessions_number == undefined) ? '' : parseInt(data.sessions_number),
        address_ton: (data.address_ton == null || data.address_ton == undefined) ? '' : parseInt(data.address_ton),
        address_npi: (data.address_npi == null || data.address_npi == undefined) ? '' : parseInt(data.address_npi),
        address_range: (data.address_range == null || data.address_range == undefined) ? '' : data.address_range,
        tps: (data.tps == null || data.tps == undefined) ? '' : parseInt(data.tps),
        status: (data.status == null || data.status == undefined) ? '' : data.status,
        enabled: (data.enabled == null || data.enabled == undefined) ? '' : parseInt(data.enabled),
        enquire_link_period: (data.enquire_link_period == null || data.enquire_link_period == undefined) ? '' : parseInt(data.enquire_link_period),
        request_dlr: (data.request_dlr == null || data.request_dlr == undefined) ? '' : data.request_dlr,
        auto_retry_error_code: (data.auto_retry_error_code == null || data.auto_retry_error_code == undefined) ? '' : data.auto_retry_error_code,
        no_retry_error_code: (data.no_retry_error_code == null || data.no_retry_error_code == undefined) ? '' : data.no_retry_error_code,
        retry_alternate_destination_error_code: (data.retry_alternate_destination_error_code == null || data.retry_alternate_destination_error_code == undefined) ? '' : data.retry_alternate_destination_error_code,
        bind_timeout: (data.bind_timeout == null || data.bind_timeout == undefined) ? '' : parseInt(data.bind_timeout),
        bind_retry_period: (data.bind_retry_period == null || data.bind_retry_period == undefined) ? '' : parseInt(data.bind_retry_period),
        pdu_timeout: (data.pdu_timeout == null || data.pdu_timeout == undefined) ? '' : parseInt(data.pdu_timeout),
        pdu_degree: (data.pdu_degree == null || data.pdu_degree == undefined) ? '' : parseInt(data.pdu_degree),
        thread_pool_size: (data.thread_pool_size == null || data.thread_pool_size == undefined) ? '' : parseInt(data.thread_pool_size),
        mno_id: (data.mno_id == null || data.mno_id == undefined) ? '' : parseInt(data.mno_id),
        protocol: (data.protocol == null || data.protocol == undefined) ? '' : data.protocol,
        encoding_iso88591: (data.encoding_iso88591 == null || data.encoding_iso88591 == undefined) ? this.defaultValues.encoding_iso88591 : parseInt(data.encoding_iso88591),
        encoding_gsm7: (data.encoding_gsm7 == null || data.encoding_gsm7 == undefined) ? this.defaultValues.encoding_gsm7 : parseInt(data.encoding_gsm7),
        encoding_ucs2: (data.encoding_ucs2 == null || data.encoding_ucs2 == undefined) ? this.defaultValues.encoding_ucs2 : parseInt(data.encoding_ucs2),
        split_message: (data.split_message == null || data.split_message == undefined) ? split_message : data.split_message,
        split_smpp_type: (data.split_smpp_type == null || data.split_smpp_type == undefined) ? this.defaultValues.split_smpp_type : data.split_smpp_type,
      });

      this.form.get('network_id')?.disable();

      if (data.protocol == 'HTTP') {
        this.form.get('ip')?.clearValidators();
        this.form.get('ip')?.updateValueAndValidity();
        this.form.get('port')?.clearValidators();
        this.form.get('port')?.updateValueAndValidity();
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.showOptHttp = true;
      } else {
        this.form.get('ip')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(environment.MaxLengthIp)]);
        this.form.get('ip')?.updateValueAndValidity();
        this.form.get('port')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(5), Validators.pattern('^[0-9]*$')]);
        this.form.get('port')?.updateValueAndValidity();
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(9)]);
        this.form.get('password')?.updateValueAndValidity();
        this.showOptHttp = false;
      }
    }

    if (disableControls) {
      this.form.get('name')?.disable();
      this.form.get('system_id')?.disable();
      this.form.get('mno_id')?.disable();
      this.form.get('protocol')?.disable();
      this.form.get('password')?.disable();
      this.form.get('ip')?.disable();
      this.form.get('port')?.disable();
      this.form.get('bind_type')?.disable();
      this.form.get('system_type')?.disable();
      this.form.get('interface_version')?.disable();
      this.form.get('sessions_number')?.disable();
      this.form.get('address_ton')?.disable();
      this.form.get('address_npi')?.disable();
      this.form.get('address_range')?.disable();
      this.form.get('tps')?.disable();
      this.form.get('enquire_link_period')?.disable();
      this.form.get('request_dlr')?.disable();
      this.form.get('no_retry_error_code')?.disable();
      this.form.get('auto_retry_error_code')?.disable();
      this.form.get('retry_alternate_destination_error_code')?.disable();
      this.form.get('bind_timeout')?.disable();
      this.form.get('bind_retry_period')?.disable();
      this.form.get('pdu_timeout')?.disable();
      this.form.get('pdu_degree')?.disable();
      this.form.get('thread_pool_size')?.disable();
      this.form.get('encoding_gsm7')?.disable();
      this.form.get('encoding_iso88591')?.disable();
      this.form.get('encoding_ucs2')?.disable();
      this.form.get('split_message')?.disable();
      this.form.get('split_smpp_type')?.disable();
      this.saveDisabled = true;
    }
  }
  
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.passwordFieldType = this.isPasswordVisible ? 'text' : 'password';
  }

  onChangeProtocol(event: any) {
    if (event.target.value == 'HTTP') {
      this.form.get('ip')?.clearValidators();
      this.form.get('ip')?.updateValueAndValidity();
      this.form.get('port')?.clearValidators();
      this.form.get('port')?.updateValueAndValidity();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.showOptHttp = true;

      this.form.get('encoding_iso88591')?.setValue(1);
      this.form.get('encoding_gsm7')?.setValue(1);
      this.form.get('encoding_ucs2')?.setValue(1);
    } else {
      this.form.get('ip')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(environment.MaxLengthIp)]);
      this.form.get('ip')?.updateValueAndValidity();
      this.form.get('port')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(5), Validators.pattern('^[0-9]*$')]);
      this.form.get('port')?.updateValueAndValidity();
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(9)]);
      this.form.get('password')?.updateValueAndValidity();
      this.showOptHttp = false;
      
      this.form.get('encoding_iso88591')?.setValue(this.defaultValues.encoding_iso88591);
      this.form.get('encoding_gsm7')?.setValue(this.defaultValues.encoding_gsm7);
      this.form.get('encoding_ucs2')?.setValue(this.defaultValues.encoding_ucs2);
    }
  }

  changeBindTypes(event: any) {
    let value = event.target.value;
  }

  close(): void {
    this.load();
    this.closeModal.emit(true);
  }


  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validMinLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['minlength'];
  }

  validMaxLength(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['maxlength'];
  }

  validMin(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['min'];
  }

  validMax(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['max'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getMinLength(name: string) {
    return this.form.get(name)?.errors?.['minlength']?.requiredLength;
  }

  getMaxLength(name: string) {
    return this.form.get(name)?.errors?.['maxlength']?.requiredLength;
  }

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }

  getMax(name: string) {
    return this.form.get(name)?.errors?.['max']?.max;
  }

  getPatternMessage(name: string) {
    if (name === 'system_id') {
      return `The characters: ${environment.PatternSystemLabel} are not valid.`;
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
      return 'No spaces allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  getValueForm(name: string) {
    return this.form.get(name)?.value;
  }

  clearForm() {
    this.form.reset({
      network_id: '',
      name: '',
      system_id: '',
      password: '',
      ip: '',
      port: '',
      bind_type: '',
      system_type: '',
      interface_version: '',
      sessions_number: '',
      address_ton: '',
      address_npi: '',
      address_range: '',
      tps: '',
      status: '',
      enabled: '',
      enquire_link_period: '',
      request_dlr: '',
      auto_retry_error_code: '',
      no_retry_error_code: '',
      retry_alternate_destination_error_code: '',
      bind_timeout: '',
      bind_retry_period: '',
      pdu_timeout: '',
      pdu_degree: '',
      thread_pool_size: '',
      mno_id: '',
      protocol: '',
      encoding_iso88591: '',
      encoding_gsm7: '',
      encoding_ucs2: '',
      split_message: '',
      split_smpp_type: ''
    });
  }
}
