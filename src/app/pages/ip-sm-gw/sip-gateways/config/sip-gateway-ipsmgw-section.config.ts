import { FormSectionConfig } from "@app/core/forms/form-section.model";


export const SIP_GATEWAY_IPSMGW_SECTION: FormSectionConfig = {
  title: 'IP-SM-GW Settings',
  columns: [
    [
      {
        type: 'text',
        controlName: 'ipsmgw_user',
        label: 'IPSMGW User',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'text',
        controlName: 'ipsmgw_domain',
        label: 'IPSMGW Domain',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
  ],
};