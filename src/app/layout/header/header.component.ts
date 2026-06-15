import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiRadio } from '@taiga-ui/kit/components/radio';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, TuiRadio, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  currentLang: string;

  constructor(private translation: TranslationService) {
    this.currentLang = translation.currentLang;
  }

  onLangChange(lang: string) {
    this.translation.use(lang);
  }
}
