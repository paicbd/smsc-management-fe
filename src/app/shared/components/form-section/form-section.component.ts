import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormFieldConfig, FormSectionConfig } from '../../../core/forms/form-section.model';


@Component({
  selector: 'app-form-section',
  templateUrl: './form-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionComponent {
  @Input() form!: FormGroup;
  @Input() config!: FormSectionConfig;

  isVisible(field: FormFieldConfig): boolean {
    return !field.hidden;
  }

  isInputField(field: FormFieldConfig): boolean {
    return field.type === 'text' || field.type === 'number';
  }

  isSelectField(field: FormFieldConfig): boolean {
    return field.type === 'select';
  }

  isCheckboxField(field: FormFieldConfig): boolean {
    return field.type === 'checkbox';
  }
  
  getInputType(field: FormFieldConfig): 'text' | 'number' {
    return field.type === 'number' ? 'number' : 'text';
  }
  
}