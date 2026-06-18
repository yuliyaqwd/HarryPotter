import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { Book, Character, House, Spell } from '../models';

@Injectable({ providedIn: 'root' })
export class HarryPotterService {
  private http = inject(HttpClient);
  private transloco = inject(TranslocoService);

  private get baseUrl(): string {
    return `https://potterapi-fedeperin.vercel.app/${this.transloco.getActiveLang()}`;
  }

  private buildParams(page: number, max: number, search: string): HttpParams {
    let params = new HttpParams().appendAll({ page, max });
    const trimmed = search.trim();
    if (trimmed) {
      params = params.append('search', trimmed);
    }
    return params;
  }

  getBooks(page = 1, max = 10, search = ''): Observable<Book[]> {
    const params = this.buildParams(page, max, search);
    return this.http.get<Book[]>(`${this.baseUrl}/books`, { params });
  }

  getAllBooks(search = ''): Observable<Book[]> {
    const params = this.buildParams(1, 1000, search);
    return this.http.get<Book[]>(`${this.baseUrl}/books`, { params });
  }

  getHouses(): Observable<House[]> {
    return this.http.get<House[]>(`${this.baseUrl}/houses`);
  }

  getCharacters(page = 1, max = 10, search = ''): Observable<Character[]> {
    const params = this.buildParams(page, max, search);
    return this.http.get<Character[]>(`${this.baseUrl}/characters`, { params });
  }

  getAllCharacters(search = ''): Observable<Character[]> {
    const params = this.buildParams(1, 1000, search);
    return this.http.get<Character[]>(`${this.baseUrl}/characters`, { params });
  }

  getSpells(): Observable<Spell[]> {
    return this.http.get<Spell[]>(`${this.baseUrl}/spells`);
  }
}
