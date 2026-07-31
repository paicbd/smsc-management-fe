import { FormSectionConfig } from "@app/core/forms/form-section.model";

export const SIP_GATEWAY_PERFORMANCE_SECTION: FormSectionConfig = {
  title: 'Performance & Limits',
  columns: [
    [
      {
        type: 'number',
        controlName: 'thread_pool_size',
        label: 'Thread Pool Size',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'max_message_size',
        label: 'Max Message Size (bytes)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'checkbox',
        controlName: 'retransmission_filter',
        label: 'Retransmission Filter',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'register_max_expires',
        label: 'SIP Register Max Expires (sec)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'number',
        controlName: 'messages_per_second_high',
        label: 'Messages Per Second - High Priority',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        groupErrorKey: 'atLeastOnePriorityActive',
        groupErrorFields: ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'],
      },
      {
        type: 'number',
        controlName: 'messages_per_second_medium',
        label: 'Messages Per Second - Medium Priority',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        groupErrorKey: 'atLeastOnePriorityActive',
        groupErrorFields: ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'],
        groupErrorMessage: 'At least one priority must be active.',
      },
    ],
    [
      {
        type: 'number',
        controlName: 'messages_per_second_low',
        label: 'Messages Per Second - Low Priority',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        groupErrorKey: 'atLeastOnePriorityActive',
        groupErrorFields: ['messages_per_second_high', 'messages_per_second_medium', 'messages_per_second_low'],
      },
      {
        type: 'number',
        controlName: 'messages_per_second',
        label: 'Messages Per Second (Total)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
        readonly: true,
      },
    ],
    [
      {
        type: 'number',
        controlName: 'receive_udp_buffer_size',
        label: 'Receive UDP Buffer Size (bytes)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
      {
        type: 'number',
        controlName: 'send_udp_buffer_size',
        label: 'Send UDP Buffer Size (bytes)',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
    [
      {
        type: 'checkbox',
        controlName: 'aggressive_cleanup',
        label: 'Aggressive Cleanup',
        labelCol: 'col-sm-6',
        inputCol: 'col-sm-6',
      },
    ],
  ],
};
