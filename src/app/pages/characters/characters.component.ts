import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import { TuiHint } from '@taiga-ui/core/directives/hint';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, TuiTable, TuiHint],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss'
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  houses: any[] = [];
  columns = ['fullName', 'birthdate', 'hogwartsHouse', 'nickname'];

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    this.harryPotterService.getCharacters().subscribe(data => {
      this.characters = data;
    });
    this.harryPotterService.getHouses().subscribe(data => {
      this.houses = data;
    });
  }

  getHouse(houseName: string) {
    return this.houses.find(h => h.house === houseName);
  }

  getNameColor(colors: string[]): string {
    const lightColors = ['yellow', 'gold', 'white', 'silver'];
    return lightColors.includes(colors[0]) ? colors[1] : colors[0];
  }
}