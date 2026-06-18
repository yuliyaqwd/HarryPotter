import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiRadio } from '@taiga-ui/core/components/radio';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, TuiRadio, TranslocoPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private transloco = inject(TranslocoService);
  currentLang = this.transloco.getActiveLang();

  onLangChange(lang: string) {
    this.transloco.setActiveLang(lang);
  }
}
