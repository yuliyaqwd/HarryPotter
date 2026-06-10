import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiCardLarge } from '@taiga-ui/layout/components/card';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-houses',
  standalone: true,
  imports: [CommonModule, TuiCardLarge],
  templateUrl: './houses.component.html',
  styleUrl: './houses.component.scss'
})
export class HousesComponent implements OnInit {
  houses: any[] = [];

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    this.harryPotterService.getHouses().subscribe(data => {
      this.houses = data;
    });
  }
}