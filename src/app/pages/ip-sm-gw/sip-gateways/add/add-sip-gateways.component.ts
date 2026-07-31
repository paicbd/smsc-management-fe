import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AlertService, Catalog, CatalogService, Mno, MnosService, ResponseI } from '@app/core';
import { FormDirtyTracker } from '@app/core/forms/form-dirty-tracker';
import { FormFieldOption, FormSectionConfig } from '@app/core/forms/form-section.model';
import { SipGatewaysService } from '@app/core/services/sip-gateways.service';
import { GatewaySs7Service } from '@app/core/services/gateway-ss7.service';
import { ChargingSettingsService } from '@app/core/services/charging-settings.service';
import { ApiContext } from '@app/core/utils/types/api-context.type';
import { isIpSmGw as isIpSmGwCtx, isSmsc as isSmscCtx } from '@core/utils/functions/apiContext.helper';
import { environment } from '@env/environment';

import { SipGatewayFormValue } from '@app/core/interfaces/SipGateways';
import { priorityRequiredValidator } from '@app/shared/message-validator';
import { buildSipGatewayGeneralSection } from '../config/sip-gateway-general-section.config';
import { SIP_GATEWAY_TIMERS_SECTION } from '../config/sip-gateway-timers-section.config';
import { SIP_GATEWAY_PERFORMANCE_SECTION } from '../config/sip-gateway-performance-section.config';
import { SIP_GATEWAY_SUBSCRIBE_SECTION } from '../config/sip-gateway-subscribe-section.config';
import { SIP_GATEWAY_IPSMGW_SECTION } from '../config/sip-gateway-ipsmgw-section.config';
import { SIP_GATEWAY_IMS_SECTION } from '../config/sip-gateway-ims-section.config';
import { SIP_GATEWAY_RETRIES_SECTION } from '../config/sip-gateway-retries-section.config';

interface Ss7GatewayOption {
  network_id: number;
  name: string;
  hss_update_enabled?: boolean;
  allowed_traffic?: boolean;
  allowed_ussi?: boolean;
}

interface DiameterGatewayOption {
  id: number;
  name: string;
}

interface SipGatewayPayload {
  network_id?: number;
  ip_address: string;
  name: string;
  external_id: string | null;
  status: string;
  protocol: string;
  port: number;
  transport: string;
  messages_per_second: number;
  messages_per_second_high: number;
  messages_per_second_medium: number;
  messages_per_second_low: number;
  transaction_timeout: number;
  retransmission_base_interval_ms: number;
  retransmission_max_interval_ms: number;
  network_timeout_ms: number;
  thread_pool_size: number;
  retransmission_filter: boolean;
  max_message_size: number;
  split_message: boolean;
  receive_udp_buffer_size: number;
  send_udp_buffer_size: number;
  aggressive_cleanup: boolean;
  routing_enable_ss7: boolean;
  routing_enable_diameter: boolean;
  routing_registration_traffic_ss7_gateway_id: number | null;
  routing_registration_traffic_diameter_gateway_id: number | null;
  routing_ussi_traffic_ss7_gateway_id: number | null;
  auto_retry_error_code: string | null;
  no_retry_error_code: string | null;
  retry_alternate_destination_error_code: string | null;
  enabled: number;
  register_max_expires: number | null;
  ipsmgw_user: string | null;
  ipsmgw_domain: string | null;
  ims_domain: string | null;
  ims_ccf: string | null;
  ims_ecf: string | null;
  subscribe_target_host: string | null;
  subscribe_target_port: number | null;
  subscribe_target_transport: string | null;
  local_via_host: string | null;
  global_title: number | null;
  mno_id: number | null;
  ussi_default_datacoding_id: number | null;
}

function normalizeSipGatewayForm(value: SipGatewayFormValue): SipGatewayFormValue {
  const toNumber = (input: unknown, fallback = 0): number => {
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const toNumberOrNull = (input: unknown): number | null => {
    if (input === '' || input === null || input === undefined) {
      return null;
    }

    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toStringValue = (input: unknown): string => (input ?? '').toString().trim();

  const toStringOrNull = (input: unknown): string | null => {
    const parsed = toStringValue(input);
    return parsed.length ? parsed : null;
  };

  return {
    network_id: value.network_id == null ? null : toNumber(value.network_id),

    ip_address: toStringValue(value.ip_address),
    name: toStringValue(value.name),
    external_id: toStringOrNull(value.external_id),

    status: toStringValue(value.status),
    protocol: toStringValue(value.protocol),

    port: toNumberOrNull(value.port),
    transport: toStringValue(value.transport),
    messages_per_second: toNumberOrNull(value.messages_per_second),
    messages_per_second_high: toNumberOrNull(value.messages_per_second_high),
    messages_per_second_medium: toNumberOrNull(value.messages_per_second_medium),
    messages_per_second_low: toNumberOrNull(value.messages_per_second_low),

    transaction_timeout: toNumberOrNull(value.transaction_timeout),
    retransmission_base_interval_ms: toNumberOrNull(value.retransmission_base_interval_ms),
    retransmission_max_interval_ms: toNumberOrNull(value.retransmission_max_interval_ms),
    network_timeout_ms: toNumberOrNull(value.network_timeout_ms),

    thread_pool_size: toNumberOrNull(value.thread_pool_size),
    retransmission_filter: !!value.retransmission_filter,
    max_message_size: toNumberOrNull(value.max_message_size),
    split_message: !!value.split_message,

    receive_udp_buffer_size: toNumberOrNull(value.receive_udp_buffer_size),
    send_udp_buffer_size: toNumberOrNull(value.send_udp_buffer_size),
    aggressive_cleanup: !!value.aggressive_cleanup,

    routing_enable_ss7: !!value.routing_enable_ss7,
    routing_enable_diameter: !!value.routing_enable_diameter,

    routing_registration_traffic_ss7_gateway_id: toNumberOrNull(value.routing_registration_traffic_ss7_gateway_id),
    routing_registration_traffic_diameter_gateway_id: toNumberOrNull(value.routing_registration_traffic_diameter_gateway_id),
    routing_ussi_traffic_ss7_gateway_id: toNumberOrNull(value.routing_ussi_traffic_ss7_gateway_id),
    auto_retry_error_code: toStringOrNull(value.auto_retry_error_code),
    no_retry_error_code: toStringOrNull(value.no_retry_error_code),
    retry_alternate_destination_error_code: toStringOrNull(value.retry_alternate_destination_error_code),

    enabled: toNumber(value.enabled),

    register_max_expires: toNumberOrNull(value.register_max_expires),

    ipsmgw_user: toStringOrNull(value.ipsmgw_user),
    ipsmgw_domain: toStringOrNull(value.ipsmgw_domain),

    ims_domain: toStringOrNull(value.ims_domain),
    ims_ccf: toStringOrNull(value.ims_ccf),
    ims_ecf: toStringOrNull(value.ims_ecf),

    subscribe_target_host: toStringOrNull(value.subscribe_target_host),
    subscribe_target_port: toNumberOrNull(value.subscribe_target_port),
    subscribe_target_transport: toStringOrNull(value.subscribe_target_transport),

    local_via_host: toStringOrNull(value.local_via_host),
    global_title: toNumberOrNull(value.global_title),
    mno_id: toNumberOrNull(value.mno_id),
    ussi_default_datacoding_id: toNumberOrNull(value.ussi_default_datacoding_id),
  };
}

@Component({
  selector: 'app-add-sip-gateways',
  templateUrl: './add-sip-gateways.component.html',
})
export class AddSipGatewaysComponent implements OnInit, OnDestroy {
  title = '';
  form!: FormGroup;
  response!: ResponseI;

  defaultValues = environment.SipGatewaysDefaults;

  isEdit = false;
  network_id = 0;

  ctx: ApiContext = ApiContext.IP_SM_GW;
  isIpSmGw = true;
  isSMSC = false;

  disabled = false;
  isModified = false;

  ss7AllowedUssi: Ss7GatewayOption[] = [];
  ss7Gateways: Ss7GatewayOption[] = [];
  diameterGateways: DiameterGatewayOption[] = [];

  mnoList: Mno[] = [];
  mnoOptions: FormFieldOption[] = [{ label: 'Select MNO', value: null }];

  generalSection!: FormSectionConfig;
  timersSection = SIP_GATEWAY_TIMERS_SECTION;
  performanceSection = SIP_GATEWAY_PERFORMANCE_SECTION;
  subscribeSection = SIP_GATEWAY_SUBSCRIBE_SECTION;
  ipsmgwSection = SIP_GATEWAY_IPSMGW_SECTION;
  imsSection = SIP_GATEWAY_IMS_SECTION;
  retriesSection = SIP_GATEWAY_RETRIES_SECTION;

  private readonly dirtyTracker = new FormDirtyTracker<SipGatewayFormValue>(normalizeSipGatewayForm);
  private dirtySub?: Subscription;
  private routingSub = new Subscription();
  private routeParamsSub?: Subscription;
  encodingList: Catalog[] = [];
  encodingOptions: FormFieldOption[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly sipGatewaysService: SipGatewaysService,
    private readonly gatewaySs7Service: GatewaySs7Service,
    private readonly chargingSettingsService: ChargingSettingsService,
    private readonly mnoService: MnosService,
    private readonly alertSvc: AlertService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly catalogService: CatalogService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.ctx = (this.route.snapshot.data['apiContext'] as ApiContext) || ApiContext.SMSC;
    this.isIpSmGw = isIpSmGwCtx(this.ctx);
    this.isSMSC = isSmscCtx(this.ctx);

    this.initializeForm();
    this.refreshGeneralSection();

    await Promise.all([
      this.loadMnos(),
      this.loadEncodings(),
    ]);

    this.bindRoutingRules();
    this.bindMessagePriorityRules();

    this.dirtySub = this.dirtyTracker.isModified$.subscribe((value) => {
      this.isModified = value;
    });

    this.routeParamsSub = this.route.paramMap.subscribe(async (params) => {
      const idParam = params.get('network_id');

      if (idParam && !Number.isNaN(Number(idParam))) {
        await this.loadForEdit(Number(idParam));
      } else {
        await this.prepareForCreate();
        this.dirtyTracker.attach(this.form);
      }
    });
  }

  ngOnDestroy(): void {
    this.dirtySub?.unsubscribe();
    this.routeParamsSub?.unsubscribe();
    this.routingSub.unsubscribe();
    this.dirtyTracker.destroy();
  }

  private refreshGeneralSection(): void {
    this.generalSection = buildSipGatewayGeneralSection(this.isEdit, this.mnoOptions, this.encodingOptions,);
  }

  private async loadMnos(): Promise<void> {
    const resp = await this.mnoService.getMnos();

    if (resp.status === 200) {
      this.mnoList = resp.data ?? [];
      this.mnoOptions = [
        { label: 'Select MNO', value: null },
        ...this.mnoList.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      ];
    } else {
      this.mnoList = [];
      this.mnoOptions = [{ label: 'Select MNO', value: null }];
    }

    this.refreshGeneralSection();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      network_id: [{ value: 0, disabled: true }, [Validators.required]],

      ip_address: ['', [Validators.required]],
      name: ['', [Validators.required]],
      external_id: [null],

      status: [''],
      protocol: [''],

      port: [null, [Validators.required, Validators.min(1), Validators.max(65535)]],
      transport: ['', [Validators.required]],
      messages_per_second: [{ value: null, disabled: true }],
      messages_per_second_high: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_medium: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      messages_per_second_low: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],

      mno_id: [null, [Validators.required, Validators.min(1)]],

      transaction_timeout: [null, [Validators.required, Validators.min(1)]],
      retransmission_base_interval_ms: [null, [Validators.required, Validators.min(1)]],
      retransmission_max_interval_ms: [null, [Validators.required, Validators.min(1)]],
      network_timeout_ms: [null, [Validators.required, Validators.min(1)]],

      thread_pool_size: [null, [Validators.required, Validators.min(1)]],
      retransmission_filter: [false],
      max_message_size: [null, [Validators.required, Validators.min(1)]],
      split_message: [false],

      receive_udp_buffer_size: [null, [Validators.required, Validators.min(1)]],
      send_udp_buffer_size: [null, [Validators.required, Validators.min(1)]],
      aggressive_cleanup: [true],

      routing_enable_ss7: [false],
      routing_enable_diameter: [false],

      routing_registration_traffic_ss7_gateway_id: [null],
      routing_registration_traffic_diameter_gateway_id: [null],
      routing_ussi_traffic_ss7_gateway_id: [null],
      auto_retry_error_code: [null],
      no_retry_error_code: [null],
      retry_alternate_destination_error_code: [null],

      enabled: [0, [Validators.required]],

      register_max_expires: [null, [Validators.min(1)]],

      ipsmgw_user: [null],
      ipsmgw_domain: [null],

      ims_domain: [null],
      ims_ccf: [null],
      ims_ecf: [null],

      subscribe_target_host: [null],
      subscribe_target_port: [null, [Validators.min(1), Validators.max(65535)]],
      subscribe_target_transport: [null],

      local_via_host: [null],
      global_title: [null, [Validators.required]],
      ussi_default_datacoding_id: [this.defaultValues.ussi_default_datacoding_id ?? 1, [Validators.required]],
    }, {
      validators: [priorityRequiredValidator(
        'messages_per_second_high',
        'messages_per_second_medium',
        'messages_per_second_low',
      )],
    });
  }

  private createDefaultFormValue(patch?: Partial<SipGatewayFormValue>): SipGatewayFormValue {
    const routing = this.normalizeRoutingMode(
      patch?.routing_enable_ss7,
      patch?.routing_enable_diameter
    );

    return {
      network_id: patch?.network_id ?? 0,

      ip_address: patch?.ip_address ?? '',
      name: patch?.name ?? '',
      external_id: patch?.external_id ?? null,

      status: patch?.status ?? '',
      protocol: patch?.protocol ?? '',

      port: patch?.port ?? null,
      transport: patch?.transport ?? this.defaultValues.transport ?? 'UDP',
      messages_per_second: patch?.messages_per_second ?? this.defaultValues.messages_per_second ?? 100,
      messages_per_second_high: patch?.messages_per_second_high ?? this.defaultValues.messages_per_second_high ?? 70,
      messages_per_second_medium: patch?.messages_per_second_medium ?? this.defaultValues.messages_per_second_medium ?? 20,
      messages_per_second_low: patch?.messages_per_second_low ?? this.defaultValues.messages_per_second_low ?? 10,
      mno_id: patch?.mno_id ?? null,

      transaction_timeout: patch?.transaction_timeout ?? this.defaultValues.transaction_timeout ?? null,
      retransmission_base_interval_ms:
        patch?.retransmission_base_interval_ms ?? this.defaultValues.retransmission_base_interval_ms ?? null,
      retransmission_max_interval_ms:
        patch?.retransmission_max_interval_ms ?? this.defaultValues.retransmission_max_interval_ms ?? null,
      network_timeout_ms: patch?.network_timeout_ms ?? this.defaultValues.network_timeout_ms ?? null,

      thread_pool_size: patch?.thread_pool_size ?? this.defaultValues.thread_pool_size ?? null,
      retransmission_filter: patch?.retransmission_filter ?? this.defaultValues.retransmission_filter ?? false,
      max_message_size: patch?.max_message_size ?? this.defaultValues.max_message_size ?? null,
      split_message: patch?.split_message ?? this.defaultValues.split_message ?? false,

      receive_udp_buffer_size: patch?.receive_udp_buffer_size ?? this.defaultValues.receive_udp_buffer_size ?? null,
      send_udp_buffer_size: patch?.send_udp_buffer_size ?? this.defaultValues.send_udp_buffer_size ?? null,
      aggressive_cleanup: patch?.aggressive_cleanup ?? this.defaultValues.aggressive_cleanup ?? true,

      routing_enable_ss7: routing.ss7,
      routing_enable_diameter: routing.diameter,

      routing_registration_traffic_ss7_gateway_id: patch?.routing_registration_traffic_ss7_gateway_id ?? null,
      routing_registration_traffic_diameter_gateway_id:
        patch?.routing_registration_traffic_diameter_gateway_id ?? null,
      routing_ussi_traffic_ss7_gateway_id: patch?.routing_ussi_traffic_ss7_gateway_id ?? null,
      auto_retry_error_code: patch?.auto_retry_error_code ?? null,
      no_retry_error_code: patch?.no_retry_error_code ?? null,
      retry_alternate_destination_error_code: patch?.retry_alternate_destination_error_code ?? null,

      enabled: patch?.enabled ?? this.defaultValues.enabled ?? 0,

      register_max_expires: patch?.register_max_expires ?? this.defaultValues.register_max_expires ?? null,

      ipsmgw_user: patch?.ipsmgw_user ?? null,
      ipsmgw_domain: patch?.ipsmgw_domain ?? null,

      ims_domain: patch?.ims_domain ?? null,
      ims_ccf: patch?.ims_ccf ?? null,
      ims_ecf: patch?.ims_ecf ?? null,

      subscribe_target_host: patch?.subscribe_target_host ?? null,
      subscribe_target_port: patch?.subscribe_target_port ?? null,
      subscribe_target_transport:
        patch?.subscribe_target_transport ?? this.defaultValues.subscribe_target_transport ?? null,

      local_via_host: patch?.local_via_host ?? null,
      global_title: patch?.global_title ?? null,
      ussi_default_datacoding_id: patch?.ussi_default_datacoding_id ?? this.defaultValues.ussi_default_datacoding_id ?? 'UCS2',
    };
  }

  private normalizeRoutingMode(
    ss7Value?: boolean | null,
    diameterValue?: boolean | null
  ): { ss7: boolean; diameter: boolean } {
    const hasSs7 = ss7Value != null;
    const hasDiameter = diameterValue != null;

    let ss7 = hasSs7 ? !!ss7Value : true;
    let diameter = hasDiameter ? !!diameterValue : false;

    if (ss7 && diameter) {
      diameter = false;
    }

    return { ss7, diameter };
  }

  private resetForm(patch?: Partial<SipGatewayFormValue>): void {
    this.dirtyTracker.pause();

    const value = this.createDefaultFormValue(patch);
    this.form.reset(value, { emitEvent: false });

    this.dirtyTracker.resume();
  }

  private async prepareForCreate(): Promise<void> {
    this.title = 'Create SIP Gateways';
    this.isEdit = false;
    this.network_id = 0;
    this.disabled = false;

    this.refreshGeneralSection();

    this.resetForm({
      network_id: 0,
      mno_id: null,
    });

    this.form.get('network_id')?.disable({ emitEvent: false });
    await this.bootstrapRoutingCatalogs();
  }

  private async loadForEdit(id: number): Promise<void> {
    this.title = 'Edit SIP Gateways';
    this.isEdit = true;
    this.network_id = id;

    this.refreshGeneralSection();

    const resp = await this.sipGatewaysService.getSipGatewaysById(id);

    if (resp.status !== 200) {
      this.alertSvc.showAlert(2, 'Error', 'Invalid SIP gateway');
      this.router.navigate(this.sipBasePath);
      return;
    }

    const data = resp.data?.sipGateway ?? resp.data?.sipSettings ?? resp.data;

    this.dirtyTracker.pause();

    this.resetForm({
      network_id: data.network_id ?? id,
      ip_address: data.ip_address ?? '',
      name: data.name ?? '',
      external_id: data.external_id ?? null,
      status: data.status ?? '',
      protocol: data.protocol ?? '',
      port: data.port ?? null,
      transport: data.transport ?? '',
      messages_per_second:
        data.messages_per_second
        ?? ((data.messages_per_second_high ?? 70) + (data.messages_per_second_medium ?? 20) + (data.messages_per_second_low ?? 10)),
      messages_per_second_high: data.messages_per_second_high ?? 70,
      messages_per_second_medium: data.messages_per_second_medium ?? 20,
      messages_per_second_low: data.messages_per_second_low ?? 10,
      mno_id: data.mno_id ?? null,
      transaction_timeout: data.transaction_timeout ?? null,
      retransmission_base_interval_ms: data.retransmission_base_interval_ms ?? null,
      retransmission_max_interval_ms: data.retransmission_max_interval_ms ?? null,
      network_timeout_ms: data.network_timeout_ms ?? null,
      thread_pool_size: data.thread_pool_size ?? null,
      retransmission_filter: data.retransmission_filter ?? false,
      max_message_size: data.max_message_size ?? null,
      split_message: data.split_message ?? false,
      receive_udp_buffer_size: data.receive_udp_buffer_size ?? null,
      send_udp_buffer_size: data.send_udp_buffer_size ?? null,
      aggressive_cleanup: data.aggressive_cleanup ?? true,
      routing_enable_ss7: data.routing_enable_ss7 ?? false,
      routing_enable_diameter: data.routing_enable_diameter ?? false,
      routing_registration_traffic_ss7_gateway_id: data.routing_registration_traffic_ss7_gateway_id ?? null,
      routing_registration_traffic_diameter_gateway_id:
        data.routing_registration_traffic_diameter_gateway_id ?? null,
      routing_ussi_traffic_ss7_gateway_id: data.routing_ussi_traffic_ss7_gateway_id ?? null,
      auto_retry_error_code: data.auto_retry_error_code ?? null,
      no_retry_error_code: data.no_retry_error_code ?? null,
      retry_alternate_destination_error_code: data.retry_alternate_destination_error_code ?? null,
      enabled: data.enabled ?? 0,
      register_max_expires: data.register_max_expires ?? null,
      ipsmgw_user: data.ipsmgw_user ?? null,
      ipsmgw_domain: data.ipsmgw_domain ?? null,
      ims_domain: data.ims_domain ?? null,
      ims_ccf: data.ims_ccf ?? null,
      ims_ecf: data.ims_ecf ?? null,
      subscribe_target_host: data.subscribe_target_host ?? null,
      subscribe_target_port: data.subscribe_target_port ?? null,
      subscribe_target_transport: data.subscribe_target_transport ?? null,
      local_via_host: data.local_via_host ?? null,
      global_title: data.global_title ?? null,
      ussi_default_datacoding_id: data.ussi_default_datacoding_id ?? 1,
    });

    this.form.get('network_id')?.disable({ emitEvent: false });

    if (data.enabled === 1) {
      this.disabled = true;
      this.form.disable({ emitEvent: false });
      this.form.get('network_id')?.disable({ emitEvent: false });
    } else {
      this.disabled = false;
      this.form.enable({ emitEvent: false });
      this.form.get('network_id')?.disable({ emitEvent: false });
    }

    this.dirtyTracker.resume();
    this.dirtyTracker.attach(this.form);

    await this.bootstrapRoutingCatalogs();
  }

  private bindRoutingRules(): void {
    const ss7Control = this.form.get('routing_enable_ss7');
    const diameterControl = this.form.get('routing_enable_diameter');

    if (!ss7Control || !diameterControl) {
      return;
    }

    const ss7Sub = ss7Control.valueChanges.subscribe(async (enabled: boolean) => {
      if (enabled) {
        diameterControl.patchValue(false, { emitEvent: false });

        this.form.patchValue(
          {
            routing_registration_traffic_diameter_gateway_id: null,
          },
          { emitEvent: false }
        );

        await this.loadSs7Gateways();
      } else {
        this.form.patchValue(
          {
            routing_registration_traffic_ss7_gateway_id: null,
            routing_ussi_traffic_ss7_gateway_id: null,
          },
          { emitEvent: false }
        );
      }
    });

    const diameterSub = diameterControl.valueChanges.subscribe(async (enabled: boolean) => {
      if (enabled) {
        ss7Control.patchValue(false, { emitEvent: false });

        this.form.patchValue(
          {
            routing_registration_traffic_ss7_gateway_id: null,
            routing_ussi_traffic_ss7_gateway_id: null,
          },
          { emitEvent: false }
        );

        await this.loadDiameterGateways();
      } else {
        this.form.patchValue(
          {
            routing_registration_traffic_diameter_gateway_id: null,
          },
          { emitEvent: false }
        );
      }
    });

    this.routingSub.add(ss7Sub);
    this.routingSub.add(diameterSub);
  }

  private bindMessagePriorityRules(): void {
    ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'].forEach((field) => {
      const control = this.form.get(field);
      if (!control) {
        return;
      }

      this.routingSub.add(control.valueChanges.subscribe(() => {
        const high = Number(this.form.get('messages_per_second_high')?.value ?? 0);
        const medium = Number(this.form.get('messages_per_second_medium')?.value ?? 0);
        const low = Number(this.form.get('messages_per_second_low')?.value ?? 0);
        this.form.get('messages_per_second')?.setValue(high + medium + low, { emitEvent: false });
      }));
    });

    const high = Number(this.form.get('messages_per_second_high')?.value ?? 0);
    const medium = Number(this.form.get('messages_per_second_medium')?.value ?? 0);
    const low = Number(this.form.get('messages_per_second_low')?.value ?? 0);
    this.form.get('messages_per_second')?.setValue(high + medium + low, { emitEvent: false });
  }

  private async bootstrapRoutingCatalogs(): Promise<void> {
    const ss7Enabled = !!this.form.get('routing_enable_ss7')?.value;
    const diameterEnabled = !!this.form.get('routing_enable_diameter')?.value;

    if (ss7Enabled) {
      await this.loadSs7Gateways();
    }

    if (diameterEnabled) {
      await this.loadDiameterGateways();
    }
  }

  private toEncodingOptions(catalogs: Catalog[]): FormFieldOption[] {
    return catalogs
      .filter((item): item is Catalog & { id: number; name: string } =>
        item.id != null && !!item.name?.trim()
      )
      .map((item) => ({
        label: item.name,
        value: item.id,
      }));
  }

  private async loadEncodings(): Promise<void> {
    const resp = await this.catalogService.getByCatalogType('encodingType');

    if (resp.status === 200) {
      this.encodingList = resp.data ?? [];
      this.encodingOptions = this.toEncodingOptions(this.encodingList);
    } else {
      this.encodingList = [];
      this.encodingOptions = [];
    }

    this.refreshGeneralSection();
  }

  private async loadSs7Gateways(): Promise<void> {
    const resp = await this.gatewaySs7Service.getGatewaySs7(ApiContext.SMSC);
    const gateways: Ss7GatewayOption[] = resp.status === 200 ? (resp.data ?? []) : [];

    this.ss7Gateways = gateways.filter((gateway) => gateway.hss_update_enabled === true);
    this.ss7AllowedUssi = gateways.filter((gateway) => gateway.allowed_ussi === true);
  }

  private async loadDiameterGateways(): Promise<void> {
    const resp = await this.chargingSettingsService.getAllDiameterGateways(ApiContext.SMSC);
    this.diameterGateways = resp.status === 200 ? (resp.data ?? []) : [];
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    let resp: ResponseI;

    if (this.isEdit) {
      resp = await this.sipGatewaysService.updateSipGateways(this.network_id, payload);

      if (resp.status === 200) {
        this.alertSvc.showAlert(1, resp.message, resp.comment);
        this.dirtyTracker.captureSnapshot(this.form);
      } else {
        this.alertSvc.showAlert(2, resp.message, resp.comment);
      }
    } else {
      const { network_id, ...createPayload } = payload;

      resp = await this.sipGatewaysService.createSipGateways(createPayload);

      if (resp.status === 200) {
        this.alertSvc.showAlert(1, resp.message, resp.comment);
      } else {
        this.alertSvc.showAlert(2, resp.message, resp.comment);
      }
    }

    if (resp.status === 200) {
      this.dirtyTracker.captureSnapshot(this.form);
      this.router.navigate(this.sipBasePath);
    }
  }

  private buildPayload(): SipGatewayPayload {
    const rawValue = this.form.getRawValue() as SipGatewayFormValue;
    const normalized = normalizeSipGatewayForm(rawValue);
    const routing = this.normalizeRoutingMode(
      normalized.routing_enable_ss7,
      normalized.routing_enable_diameter
    );

    return {
      network_id: normalized.network_id ?? undefined,
      ip_address: normalized.ip_address,
      name: normalized.name,
      external_id: normalized.external_id,
      status: normalized.status,
      protocol: normalized.protocol,
      port: Number(normalized.port ?? 0),
      transport: normalized.transport,
      messages_per_second: Number(normalized.messages_per_second ?? 0),
      messages_per_second_high: Number(normalized.messages_per_second_high ?? 0),
      messages_per_second_medium: Number(normalized.messages_per_second_medium ?? 0),
      messages_per_second_low: Number(normalized.messages_per_second_low ?? 0),
      transaction_timeout: Number(normalized.transaction_timeout ?? 0),
      retransmission_base_interval_ms: Number(normalized.retransmission_base_interval_ms ?? 0),
      retransmission_max_interval_ms: Number(normalized.retransmission_max_interval_ms ?? 0),
      network_timeout_ms: Number(normalized.network_timeout_ms ?? 0),
      thread_pool_size: Number(normalized.thread_pool_size ?? 0),
      retransmission_filter: normalized.retransmission_filter,
      max_message_size: Number(normalized.max_message_size ?? 0),
      split_message: normalized.split_message,
      receive_udp_buffer_size: Number(normalized.receive_udp_buffer_size ?? 0),
      send_udp_buffer_size: Number(normalized.send_udp_buffer_size ?? 0),
      aggressive_cleanup: normalized.aggressive_cleanup,
      routing_enable_ss7: routing.ss7,
      routing_enable_diameter: routing.diameter,
      routing_registration_traffic_ss7_gateway_id:
        routing.ss7 ? normalized.routing_registration_traffic_ss7_gateway_id : null,
      routing_registration_traffic_diameter_gateway_id:
        routing.diameter ? normalized.routing_registration_traffic_diameter_gateway_id : null,
      routing_ussi_traffic_ss7_gateway_id:
        routing.ss7 ? normalized.routing_ussi_traffic_ss7_gateway_id : null,
      auto_retry_error_code: normalized.auto_retry_error_code,
      no_retry_error_code: normalized.no_retry_error_code,
      retry_alternate_destination_error_code: normalized.retry_alternate_destination_error_code,
      enabled: Number(normalized.enabled ?? 0),
      register_max_expires: normalized.register_max_expires,
      ipsmgw_user: normalized.ipsmgw_user,
      ipsmgw_domain: normalized.ipsmgw_domain,
      ims_domain: normalized.ims_domain,
      ims_ccf: normalized.ims_ccf,
      ims_ecf: normalized.ims_ecf,
      subscribe_target_host: normalized.subscribe_target_host,
      subscribe_target_port: normalized.subscribe_target_port,
      subscribe_target_transport: normalized.subscribe_target_transport,
      local_via_host: normalized.local_via_host,
      global_title: normalized.global_title,
      mno_id: normalized.mno_id,
      ussi_default_datacoding_id: normalized.ussi_default_datacoding_id,
    };
  }

  get sipBasePath(): string[] {
    return this.isIpSmGw ? ['/pages/ip-sm-gw/sip-gateways'] : ['/pages/sip-gateways'];
  }
}
