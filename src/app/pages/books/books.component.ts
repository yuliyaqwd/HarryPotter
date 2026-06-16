import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import {
  TuiTablePagination,
  TuiTablePaginationEvent,
} from '@taiga-ui/addon-table/components/table-pagination';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { HarryPotterService } from '../../services/harry-potter.service';
import { TranslationService } from '../../services/translation.service';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { Book } from '../../models';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [FormsModule, TuiTable, TuiTablePagination, TranslatePipe],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss',
})
export class BooksComponent implements OnInit, OnDestroy {
  private harryPotterService = inject(HarryPotterService);
  private translation = inject(TranslationService);
  private langSub!: Subscription;

  columns = ['title', 'releaseDate', 'pages', 'description'];
  allBooks: Book[] = [];
  displayedBooks: Book[] = [];
  page = 0;
  pageSize = 5;
  pageSizes = [5, 10, 20];
  totalItems = 0;
  search = '';

  ngOnInit() {
    this.loadAll();
    this.langSub = this.translation.currentLang$.pipe(skip(1)).subscribe(() => {
      this.page = 0;
      this.search = '';
      this.loadAll();
    });
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  private loadAll() {
    this.harryPotterService.getAllBooks().subscribe((data) => {
      this.allBooks = data;
      this.totalItems = data.length;
      this.loadPage();
    });
  }

  loadPage() {
    if (this.search.trim()) {
      const filtered = this.allBooks.filter((b) =>
        b.title.toLowerCase().includes(this.search.toLowerCase()),
      );
      this.totalItems = filtered.length;
      const start = this.page * this.pageSize;
      this.displayedBooks = filtered.slice(start, start + this.pageSize);
    } else {
      this.totalItems = this.allBooks.length;
      this.harryPotterService
        .getBooks(this.page + 1, this.pageSize)
        .subscribe((data) => {
          this.displayedBooks = data;
        });
    }
  }

  onPaginationChange({ page, size }: TuiTablePaginationEvent) {
    this.page = page;
    this.pageSize = size;
    this.loadPage();
  }

  onSearch() {
    this.page = 0;
    this.loadPage();
  }

  onSortChange(event: { sortKey: string | null; sortDirection: 1 | -1 }) {
    if (!event.sortKey) { this.loadPage(); return; }
    const key = event.sortKey as keyof Book;
    const dir = event.sortDirection;
    this.displayedBooks = [...this.displayedBooks].sort((a, b) =>
      String(a[key] ?? '').localeCompare(String(b[key] ?? '')) * dir,
    );
  }
}
