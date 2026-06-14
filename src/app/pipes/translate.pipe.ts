import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({ name: 'translate', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform {
  constructor(private t: TranslationService) {}

  transform(key: string): string {
    return this.t.translate(key);
  }
}
