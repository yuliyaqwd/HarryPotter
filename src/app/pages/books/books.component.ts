import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiTable],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss',
})
export class BooksComponent implements OnInit {
  columns = ['title', 'releaseDate', 'pages', 'description'];

  // All data (loaded once for search + total count)
  allBooks: any[] = [];

  // Currently displayed page
  displayedBooks: any[] = [];

  // Pagination
  page = 0; // 0-based (TuiPagination uses 0-based index)
  pageSize = 5;
  pageSizes = [5, 10, 20];
  totalItems = 0;

  // Search
  search = '';

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    // Load all data once to know total count and enable search
    this.harryPotterService.getAllBooks().subscribe((data) => {
      this.allBooks = data;
      this.totalItems = data.length;
      this.loadPage();
    });
  }

  loadPage() {
    if (this.search.trim()) {
      // Client-side filtering + pagination slice
      const filtered = this.allBooks.filter((b) =>
        b.title.toLowerCase().includes(this.search.toLowerCase()),
      );
      this.totalItems = filtered.length;
      const start = this.page * this.pageSize;
      this.displayedBooks = filtered.slice(start, start + this.pageSize);
    } else {
      // Server-side pagination
      this.totalItems = this.allBooks.length;
      this.harryPotterService
        .getBooks(this.page + 1, this.pageSize)
        .subscribe((data) => {
          this.displayedBooks = data;
        });
    }
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadPage();
  }

  onPageSizeChange(size: number) {
    this.pageSize = Number(size);
    this.page = 0;
    this.loadPage();
  }

  onSearch() {
    this.page = 0;
    this.loadPage();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
