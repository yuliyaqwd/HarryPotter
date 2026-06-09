import { Routes } from '@angular/router';
import { BooksComponent } from './pages/books/books.component';
import { HousesComponent } from './pages/houses/houses.component';
import { CharactersComponent } from './pages/characters/characters.component';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', component: BooksComponent },
  { path: 'houses', component: HousesComponent },
  { path: 'characters', component: CharactersComponent },
];