import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventEmitter, Input, Output } from '@angular/core';
import { BroadCastService, AlertService, ServiceProvidersService, ServiceProvider, Broadcast, Statistic } from '@core/index';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit{

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.mnoEdit);
      const fileNameElement = document.getElementById('file-name');
      if (fileNameElement) fileNameElement.textContent = 'No file chosen';
    }
    else {
      this.title = 'Create Broadcast SMS';
      this.isEdit = false;
      if (this.form != undefined) {
        this.form.reset();
      }
      this.disabled = true;
      const fileNameElement = document.getElementById('file-name');
      if (fileNameElement) fileNameElement.textContent = 'No file chosen';
    }
  }

  isEdit = false;
  form!: FormGroup;
  public title = 'Create Broadcast SMS';
  serviceProviderList: ServiceProvider[] = [];
  fileName: string | null = null;
  broadcast: Broadcast = {
    broadcast_id: 0,
    name: '',
    total_message: 0,
    network_id: 0,
    description: '',
    file_id: 0,
    status: '',
    created_at: '',
    updated_at: '',
    request_dlr: false
  };
  statistics: Statistic = {
    total_message: 0,
    pending: 0,
    enqueue: 0,
    sent: 0,
    failed: 0
    };
  disabled: boolean = false;
  isLoadingFile: boolean = false;
  uploadProgress: number = 0;

  constructor(
    private fb: FormBuilder,
    private broadCastService: BroadCastService,
    private serviceProvidersService: ServiceProvidersService,
    private alertSvr: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadDataForm(null);
    this.loadProviders();
  }

  async loadProviders() {
    let response = await this.serviceProvidersService.getProviders();
    if (response.status == 200) {
      this.serviceProviderList = response.data;
      this.serviceProviderList = this.serviceProviderList.filter((provider) => provider.protocol == 'HTTP');
    }
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      name: ['', [Validators.required]],
      network_id: [Validators.required],
      description: [''],
      status: [false],
      request_dlr: [false]
    });
  }

  handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.name.endsWith('.csv')) {
        this.alertSvr.showAlert(2, 'Invalid file type', 'Only .csv files are allowed.');
        this.fileName = null;
        this.updateFileLabel();
        return;
      }
      
      this.fileName = file.name;
      this.updateFileLabel();
      
      this.uploadProgress = 0;
      this.isLoadingFile = true;
      
      this.simulateFileUpload();
    } else {
      this.fileName = null;
      this.updateFileLabel();
      
      this.uploadProgress = 0;
      this.isLoadingFile = false;
    }
    
    this.cdr.detectChanges();
  }

  simulateFileUpload() {
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isLoadingFile = false;
        this.uploadProgress = 100;
      }
    }, 500);
  }

  updateFileLabel() {
    const fileLabel = document.getElementById('file-label');
    const fileNameElement = document.getElementById('file-name');
    
    if (this.fileName) {
      if (fileLabel) fileLabel.classList.remove('disabled');
      if (fileNameElement) fileNameElement.textContent = this.fileName;
    } else {
      if (fileLabel) fileLabel.classList.add('disabled');
      if (fileNameElement) fileNameElement.textContent = 'No file chosen';
    }
  }

  async save() {
    if (this.form.invalid) {
      return;
    }
  
    const formData = new FormData();
    let obj = this.form.value;
    if (this.isEdit) {
      obj.file_id = this.broadcast.file_id;
    } else {
      delete obj.status;
    }
    formData.append('broadcast', JSON.stringify(obj));
  
    if (!this.isEdit && !this.fileName) {
      this.alertSvr.showAlert(2, 'File required', 'Please select a file to upload.');
      return;
    }

    if (this.fileName) {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        if (fileInput.files[0].size == 0) {
          this.alertSvr.showAlert(2, 'Empty file', 'Please select a file with data to upload.');
          return;
        }
        const fileContent = (await fileInput.files[0].text()).trim();
        const lines = fileContent.split('\n');
        if (lines.length < 2) {
          this.alertSvr.showAlert(2, 'Invalid file', 'The file contains empty lines. Please remove them and try again.');
          return;
        }
        formData.append('file', fileInput.files[0]);
      }
    }
  
    let resp;
    if (this.isEdit) {
      formData.append('id', this.form.value.id);
      resp = await this.broadCastService.updateBroadCast(formData);
    } else {
      resp = await this.broadCastService.createBroadCast(formData);
    }
  
    if (resp.status == 200) {
      this.alertSvr.showAlert(1, resp.message, resp.comment);
      this.close();
    } else {
      this.alertSvr.showAlert(2, resp.message, resp.comment);
    }
  }

  close(): void {
    const fileNameElement = document.getElementById('file-name');
    if (fileNameElement) fileNameElement.textContent = 'No file chosen';

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    this.closeModal.emit(true);
    this.form.reset();
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  async loadDataForm(data: any) {
    if (data == null || data == undefined) {
      this.title = 'Create Broadcast SMS';
      this.disabled = true;

      const fileNameElement = document.getElementById('file-name');
      if (fileNameElement) fileNameElement.textContent = 'No file chosen';
      return;
    } else {
      this.title = 'Edit Broadcast SMS';
      this.isEdit = true;

      let dataResponse = await this.broadCastService.getBroadCastById(data.broadcast_id);

      if (dataResponse.status != 200) {
        this.alertSvr.showAlert(2, dataResponse.message, dataResponse.comment);
        return;
      }

      this.broadcast = dataResponse.data.broadcast;
      this.statistics = dataResponse.data.statistics;

      this.form.reset({
        id: data.broadcast_id,
        name: this.broadcast.name,
        network_id: this.broadcast.network_id,
        description: this.broadcast.description,
        status: this.broadcast.status,
        request_dlr: this.broadcast.request_dlr
      });

      const fileNameElement = document.getElementById('file-name');
      if (fileNameElement) {
        fileNameElement.textContent = this.broadcast.file_id ? dataResponse.data?.filename : 'No file chosen';
      }

      if (this.broadcast.status.toUpperCase() === 'FAILED' || this.broadcast.status.toUpperCase() === 'CREATED') {
        this.disabled = true
      } else {
        this.disabled = false
      }
    }
  }

}
