import { FormSectionConfig } from "@app/core/forms/form-section.model";


export const SIP_GATEWAY_TIMERS_SECTION: FormSectionConfig = {
  title: 'Timers & Retransmission',
  columns: [
    [
      {
        type: 'number',
        controlName: 'transaction_timeout',
        label: 'Transaction Timeout (ms)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'retransmission_base_interval_ms',
        label: 'Retransmission Base Interval (ms)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'number',
        controlName: 'retransmission_max_interval_ms',
        label: 'Retransmission Max Interval (ms)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'network_timeout_ms',
        label: 'Network Timeout (ms)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
  ],
};