import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, TuiTable],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss'
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  columns = ['fullName', 'birthdate', 'hogwartsHouse', 'nickname'];

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    this.harryPotterService.getCharacters().subscribe(data => {
      this.characters = data;
    });
  }
}