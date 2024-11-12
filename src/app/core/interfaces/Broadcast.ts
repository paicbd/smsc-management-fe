export interface Broadcast {
    broadcast_id: number;
    name: string;
    total_message: number;
    network_id: number;
    description: string;
    file_id: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Statistic {
    total_message: number;
    pending: number;
    enqueue: number;
    sent: number;
    failed: number;
}
