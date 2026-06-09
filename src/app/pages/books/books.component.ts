import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, TuiTable],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  columns = ['title', 'releaseDate', 'pages', 'description'];

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    this.harryPotterService.getBooks().subscribe(data => {
      this.books = data;
    });
  }
}