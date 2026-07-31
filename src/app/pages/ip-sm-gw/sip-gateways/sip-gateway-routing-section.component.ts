import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormFieldOption } from '@app/core/forms/form-section.model';

export interface RoutingGatewayOption {
  network_id?: number;
  id?: number;
  name: string;
}

@Component({
  selector: 'app-sip-gateway-routing-section',
  templateUrl: './sip-gateway-routing-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SipGatewayRoutingSectionComponent {
  @Input() form!: FormGroup;
  @Input() ss7Gateways: RoutingGatewayOption[] = [];
  @Input() ss7AllowedUssi: RoutingGatewayOption[] = [];
  @Input() diameterGateways: RoutingGatewayOption[] = [];

  get ss7Enabled(): boolean {
    return !!this.form.get('routing_enable_ss7')?.value;
  }

  get diameterEnabled(): boolean {
    return !!this.form.get('routing_enable_diameter')?.value;
  }

  get ss7RegistrationOptions(): FormFieldOption[] {
    return [
      { label: 'None', value: null },
      ...this.ss7Gateways.map((gateway) => ({
        label: `${gateway.name} (${gateway.network_id})`,
        value: gateway.network_id ?? null,
      })),
    ];
  }

  get ss7UssiOptions(): FormFieldOption[] {
    return [
      { label: 'None', value: null },
      ...this.ss7AllowedUssi.map((gateway) => ({
        label: `${gateway.name} (${gateway.network_id})`,
        value: gateway.network_id ?? null,
      })),
    ];
  }

  get diameterRegistrationOptions(): FormFieldOption[] {
    return [
      { label: 'None', value: null },
      ...this.diameterGateways.map((gateway) => ({
        label: `${gateway.name} (${gateway.network_id})`,
        value: gateway.network_id ?? null,
      })),
    ];
  }
}