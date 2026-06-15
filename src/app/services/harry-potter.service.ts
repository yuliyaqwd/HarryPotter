import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from './translation.service';
import { Book, Character, House, Spell } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HarryPotterService {
  private get baseUrl(): string {
    return `https://potterapi-fedeperin.vercel.app/${this.translation.currentLang}`;
  }

  constructor(
    private http: HttpClient,
    private translation: TranslationService,
  ) {}

  getBooks(page: number = 1, max: number = 10) {
    return this.http.get<Book[]>(`${this.baseUrl}/books?max=${max}&page=${page}`);
  }

  getAllBooks() {
    return this.http.get<Book[]>(`${this.baseUrl}/books?max=1000&page=1`);
  }

  getHouses() {
    return this.http.get<House[]>(`${this.baseUrl}/houses`);
  }

  getCharacters(page: number = 1, max: number = 10) {
    return this.http.get<Character[]>(`${this.baseUrl}/characters?max=${max}&page=${page}`);
  }

  getAllCharacters() {
    return this.http.get<Character[]>(`${this.baseUrl}/characters?max=1000&page=1`);
  }

  getSpells() {
    return this.http.get<Spell[]>(`${this.baseUrl}/spells`);
  }
}
