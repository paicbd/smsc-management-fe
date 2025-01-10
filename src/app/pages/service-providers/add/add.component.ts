import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  CatalogService, 
  ServiceProvidersService,
  AlertService,
  SettingServices,
  Catalog,
  ResponseI,
  SmscSetting,
  convertToSmscSetting
} from '@app/core';

import { environment } from '@env/environment';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {
  
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.title = 'Edit Service Provider';
      this.load();
      this.loadDataForm(value.providerEdit, value.disableControls);
    }
    else {
      this.title = 'Create Service Provider';
      this.isEdit = false;
      if (this.form != undefined) {
        this.form.reset();
      }
    }
  }
  
  title = '';  
  form!: FormGroup;
  formTarget!: FormGroup;
  reponse!: ResponseI;
  catalogStatus: Catalog[] = [];
  catalogInterfaces: Catalog[] = [];
  catalogBalanceTypes: Catalog[] = [];
  tonCatalog: Catalog[] = [];
  npiCatalog: Catalog[] = [];
  bindTypes: Catalog[] = [];
  smscSetting!: SmscSetting;
  isEdit = false;
  defaultValues = environment.ServiceProviderDefaults;
  network_id: number = 0;
  patternEmail = environment.PatternEmail;
  saveDisabled = false;
  password: string = '';
  spPasswordVisible: boolean = false;
  spPasswordFieldType: string = 'password';
  headerPasswordVisible: boolean = false;
  headerPasswordFieldType: string = 'password';


  public headerList: any[] = [];
  public headerListDelete: any[] = [];
  showOptionsHttp: boolean = false;
  showInputUser: boolean = false;
  showInputPass: boolean = false;
  showInputToken: boolean = false;
  showInputHeader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    private serviceProvidersService: ServiceProvidersService,
    private alertSvr: AlertService,
    private settingServices: SettingServices,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.load();
  }


  load(): void {
    this.headerList = [];
    this.loadDataForm(null, false);
    this.getCatalogInterfaces();
    this.getCatalogBalanceTypes();
    this.getTonCatalog();
    this.getNpiCatalog();
    this.getBindTypes();

    this.initializeForm();
    this.getSmscSetting();
  }

  initializeForm(): void {
    let maxLengthSystemId = environment.generalSettings.general.max_system_id_length || 15;
    let maxLengthPassword = environment.generalSettings.general.max_password_length || 9;

    this.form = this.fb.group({
      network_id: [{value: 0, disabled: true }, [Validators.required]],
      name: ['', [Validators.required]],
      system_id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthSystemId),Validators.pattern(environment.PatternSystemId)]],
      password: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(maxLengthPassword)]],
      system_type: ['', [ Validators.minLength(0), Validators.maxLength(13), Validators.pattern('^[A-Za-z0-9 ]*$')]],
      interface_version: [this.defaultValues.interface_version, [Validators.required]],
      sessions_number: [this.defaultValues.sessions_number, [Validators.required, Validators.min(1), Validators.max(50), Validators.pattern('^[0-9]*$')]],
      address_ton: [this.defaultValues.address_ton, [Validators.required, Validators.pattern('^[0-9]*')]],
      address_npi: [this.defaultValues.address_npi, [Validators.required, Validators.pattern('^[0-9]*')]],
      bind_type: [this.defaultValues.bind_type, [Validators.required]],
      address_range: [''],
      balance_type: [this.defaultValues.balance_type, [Validators.required]],
      balance: [this.defaultValues.balance, [Validators.required, Validators.pattern('^[0-9]*$')]],
      tps: [this.defaultValues.tps, [Validators.required, Validators.minLength(1), Validators.pattern('^[0-9]*$')]],
      validity: [this.defaultValues.validity, [Validators.required, Validators.pattern('^[0-9]*$')]],
      status: [this.defaultValues.status, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      enquire_link_period: [this.defaultValues.enquire_link_period, [Validators.required, Validators.pattern('^[0-9]*$')]],
      pdu_timeout: [this.defaultValues.pdu_timeout, [Validators.required, Validators.pattern('^[0-9]*$')]],
      contact_name: ['', [Validators.pattern('^[A-Za-z0-9 ]*$')]],
      email: ['', [Validators.pattern(this.patternEmail)]],
      phone_number: [ '', [Validators.pattern('^[0-9]*$')]],
      protocol: [this.defaultValues.protocol, [Validators.required]],
      callback_url: [''],
      authentication_types: [''],
      header_security_name: [''],
      token: [''],
      user_name: [''],
      passwd: [''],
      callback_headers_http: this.fb.array([
        this.initializeTarget()
      ])
    });
    this.form.get('network_id')?.enable();
    this.form.get('protocol')?.setValue('SMPP');
    this.changeProtocol({target: {value: 'SMPP'}});
  }

  initializeTarget(): void {
    this.formTarget = this.fb.group({
      header_name: ['', [Validators.required]],
      header_value: ['', [Validators.required]],
    });
  }

  async save() {
    if (this.form.invalid) {
      return
    }
    let obj = this.form.value;

    obj.address_range = obj.address_range == '' ? this.defaultValues.address_range : obj.address_range;
    obj.callback_headers_http = [];

    if (obj.protocol === 'SMPP') {
      obj.authentication_types = "Undefined";
    } else {
      if (this.headerList.length > 0 ){
        for (let index = 0; index < this.headerList.length; index++) {
          obj.callback_headers_http.push(this.headerList[index]);
        }
      }
    }

    let resp;
    if (this.isEdit) {
      obj.network_id = this.network_id;
      resp = await this.serviceProvidersService.updateProvider(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.serviceProvidersService.createProvider(obj);
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

  async getCatalogStatus() {
    this.reponse = await this.catalogService.getByCatalogType('bindstatuses');
    if (this.reponse.status == 200) {
      this.catalogStatus = this.reponse.data;
    }
  }

  async getCatalogInterfaces() {
    this.reponse = await this.catalogService.getByCatalogType('interfazversion');
    if (this.reponse.status == 200) {
      this.catalogInterfaces = this.reponse.data;
    }
  }

  async getCatalogBalanceTypes() {
    this.reponse = await this.catalogService.getByCatalogType('balancetype');

    if (this.reponse.status == 200) {
      this.catalogBalanceTypes = this.reponse.data;
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

  loadDataForm(data: any, disableControls: boolean): void {
    this.saveDisabled = false;
    if (data == null || data == undefined) {
      this.title = 'Create Service Provider';
      this.isEdit = false;
      
      return;
    } else {
      
      this.title = 'Edit Service Provider';
      this.isEdit = true;
      this.network_id = data.network_id;
      this.form.reset({
        network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
        name: (data.name == null || data.name == undefined) ? '' : data.name,
        system_id: (data.system_id == null || data.system_id == undefined) ? '' : data.system_id,
        password: (data.password == null || data.password == undefined) ? '' : data.password,
        system_type: (data.system_type == null || data.system_type == undefined) ? '' : data.system_type,
        interface_version: (data.interface_version == null || data.interface_version == undefined) ? '' : data.interface_version,
        sessions_number: (data.sessions_number == null || data.sessions_number == undefined) ? '' : data.sessions_number,
        address_ton: (data.address_ton == null || data.address_ton == undefined) ? '' : data.address_ton,
        address_npi: (data.address_npi == null || data.address_npi == undefined) ? '' : data.address_npi,
        address_range: (data.address_range == null || data.address_range == undefined) ? '' : data.address_range,
        balance_type: (data.balance_type == null || data.balance_type == undefined) ? '' : data.balance_type,
        bind_type: (data.bind_type == null || data.bind_type == undefined) ? '' : data.bind_type,
        balance: (data.balance == null || data.balance == undefined) ? '' : data.balance,
        tps: (data.tps == null || data.tps == undefined) ? 1 : data.tps,
        validity: (data.validity == null || data.validity == undefined) ? '' : data.validity,
        status: (data.status == null || data.status == undefined) ? '' : data.status,
        enabled: (data.enabled == null || data.enabled == undefined) ? false : data.enabled,
        enquire_link_period: (data.enquire_link_period == null || data.enquire_link_period == undefined) ? '' : data.enquire_link_period,
        pdu_timeout: (data.pdu_timeout == null || data.pdu_timeout == undefined) ? '' : data.pdu_timeout,
        contact_name: (data.contact_name == null || data.contact_name == undefined) ? this.defaultValues.contact_name : data.contact_name,
        email: (data.email == null || data.email == undefined) ? this.defaultValues.email : data.email,
        phone_number: (data.phone_number == null || data.phone_number == undefined) ? this.defaultValues.phone_number : data.phone_number,
        protocol: (data.protocol == null || data.protocol == undefined) ? this.defaultValues.protocol : data.protocol,
        callback_url: (data.callback_url == null || data.callback_url == undefined) ? '' : data.callback_url,
        authentication_types: (data.authentication_types == null || data.authentication_types == undefined) ? '' : data.authentication_types,
        header_security_name: (data.header_security_name == null || data.header_security_name == undefined) ? '' : data.header_security_name,
        token: (data.token == null || data.token == undefined) ? '' : data.token,
        user_name: (data.user_name == null || data.user_name == undefined) ? '' : data.user_name,
        passwd: (data.passwd == null || data.passwd == undefined) ? '' : data.passwd,
      });

      this.form.get('network_id')?.disable();
     
      this.headerListDelete = [];
      if (data.callback_headers_http == null || data.callback_headers_http == undefined) {
        data.callback_headers_http = [];
      } else {
        this.headerList = data.callback_headers_http;
      }

      if (data.protocol === 'HTTP') {
        
        this.form.get('callback_url')?.setValidators([Validators.required]);
        this.form.get('authentication_types')?.setValidators([Validators.required]);

        this.cdr.detectChanges();

        setTimeout(() => {
          this.showOptionsHttp = true;
          this.showInputUser = false;
          this.showInputPass = false;
          this.showInputToken = false;
  
          if (data?.authentication_types === 'Basic') {
            this.showInputUser = true;
            this.showInputPass = true;
            this.form.get('user_name')?.setValidators([Validators.required]);
            this.form.get('passwd')?.setValidators([Validators.required]);
          } else if (data?.authentication_types === 'Bearer' || data?.authentication_types === 'Api-key') {
            this.showInputToken = true;
            this.form.get('token')?.setValidators([Validators.required]);
          }
        }, 100);
      } else {
        this.showOptionsHttp = false;
        this.showInputUser = false;
        this.showInputPass = false;
        this.showInputToken = false;
        this.showInputHeader = false;
        this.form.get('callback_url')?.clearValidators();
        this.form.get('authentication_types')?.clearValidators();
        this.form.get('header_security_name')?.clearValidators();
      }

    }
    if (disableControls) { 
      this.form.get('name')?.disable();
      this.form.get('system_id')?.disable();      
      this.form.get('protocol')?.disable();
      this.form.get('password')?.disable();
      this.form.get('bind_type')?.disable();
      this.form.get('system_type')?.disable();
      this.form.get('interface_version')?.disable();
      this.form.get('sessions_number')?.disable();
      this.form.get('address_ton')?.disable();
      this.form.get('address_npi')?.disable();
      this.form.get('address_range')?.disable();
      this.form.get('tps')?.disable();
      this.form.get('validity')?.disable();
      this.form.get('enquire_link_period')?.disable();
      this.form.get('pdu_timeout')?.disable();
      this.form.get('contact_name')?.disable();
      this.form.get('email')?.disable();
      this.form.get('phone_number')?.disable();
      this.form.get('callback_url')?.disable();
      this.form.get('authentication_types')?.disable();
      this.form.get('header_security_name')?.disable();
      this.form.get('token')?.disable();
      this.form.get('user_name')?.disable();
      this.form.get('passwd')?.disable();
      this.formTarget.get('header_name')?.disable();
      this.formTarget.get('header_value')?.disable();
      this.saveDisabled = true;
    }
  }

  togglePasswordVisibility(whatPassword: String): void {
    if(whatPassword.toLowerCase() == "sp") {
      this.spPasswordVisible = !this.spPasswordVisible;
      this.spPasswordFieldType = this.spPasswordVisible ? 'text' : 'password';
    } else {
      this.headerPasswordVisible = !this.headerPasswordVisible;
      this.headerPasswordFieldType = this.headerPasswordVisible ? 'text' : 'password';
    }   
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
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern === this.patternEmail ) {
      return 'Invalid email';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern === '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[^\\s]+$') {
      return 'No spaces allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  clearForm() {
    this.form.reset({
      network_id: '',
      name: '',
      system_id: '',
      password: '',
      system_type: '',
      interface_version: '',
      sessions_number: '',
      address_ton: '',
      address_npi: '',
      address_range: '',
      balance_type: '',
      bind_type: '',
      balance: '',
      tps: '',
      validity: '',
      status: '',
      enabled: '',
      enquire_link_period: '',
      pdu_timeout: '',
      contact_name: '',
      email: '',
      phone_number: '',
      protocol: '',
      callback_url: '',
      authentication_types: '',
      header_security_name: '',
      token: '',
      user_name: '',
      passwd: '',
      callback_headers_http: []
    });
  }

  changeProtocol(event: any) {
    let value = event.target.value;
    setTimeout(() => {
      if (value === 'HTTP') {
        this.showOptionsHttp = true;
    
          this.form.get('callback_url')?.setValidators([Validators.required]);
          this.form.get('authentication_types')?.setValidators([Validators.required]);
          this.form.get('authentication_types')?.setValue('Undefined');
          
          this.showInputHeader = false;
          this.showInputUser = false;
          this.showInputPass = false;
          this.showInputToken = false;
        
        } else {
          this.showOptionsHttp = false;
      
          this.form.get('callback_url')?.clearValidators();
          this.form.get('authentication_types')?.clearValidators();
          this.form.get('header_security_name')?.clearValidators();
        }
      this.cdr.detectChanges();
    });

  }

  changeBindTypes(event: any) {
    let value = event.target.value;
  }

  onSelectAuthenticationTypes(event: any) {
    let value = event.target.value;

    // clear validators
    this.form.get('callback_url')?.clearValidators();
    this.form.get('header_security_name')?.clearValidators();
    this.form.get('user_name')?.clearValidators();
    this.form.get('passwd')?.clearValidators();
    this.form.get('token')?.clearValidators();

    this.form.get('header_security_name')?.setValue('');
    this.form.get('user_name')?.setValue('');
    this.form.get('passwd')?.setValue('');
    this.form.get('token')?.setValue('');

    setTimeout(() => {
      
      if (value === 'Basic') {
        this.showInputToken = false;
        this.showInputUser = true;
        this.showInputPass = true;
        this.showInputHeader = true;
        // add validators
        this.form.get('user_name')?.setValidators([Validators.required]);
        this.form.get('passwd')?.setValidators([Validators.required]);
        this.form.get('header_security_name')?.setValidators([Validators.required]);
      } else if (value === 'Bearer' || value === 'Api-key') {
        this.showInputUser = false;
        this.showInputPass = false;
        this.showInputToken = true;
        this.showInputHeader = true;
  
        // add validators
        this.form.get('token')?.setValidators([Validators.required]);
        this.form.get('header_security_name')?.setValidators([Validators.required]);
      } else {
        this.showInputUser = false;
        this.showInputPass = false;
        this.showInputToken = false;
        this.showInputHeader = false;
      }

      this.cdr.detectChanges();
    }, 100);
  }
  

  addHeader(): void {
    if (this.formTarget.invalid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill in the required fields');
      return
    }

    let header = this.headerList.find(x => x.header_name == this.formTarget.get('header_name')?.value && x.header_value == this.formTarget.get('header_value')?.value);

    if (header) {
      this.alertSvr.showAlert(2, 'Error', 'The header already exists');
      return;
    }

    this.headerList.push(this.formTarget.value);
    this.initializeTarget();
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
  }

  removeHeader(index: number): void {
    let item: any = this.headerList[index];
    item.action = 1;
    this.headerListDelete.push(item);
    this.headerList.splice(index, 1);
  }
}
