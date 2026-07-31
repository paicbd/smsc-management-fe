import { FormSectionConfig } from "@app/core/forms/form-section.model";

export const SIP_GATEWAY_SUBSCRIBE_SECTION: FormSectionConfig = {
  title: 'SIP Subscribe',
  columns: [
    [
      {
        type: 'text',
        controlName: 'subscribe_target_host',
        label: 'Subscribe Target Host',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'subscribe_target_port',
        label: 'Subscribe Target Port',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'select',
        controlName: 'subscribe_target_transport',
        label: 'Subscribe Target Transport',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        options: [
          { label: 'None', value: null },
          { label: 'UDP', value: 'UDP' },
          { label: 'TCP', value: 'TCP' },
          { label: 'TLS', value: 'TLS' },
        ],
      },
      {
        type: 'text',
        controlName: 'local_via_host',
        label: 'Local Via Host',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
  ],
};