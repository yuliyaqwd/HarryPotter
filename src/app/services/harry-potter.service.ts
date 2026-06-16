import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { Book, Character, House, Spell } from '../models';

@Injectable({ providedIn: 'root' })
export class HarryPotterService {
  private http = inject(HttpClient);
  private transloco = inject(TranslocoService);

  private get baseUrl(): string {
    return `https://potterapi-fedeperin.vercel.app/${this.transloco.getActiveLang()}`;
  }

  private searchParam(search: string): string {
    const trimmed = search.trim();
    return trimmed ? `&search=${encodeURIComponent(trimmed)}` : '';
  }

  getBooks(page = 1, max = 10, search = '') {
    return this.http.get<Book[]>(
      `${this.baseUrl}/books?max=${max}&page=${page}${this.searchParam(search)}`,
    );
  }

  getAllBooks(search = '') {
    return this.http.get<Book[]>(
      `${this.baseUrl}/books?max=1000&page=1${this.searchParam(search)}`,
    );
  }

  getHouses() {
    return this.http.get<House[]>(`${this.baseUrl}/houses`);
  }

  getCharacters(page = 1, max = 10, search = '') {
    return this.http.get<Character[]>(
      `${this.baseUrl}/characters?max=${max}&page=${page}${this.searchParam(search)}`,
    );
  }

  getAllCharacters(search = '') {
    return this.http.get<Character[]>(
      `${this.baseUrl}/characters?max=1000&page=1${this.searchParam(search)}`,
    );
  }

  getSpells() {
    return this.http.get<Spell[]>(`${this.baseUrl}/spells`);
  }
}
