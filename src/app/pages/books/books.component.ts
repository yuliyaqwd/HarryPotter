import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiTable, TuiTableSortBy, TuiTableSortable } from '@taiga-ui/addon-table/components/table';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiTable, TuiTableSortBy, TuiTableSortable],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  filteredBooks: any[] = [];
  search = '';
  columns = ['title', 'releaseDate', 'pages', 'description'];
  currentSorter: string | null = null;
  currentDirection: 1 | -1 = 1;

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    this.harryPotterService.getBooks().subscribe(data => {
      this.books = data;
      this.filteredBooks = data;
    });
  }

  onSorterChange(sorter: any) {
  console.log('sorter:', sorter);
  this.currentSorter = sorter;
  this.applySort();
}

onDirectionChange(direction: 1 | -1) {
  console.log('direction:', direction);
  this.currentDirection = direction;
  this.applySort();
}

  applySort() {
    if (!this.currentSorter) return;
    const sortBy = this.currentSorter;
    this.filteredBooks = [...this.filteredBooks].sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (sortBy === 'pages') return (valA - valB) * this.currentDirection;
      if (sortBy === 'releaseDate') return (new Date(valA).getTime() - new Date(valB).getTime()) * this.currentDirection;
      return valA > valB ? this.currentDirection : -this.currentDirection;
    });
  }

  onSearch() {
    this.filteredBooks = this.books.filter(book =>
      book.title.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}