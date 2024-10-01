import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, Catalog, CatalogService, GatewaySs7Service, Mno, MnosService, ResponseI } from '@app/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-add-ss7',
  templateUrl: './add-ss7.component.html',
})
export class AddSs7Component {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.gatewaySs7);
    } else{
      this.clearForm();
      this.loadDataForm(null);
    }
  }

  title = '';
  form!: FormGroup;
  reponse!: ResponseI;
  isEdit = false;
  mnoList: Mno[] = [];
  network_id: number = 0;
  defaultValues = environment.GatewaySs7Defaults;

  global_title_indicator: any[] = [];

  constructor(
    private fb: FormBuilder,
    private gatewaySs7Service: GatewaySs7Service,
    private catalogService: CatalogService,
    private mnoService: MnosService,
    private alertSvr: AlertService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getMnos();
    this.getGlobalTitleIndicator();
  }

  async getGlobalTitleIndicator() {
    this.reponse = await this.catalogService.getByCatalogType('gtIndicators');

    if (this.reponse.status == 200) {
      this.global_title_indicator = this.reponse.data;
    }
  }

  initializeForm(): void {
    let split_message: boolean = this.defaultValues.split_message === 'true' ? true : false;
    this.form = this.fb.group({
      network_id: [{value: 0, disabled: true }, [Validators.required]],
      name: ['', [Validators.required]],
      status: [this.defaultValues.status, [Validators.required]],
      enabled: [this.defaultValues.enabled, [Validators.required]],
      mno_id: [0, [Validators.required]],
      global_title: [this.defaultValues.global_title, [Validators.required]],
      global_title_indicator: [this.defaultValues.global_title_indicator, [Validators.required]],
      translation_type: [this.defaultValues.translation_type, [Validators.required, Validators.min(0), Validators.max(255), Validators.pattern('^[0-9]*$')]],
      smsc_ssn: [this.defaultValues.smsc_ssn, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      hlr_ssn: [this.defaultValues.hlr_ssn, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      msc_ssn: [this.defaultValues.msc_ssn, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      map_version: [this.defaultValues.map_version, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      split_message: [split_message, [Validators.required]],
    });

    this.form.get('network_id')?.enable();
  }

  async getMnos() {
    this.reponse = await this.mnoService.getMnos();

    if (this.reponse.status == 200) {
      this.mnoList = this.reponse.data;
    }
  }


  loadDataForm(data: any): void {
    if (data == null || data == undefined) {
      this.title = 'Create SS7 Gateway';
      this.isEdit = false;
      return;
    } else {
      let split_message: boolean = this.defaultValues.split_message === 'true' ? true : false;
      this.title = 'Edit SS7 Gateway';
      this.isEdit = true;
      this.network_id = data.network_id;
      this.form.reset({
        network_id: (data.network_id == null || data.network_id == undefined) ? '' : parseInt(data.network_id),
        name: (data.name == null || data.name == undefined) ? '' : data.name,
        status: (data.status == null || data.status == undefined) ? '' : data.status,
        enabled: (data.enabled == null || data.enabled == undefined) ? '' : data.enabled,
        mno_id: (data.mno_id == null || data.mno_id == undefined) ? '' : parseInt(data.mno_id),
        global_title: (data.global_title == null || data.global_title == undefined) ? '' : data.global_title,
        global_title_indicator: (data.global_title_indicator == null || data.global_title_indicator == undefined) ? '' : data.global_title_indicator,
        translation_type: (data.translation_type == null || data.translation_type == undefined) ? '' : parseInt(data.translation_type),
        smsc_ssn: (data.smsc_ssn == null || data.smsc_ssn == undefined) ? '' : parseInt(data.smsc_ssn),
        hlr_ssn: (data.hlr_ssn == null || data.hlr_ssn == undefined) ? '' : parseInt(data.hlr_ssn),
        msc_ssn: (data.msc_ssn == null || data.msc_ssn == undefined) ? '' : parseInt(data.msc_ssn),
        map_version: (data.map_version == null || data.map_version == undefined) ? '' : parseInt(data.map_version),
        split_message: (data.split_message == null || data.split_message == undefined) ? split_message : data.split_message,
      });

      this.form.get('network_id')?.disable();

    }
  }

  async save() {
    if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log('Invalid control:', key, control.errors);
        }
      });
      console.log("form invalid.")
      return
    }

    if (this.form.get('mno_id')?.value == 0) {
      this.alertSvr.showAlert(2, 'Error', 'MNO is required');
      return;
    }
    let obj = this.form.value;

    let resp;
    if (this.isEdit) {
      obj.network_id = this.network_id;
      resp = await this.gatewaySs7Service.updateGatewaySs7(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.network_id;
      resp = await this.gatewaySs7Service.createGatewaySs7(obj);
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

  close(): void {
    this.clearForm();
    this.closeModal.emit(true);
  }


  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
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

  getMin(name: string) {
    return this.form.get(name)?.errors?.['min']?.min;
  }

  getMax(name: string) {
    return this.form.get(name)?.errors?.['max']?.max;
  }

  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[A-Za-z0-9]*$') {
      return 'Only alphanumeric characters are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  clearForm() {
    if (this.form) {
      this.form.reset({
        network_id: '',
        name: '',
        status: '',
        enabled: '',
        mno_id: '',
        global_title: '',
        global_title_indicator: '',
        translation_type: '',
        smsc_ssn: '',
        hlr_ssn: '',
        msc_ssn: '',
        map_version: ''
      });
    }
  }
}
