import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HarryPotterService {
  private baseUrl = 'https://potterapi-fedeperin.vercel.app/en';

  constructor(private http: HttpClient) {}

  getBooks() {
    return this.http.get<any[]>(`${this.baseUrl}/books`);
  }

  getHouses() {
    return this.http.get<any[]>(`${this.baseUrl}/houses`);
  }

  getCharacters() {
    return this.http.get<any[]>(`${this.baseUrl}/characters`);
  }

  getSpells() {
    return this.http.get<any[]>(`${this.baseUrl}/spells`);
  }
}