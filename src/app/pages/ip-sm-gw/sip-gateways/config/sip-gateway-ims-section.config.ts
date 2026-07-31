import { FormSectionConfig } from "@app/core/forms/form-section.model";

export const SIP_GATEWAY_IMS_SECTION: FormSectionConfig = {
  title: 'IMS Settings',
  columns: [
    [
      {
        type: 'text',
        controlName: 'ims_domain',
        label: 'IMS Domain',
      },
      {
        type: 'text',
        controlName: 'ims_ccf',
        label: 'IMS CCF',
      },
    ],
    [
      {
        type: 'text',
        controlName: 'ims_ecf',
        label: 'IMS ECF',
      },
    ],
  ],
};