import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HarryPotterService {
  private baseUrl = 'https://potterapi-fedeperin.vercel.app/en';

  constructor(private http: HttpClient) {}

  getBooks(page: number = 1, max: number = 10) {
    return this.http.get<any[]>(`${this.baseUrl}/books?max=${max}&page=${page}`);
  }

  getAllBooks() {
    return this.http.get<any[]>(`${this.baseUrl}/books?max=1000&page=1`);
  }

  getHouses() {
    return this.http.get<any[]>(`${this.baseUrl}/houses`);
  }

  getCharacters(page: number = 1, max: number = 10) {
    return this.http.get<any[]>(`${this.baseUrl}/characters?max=${max}&page=${page}`);
  }

  getAllCharacters() {
    return this.http.get<any[]>(`${this.baseUrl}/characters?max=1000&page=1`);
  }

  getSpells() {
    return this.http.get<any[]>(`${this.baseUrl}/spells`);
  }
}
