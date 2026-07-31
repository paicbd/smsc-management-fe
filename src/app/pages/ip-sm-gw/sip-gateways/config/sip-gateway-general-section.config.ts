import { FormFieldOption, FormSectionConfig } from "@app/core/forms/form-section.model";


export function buildSipGatewayGeneralSection(isEdit: boolean, mnoOptions: FormFieldOption[], encodingOptions: FormFieldOption[]): 
FormSectionConfig {
  return {
    title: 'General',
    topMargin: false,
    columns: [
      [
        {
          type: 'number',
          controlName: 'network_id',
          label: 'Network Id',
          readonly: true,
          hidden: !isEdit,
        },
        {
          type: 'text',
          controlName: 'name',
          label: 'SIP Name',
        },
                {
          type: 'select',
          controlName: 'mno_id',
          label: 'MNO',
          options: mnoOptions,
        },
        {
          type: 'text',
          controlName: 'ip_address',
          label: 'SIP IP',
        },
      ],
      [
        {
          type: 'number',
          controlName: 'port',
          label: 'SIP Port',
        },
        {
          type: 'select',
          controlName: 'transport',
          label: 'Transport',
          options: [
            { label: 'UDP', value: 'UDP' },
            { label: 'TCP', value: 'TCP' },
            { label: 'TLS', value: 'TLS' },
          ],
        },
        {
          type: 'checkbox',
          controlName: 'split_message',
          label: 'Split Message',
        },
        {
          type: 'number',
          controlName: 'global_title',
          label: 'Global Title',
        },
        {
          type: 'select',
          controlName: 'ussi_default_datacoding_id',
          label: 'USSI Default Datacoding',
          options: encodingOptions,
        }
      ],
    ],
  };
}