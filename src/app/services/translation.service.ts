import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const translations: Record<string, Record<string, any>> = {
  en: {
    nav: { books: 'Books', houses: 'Houses', characters: 'Characters' },
    pagination: { pages: 'Pages', rowsPerPage: 'rows per page', of: 'of' },
    books: {
      searchPlaceholder: 'Search by title…',
      col: { title: 'Title', releaseDate: 'Release date', pages: 'Pages', description: 'Description' },
    },
    characters: {
      searchPlaceholder: 'Search by name…',
      col: { fullName: 'Full name', birthdate: 'Birthdate', house: 'House', actor: 'Actor' },
      dialog: {
        nickname: 'Nickname', house: 'House', interpretedBy: 'Interpreted by',
        birthdate: 'Birth date', children: 'Children', spells: 'Spells',
        selectSpells: 'Select spells…',
      },
      validation: {
        required: 'Birth date is required', invalid: 'Invalid date',
        future: 'Date cannot be in the future', minYear: 'Year cannot be before 1800',
      },
    },
    houses: { founder: 'Founder', colors: 'colors' },
  },
  it: {
    nav: { books: 'Libri', houses: 'Case', characters: 'Personaggi' },
    pagination: { pages: 'Pagine', rowsPerPage: 'righe per pagina', of: 'di' },
    books: {
      searchPlaceholder: 'Cerca per titolo…',
      col: { title: 'Titolo', releaseDate: 'Data di uscita', pages: 'Pagine', description: 'Descrizione' },
    },
    characters: {
      searchPlaceholder: 'Cerca per nome…',
      col: { fullName: 'Nome completo', birthdate: 'Data di nascita', house: 'Casa', actor: 'Attore' },
      dialog: {
        nickname: 'Soprannome', house: 'Casa', interpretedBy: 'Interpretato da',
        birthdate: 'Data di nascita', children: 'Figli', spells: 'Incantesimi',
        selectSpells: 'Seleziona incantesimi…',
      },
      validation: {
        required: 'La data di nascita è obbligatoria', invalid: 'Data non valida',
        future: 'La data non può essere nel futuro', minYear: "L'anno non può essere prima del 1800",
      },
    },
    houses: { founder: 'Fondatore', colors: 'colori' },
  },
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private lang$ = new BehaviorSubject<string>('en');
  readonly currentLang$ = this.lang$.asObservable();

  get currentLang(): string {
    return this.lang$.value;
  }

  use(lang: string) {
    this.lang$.next(lang);
  }

  translate(key: string): string {
    const parts = key.split('.');
    let node: any = translations[this.lang$.value];
    for (const part of parts) {
      node = node?.[part];
    }
    return typeof node === 'string' ? node : key;
  }

  instant(key: string): string {
    return this.translate(key);
  }
}
