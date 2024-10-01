import { AbstractControl } from '@angular/forms';

export function minArrayLength(min: number) {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value.length >= min) {
      return null;
    }
    return { 'minArrayLength': { valid: false } };
  };
}
