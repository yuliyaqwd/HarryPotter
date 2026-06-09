import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HarryPotterService } from '../../services/harry-potter.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit {
  books: any[] = [];

  constructor(private harryPotterService: HarryPotterService) {}

  ngOnInit() {
    this.harryPotterService.getBooks().subscribe(data => {
      this.books = data;
    });
  }
}