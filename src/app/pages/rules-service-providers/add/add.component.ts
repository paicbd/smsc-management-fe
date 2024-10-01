import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Catalog, ErrorCode, RoutingRules, Network } from '@core/index';
import { RoutingRolesService, AlertService } from '@core/index';
import { environment } from '@env/environment';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html'
})
export class AddComponent implements OnInit {

  public title = '';
  public isEdit = false;
  public form!: FormGroup;
  public formTarget!: FormGroup;
  public destinationList: any[] = [];
  public destinationDelete: any[] = [];
  
  private env = environment;
  private sourceAddressTon = this.env.RulesServiceProviderDefaults.source_addr_ton;
  private sourceAddressNpi = this.env.RulesServiceProviderDefaults.source_addr_npi;
  private destAddrTon = this.env.RulesServiceProviderDefaults.dest_addr_ton;
  private destAddrNpi = this.env.RulesServiceProviderDefaults.dest_addr_npi;
  destinationNetwoksList: Network[] = [];

  accordionA: boolean = false;
  accordionB: boolean = false;
  accordionC: boolean = false;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() providerErrorCodeList: ErrorCode[] = [];
  @Input() routingRolesList: RoutingRules[] = [];
  @Input() networksList: Network[] = [];
  @Input() networksListSs7: Network[] = [];
  @Input() newSourceAddressTonList: Catalog[] = [];
  @Input() newSourceAddressNpiList: Catalog[] = [];
  @Input() newDestAddrTonList: Catalog[] = [];
  @Input() newDestAddrNpiList: Catalog[] = [];
  @Input() set dataUpdate(value: any) {
    if (value != null && value != undefined) {
      this.loadDataForm(value.responseCodeEdit);
    }
    else {
      this.title = 'Create Routing Rules';
      this.isEdit = false;
      if (this.form != undefined) {
        this.accordionA = true;
        this.accordionB = false;
        this.accordionC = false;
        this.cdr.detectChanges();
        this.form.reset();
        this.form.get('new_source_addr_ton')?.setValue(this.sourceAddressTon);
        this.form.get('new_source_addr_npi')?.setValue(this.sourceAddressNpi);
        this.form.get('new_dest_addr_ton')?.setValue(this.destAddrTon);
        this.form.get('new_dest_addr_npi')?.setValue(this.destAddrNpi);
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private routingRolesService: RoutingRolesService,
    private alertSvr: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadDataForm(null);
  }

  initializeForm(): void {
    this.form = this.fb.group({
      id: [undefined],
      origin_network_id: [undefined, [Validators.required]],
      regex_source_addr: ['', []],
      regex_source_addr_ton: ['', [Validators.pattern('^[a-zA-Z0-9]+$')]],
      regex_source_addr_npi: ['', []],
      regex_destination_addr: ['', []],
      regex_dest_addr_ton: ['', [Validators.pattern('^[0-9]+$')]],
      regex_dest_addr_npi: ['', [Validators.pattern('^[34]+$')]],
      regex_imsi_digits_mask: ['', []],
      regex_network_node_number: ['', []],
      regex_calling_party_address: ['', []],
      destination: this.fb.array([
        this.initializeTarget()
      ]),
      new_source_addr: ['', []],
      new_source_addr_ton: [this.sourceAddressTon, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      new_source_addr_npi: [this.sourceAddressNpi, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      new_destination_addr: ['', []],
      new_dest_addr_ton: [this.destAddrTon, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      new_dest_addr_npi: [this.destAddrNpi, [Validators.required, Validators.pattern('^-1|[0-9]+$')]],
      add_source_addr_prefix: ['', []],
      add_dest_addr_prefix: ['', []],
      remove_source_addr_prefix: ['', []],
      remove_dest_addr_prefix: ['', []],
      new_gt_sccp_addr_mt: ['', ''],
      drop_map_sri: [false, []],
      network_id_to_map_sri: ['', []],
      network_id_to_permanent_failure: ['', []],
      drop_temp_failure: [false, []],
      network_id_temp_failure: ['', []],
      check_sri_response: [false, []],
      is_sri_response: [false, []]
    });
  }

  initializeTarget(): void {
    this.formTarget = this.fb.group({
      id: [],
      priority: [{ value: 1, disabled: true }, [Validators.required, Validators.pattern('^[0-9]+$')],],
      network_id: [0, [Validators.required]],
      action: [2, [Validators.required]],
    });
  }

  loadDataForm(data: any): void {
    if (data == null || data == undefined) {
      this.title = 'Create Routing Rules';
      return;
    } else {
      this.title = 'Edit Routing Rules';
      this.isEdit = true;
      this.form.reset({
        id: (data.id == null || data.id == undefined) ? '' : parseInt(data.id),
        origin_network_id: (data.origin_network_id == null || data.origin_network_id == undefined) ? '' : parseInt(data.origin_network_id),
        regex_source_addr: (data.regex_source_addr == null || data.regex_source_addr == undefined) ? '' : data.regex_source_addr,
        regex_source_addr_ton: (data.regex_source_addr_ton == null || data.regex_source_addr_ton == undefined) ? '' : data.regex_source_addr_ton,
        regex_source_addr_npi: (data.regex_source_addr_npi == null || data.regex_source_addr_npi == undefined) ? '' : data.regex_source_addr_npi,
        regex_destination_addr: (data.regex_destination_addr == null || data.regex_destination_addr == undefined) ? '' : data.regex_destination_addr,
        regex_dest_addr_ton: (data.regex_dest_addr_ton == null || data.regex_dest_addr_ton == undefined) ? '' : data.regex_dest_addr_ton,
        regex_dest_addr_npi: (data.regex_dest_addr_npi == null || data.regex_dest_addr_npi == undefined) ? '' : data.regex_dest_addr_npi,
        regex_imsi_digits_mask: (data.regex_imsi_digits_mask == null || data.regex_imsi_digits_mask == undefined) ? '' : data.regex_imsi_digits_mask,
        regex_network_node_number: (data.regex_network_node_number == null || data.regex_network_node_number == undefined) ? '' : data.regex_network_node_number,
        regex_calling_party_address: (data.regex_calling_party_address == null || data.regex_calling_party_address == undefined) ? '' : data.regex_calling_party_address,
        new_source_addr: (data.new_source_addr == null || data.new_source_addr == undefined) ? '' : data.new_source_addr,
        new_source_addr_ton: (data.new_source_addr_ton == null || data.new_source_addr_ton == undefined) ? this.sourceAddressTon : parseInt(data.new_source_addr_ton),
        new_source_addr_npi: (data.new_source_addr_npi == null || data.new_source_addr_npi == undefined) ? this.sourceAddressNpi : parseInt(data.new_source_addr_npi),
        new_destination_addr: (data.new_destination_addr == null || data.new_destination_addr == undefined) ? '' : data.new_destination_addr,
        new_dest_addr_ton: (data.new_dest_addr_ton == null || data.new_dest_addr_ton == undefined) ? this.destAddrTon : parseInt(data.new_dest_addr_ton),
        new_dest_addr_npi: (data.new_dest_addr_npi == null || data.new_dest_addr_npi == undefined) ? this.destAddrNpi : parseInt(data.new_dest_addr_npi),
        add_source_addr_prefix: (data.add_source_addr_prefix == null || data.add_source_addr_prefix == undefined) ? '' : data.add_source_addr_prefix,
        add_dest_addr_prefix: (data.add_dest_addr_prefix == null || data.add_dest_addr_prefix == undefined) ? '' : data.add_dest_addr_prefix,
        remove_source_addr_prefix: (data.remove_source_addr_prefix == null || data.remove_source_addr_prefix == undefined) ? '' : data.remove_source_addr_prefix,
        remove_dest_addr_prefix: (data.remove_dest_addr_prefix == null || data.remove_dest_addr_prefix == undefined) ? '' : data.remove_dest_addr_prefix,
        new_gt_sccp_addr_mt: (data.new_gt_sccp_addr_mt == null || data.new_gt_sccp_addr_mt == undefined) ? '' : data.new_gt_sccp_addr_mt,
        drop_map_sri: (data.drop_map_sri == null || data.drop_map_sri == undefined) ? false : data.drop_map_sri,
        network_id_to_map_sri: (data.network_id_to_map_sri == null || data.network_id_to_map_sri == undefined) ? '' : data.network_id_to_map_sri,
        network_id_to_permanent_failure: (data.network_id_to_permanent_failure == null || data.network_id_to_permanent_failure == undefined) ? '' : data.network_id_to_permanent_failure,
        drop_temp_failure: (data.drop_temp_failure == null || data.drop_temp_failure == undefined) ? false : data.drop_temp_failure,
        network_id_temp_failure: (data.network_id_temp_failure == null || data.network_id_temp_failure == undefined) ? '' : data.network_id_temp_failure,
        check_sri_response: (data.check_sri_response == null || data.check_sri_response == undefined) ? false : data.check_sri_response,
        is_sri_response: (data.is_sri_response == null || data.is_sri_response == undefined) ? false : data.is_sri_response
      });

      if (data.drop_temp_failure == true && data.network_id_temp_failure != null && data.network_id_temp_failure != undefined) {
        this.form.get('drop_temp_failure')?.setValue(true);
      }

      if (data.destination != null && data.destination != undefined) {
        for (let index = 0; index < data.destination.length; index++) {
          const element = data.destination[index];
          let network = this.networksList.find(x => x.network_id == element.network_id);
          this.destinationList.push({
            id: element.id,
            routing_rules_id: element.routing_rules_id,
            priority: element.priority,
            network_id: element.network_id,
            gateway_name: network?.name,
            action: element?.action
          });
        }

        // load destination networks
        const found = this.networksList.find(x => x.network_id === parseInt(this.form.get('origin_network_id')?.value));
    
        if (found?.network_type === 'SP') {
          this.destinationNetwoksList = this.networksList.filter(x => x.network_type == 'GW');
        } else {
          this.destinationNetwoksList = this.networksList;
        }

        let priority = this.destinationList.length + 1;
        this.formTarget.get('priority')?.setValue(priority);
      }
    }
  }

  onOriginNetworkChange() {
    this.initializeTarget();
    
    this.formTarget.get('network_id')?.setValue(null);
    const id = this.form.get('origin_network_id')?.value;

    const found = this.networksList.find(x => x.network_id === parseInt(id));
  
    
    if (found?.network_type === 'SP') {
      this.destinationNetwoksList = this.networksList.filter(x => x.network_type == 'GW');
    } else {
      this.destinationNetwoksList = this.networksList;
    }

    this.accordionC = true;
    this.cdr.detectChanges();
  }

  onChangeSRI() {
    if (this.form.get('is_sri_response')?.value) {
      this.destinationNetwoksList = this.networksList.filter(x => x.protocol == 'SS7');
    } else {
      const id = this.form.get('origin_network_id')?.value;
      const found = this.networksList.find(x => x.network_id === parseInt(id));

      if (found?.network_type === 'SP') {
        this.destinationNetwoksList = this.networksList.filter(x => x.network_type == 'GW');
      } else {
        this.destinationNetwoksList = this.networksList;
      }
    }
    this.cdr.detectChanges();
  }

  addDestination(): void {
    if (this.formTarget.invalid) {
      this.alertSvr.showAlert(2, 'Error', 'Please fill in the required fields');
      return
    }

    let network_id = this.formTarget.get('network_id')?.value == undefined ? 0 : this.formTarget.get('network_id')?.value;

    if (network_id == 0) {
      this.alertSvr.showAlert(2, 'Error', 'Please select a network');
      return
    }

    let validateProtocol = this.networksList.find(x => x.network_id == network_id);
    if ( validateProtocol?.protocol !== 'SS7' ) {
      // validate origin network id is not equal to destination network id
      if (this.form.get('origin_network_id')?.value == network_id) {
        this.alertSvr.showAlert(2, 'Error', 'Origin network id is equal to destination network id');
        return
      }
    }

    let destination = this.destinationList.find(x => x.network_id == this.formTarget.get('network_id')?.value);

    if (destination != undefined) {
      this.alertSvr.showAlert(2, 'Error', 'Destination already exists');
      return
    }

    let network = this.networksList.find(x => x.network_id == this.formTarget.get('network_id')?.value);
    this.destinationList.push({
      priority: this.formTarget.get('priority')?.value,
      network_id: this.formTarget.get('network_id')?.value,
      gateway_name: network?.name,
    });
    this.initializeTarget();
    let priority = this.destinationList.length + 1;
    this.formTarget.get('priority')?.setValue(priority);
  }

  removeDestination(index: number): void {
    let item: any = this.destinationList[index];
    item.action = 1;
    this.destinationDelete.push(item);
    this.destinationList.splice(index, 1);
    this.formTarget.get('priority')?.setValue(this.destinationList.length + 1);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.destinationList, event.previousIndex, event.currentIndex);
    this.destinationList.forEach((element, i) => {
      element.priority = i + 1;
      element.action = 0;
    });
  }

  close(): void {
    this.destinationList = [];
    this.initializeTarget();
    this.initializeTarget();
    this.closeModal.emit(true);
    this.form.reset();
    this.accordionA = true;
    this.accordionB = false;
    this.accordionC = false;
    this.cdr.detectChanges();
  }

  onChangeState(name: string) {
    if (name == 'network_id_temp_failure') {
      if (this.form.get(name)?.value != null && this.form.get(name)?.value != undefined && this.form.get(name)?.value != '') {
        this.form.get('drop_temp_failure')?.setValue(true);
      } else {
        this.form.get('drop_temp_failure')?.setValue(false);
      }
    }
  }

  validInput(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['required'];
  }

  validPattern(name: string) {
    return this.form.get(name)?.touched && this.form.get(name)?.errors?.['pattern'];
  }

  getPatternMessage(name: string) {
    if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[a-z]+$') {
      return 'Only letters are allowed';
    } else if (this.form.get(name)?.errors?.['pattern']?.requiredPattern == '^[34]+$') {
      return 'Only numbers 3 or 4 are allowed';
    } else {
      return 'Only numbers are allowed';
    }
  }

  async save() {
    if (this.form.invalid) {
      return
    }

    if (this.destinationList.length == 0) {
      this.alertSvr.showAlert(2, 'Error', 'Please add at least one destination');
      this.accordionC = true;
      this.cdr.detectChanges(); 
      return
    }

    let obj = this.form.value;

    obj.destination = [];
    let array: any[] = this.destinationList.concat(this.destinationDelete);
    
    for (let index = 0; index < array.length; index++) {
      const element = array[index];

      if (this.isEdit) {
        obj.destination[index] = {
          id: element.id,
          priority: index + 1,
          network_id: element.network_id,
          action: element.action == undefined ? 2 : element.action,
        }
        if (element.id == undefined) {
          delete obj.destination[index].id;
        }
      } else {
        obj.destination[index] = {
          priority: index + 1,
          network_id: element.network_id,
          action: element.action,
        }
      }
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        if (element == null || element == undefined) {
          obj[key] = '';
        }
      }
    }

    let resp;
    if (this.isEdit) {
      resp = await this.routingRolesService.updateRoutingRoles(obj);
      if (resp.status == 200) {
        this.alertSvr.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvr.showAlert(2, resp.message, resp.comment);
      }
    } else {
      delete obj.id;
      resp = await this.routingRolesService.createRoutingRoles(obj);
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

}
