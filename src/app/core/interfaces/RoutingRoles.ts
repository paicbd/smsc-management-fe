export interface Destination {
    id: number;
    priority: number;
    network_id: number;
    routing_rules_id: number;
    name: string;
    action: number;
}

export interface RoutingRules {
    id: number;
    origin_network_id: number;
    origin_name: string;
    regex_source_addr: string;
    regex_source_addr_ton: string;
    regex_source_addr_npi: string;
    regex_destination_addr: string;
    regex_dest_addr_ton: string;
    regex_dest_addr_npi: string;
    regex_imsi_digits_mask: string;
    regex_network_node_number: string;
    regex_calling_party_address: string;
    destination: Destination[];
    new_source_addr: string;
    new_source_addr_ton: number;
    new_source_addr_npi: number;
    new_destination_addr: string;
    new_dest_addr_ton: number;
    new_dest_addr_npi: number;
    add_source_addr_prefix: string;
    add_dest_addr_prefix: string;
    remove_source_addr_prefix: string;
    remove_dest_addr_prefix: string;
    new_gt_sccp_addr_mt: string;
    drop_map_sri: boolean;
    network_id_to_map_sri?: number;
    network_id_to_permanent_failure?: number;
    drop_temp_failure: boolean;
    network_id_temp_failure?: number;
    is_sri_response?: boolean;
}

export interface Network {
    network_id: number;
    name: string;
    network_type: string;
    action: number; 
    protocol: string;
    type?: string;
}