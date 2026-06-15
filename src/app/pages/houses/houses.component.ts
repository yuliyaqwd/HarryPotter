import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout/components/card';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { HarryPotterService } from '../../services/harry-potter.service';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { House } from '../../models';

@Component({
  selector: 'app-houses',
  standalone: true,
  imports: [CommonModule, TuiCardLarge, TranslatePipe],
  templateUrl: './houses.component.html',
  styleUrl: './houses.component.scss'
})
export class HousesComponent implements OnInit, OnDestroy {
  houses: House[] = [];
  private langSub!: Subscription;

  constructor(
    private harryPotterService: HarryPotterService,
    private translation: TranslationService,
  ) {}

  ngOnInit() {
    this.loadAll();
    this.langSub = this.translation.currentLang$.pipe(skip(1)).subscribe(() => {
      this.loadAll();
    });
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  private loadAll() {
    this.harryPotterService.getHouses().subscribe(data => {
      this.houses = data;
    });
  }

  getNameColor(colors: string[]): string {
    const lightColors = ['yellow', 'gold', 'white', 'silver'];
    return lightColors.includes(colors[0]) ? colors[1] : colors[0];
  }
}
