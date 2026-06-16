import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TuiCardLarge } from '@taiga-ui/layout/components/card';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HarryPotterService } from '../../services/harry-potter.service';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { House } from '../../models';

@Component({
  selector: 'app-houses',
  standalone: true,
  imports: [TuiCardLarge, TranslocoPipe],
  templateUrl: './houses.component.html',
  styleUrl: './houses.component.scss',
})
export class HousesComponent implements OnInit, OnDestroy {
  private harryPotterService = inject(HarryPotterService);
  private transloco = inject(TranslocoService);
  private langSub!: Subscription;

  houses: House[] = [];

  ngOnInit() {
    this.loadAll();
    this.langSub = this.transloco.langChanges$.pipe(skip(1)).subscribe(() => {
      this.loadAll();
    });
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  private loadAll() {
    this.harryPotterService.getHouses().subscribe((data) => {
      this.houses = data;
    });
  }

  getNameColor(colors: string[]): string {
    const lightColors = ['yellow', 'gold', 'white', 'silver'];
    return lightColors.includes(colors[0]) ? colors[1] : colors[0];
  }
}
