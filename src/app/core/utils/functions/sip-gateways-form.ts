import { SipGatewaysFormValue } from "@app/pages/ip-sm-gw/sip-gateways/add/add-sip-gateways.component";

type PartialSip = Partial<SipGatewaysFormValue>;

export function buildSipResetValue(
  defaults: any,
  patch?: PartialSip 
): SipGatewaysFormValue {

  return {
    network_id: patch?.network_id ?? 0,

    sip_ip: patch?.sip_ip ?? '',
    sip_name: patch?.sip_name ?? '',
    external_id: patch?.external_id ?? null,

    status: patch?.status ?? '',
    protocol: patch?.protocol ?? '',

    sip_port: patch?.sip_port ?? null,
    sip_transport: patch?.sip_transport ?? defaults.sip_transport,

    transaction_timeout: patch?.transaction_timeout ?? defaults.transaction_timeout,
    retransmission_base_interval_ms: patch?.retransmission_base_interval_ms ?? defaults.retransmission_base_interval_ms,
    retransmission_max_interval_ms: patch?.retransmission_max_interval_ms ?? defaults.retransmission_max_interval_ms,
    network_timeout_ms: patch?.network_timeout_ms ?? defaults.network_timeout_ms,

    thread_pool_size: patch?.thread_pool_size ?? defaults.thread_pool_size,
    retransmission_filter: patch?.retransmission_filter ?? defaults.retransmission_filter,
    max_message_size: patch?.max_message_size ?? defaults.max_message_size,

    receive_udp_buffer_size: patch?.receive_udp_buffer_size ?? defaults.receive_udp_buffer_size,
    send_udp_buffer_size: patch?.send_udp_buffer_size ?? defaults.send_udp_buffer_size,
    aggressive_cleanup: patch?.aggressive_cleanup ?? defaults.aggressive_cleanup,

    routing_enable_ss7: patch?.routing_enable_ss7 ?? defaults.routing_enable_ss7,
    routing_enable_diameter: patch?.routing_enable_diameter ?? defaults.routing_enable_diameter,

    routing_registration_traffic_ss7_gateway_id: patch?.routing_registration_traffic_ss7_gateway_id ?? null,
    routing_registration_traffic_diameter_gateway_id: patch?.routing_registration_traffic_diameter_gateway_id ?? null,
    routing_ussi_traffic_ss7_gateway_id: patch?.routing_ussi_traffic_ss7_gateway_id ?? null,

    enabled: patch?.enabled ?? defaults.enabled,

    sip_register_max_expires: patch?.sip_register_max_expires ?? defaults.sip_register_max_expires,

    sip_ipsmgw_user: patch?.sip_ipsmgw_user ?? null,
    sip_ipsmgw_domain: patch?.sip_ipsmgw_domain ?? null,

    sip_ims_domain: patch?.sip_ims_domain ?? null,
    sip_ims_ccf: patch?.sip_ims_ccf ?? null,
    sip_ims_ecf: patch?.sip_ims_ecf ?? null,

    sip_subscribe_target_host: patch?.sip_subscribe_target_host ?? '',
    sip_subscribe_target_port: patch?.sip_subscribe_target_port ?? null,
    sip_subscribe_target_transport: patch?.sip_subscribe_target_transport ?? defaults.sip_subscribe_target_transport,

    sip_global_title:patch?.sip_global_title ?? null, 
    sip_local_via_host: patch?.sip_local_via_host ?? null,
  };
}