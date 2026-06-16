import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import {
  TuiTablePagination,
  TuiTablePaginationEvent,
} from '@taiga-ui/addon-table/components/table-pagination';
import { TuiHint } from '@taiga-ui/core/directives/hint';
import { TuiDialog } from '@taiga-ui/core/components/dialog';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiIcon } from '@taiga-ui/core/components/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HarryPotterService } from '../../services/harry-potter.service';
import { Character, House, Spell } from '../../models';
import { DateTime } from 'luxon';

function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return new Date(control.value) > new Date() ? { futureDate: true } : null;
}

function minYear1800Validator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return new Date(control.value).getFullYear() < 1800 ? { minYear: true } : null;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiTable,
    TuiTablePagination,
    TuiHint,
    TuiDialog,
    TuiButton,
    TuiIcon,
    TranslocoPipe,
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit, OnDestroy {
  private harryPotterService = inject(HarryPotterService);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private document = inject(DOCUMENT);
  private langSub!: Subscription;

  characters: Character[] = [];
  houses: House[] = [];
  spellList: Spell[] = [];
  columns = ['fullName', 'birthdate', 'hogwartsHouse', 'interpretedBy'];

  page = 0;
  pageSize = 5;
  pageSizes = [5, 10, 20];
  totalItems = 0;
  search = '';

  selectedCharacter: Character | null = null;
  isDialogOpen = false;
  dialogMode: 'view' | 'edit' = 'view';
  dialogOptions = { label: '', size: 's' as const, closeable: false };
  spellsDropdownOpen = false;

  editForm: FormGroup = this.fb.group({
    interpretedBy: [''],
    birthdate: ['', [Validators.required, notFutureDateValidator, minYear1800Validator]],
    children: [''],
    spells: [[] as string[]],
  });

  private readonly EDITS_STORAGE_KEY = 'hp-character-edits';
  private localEdits = this.loadEditsFromStorage();

  ngOnInit() {
    this.loadAll();
    this.langSub = this.transloco.langChanges$.pipe(skip(1)).subscribe(() => {
      this.page = 0;
      this.search = '';
      this.isDialogOpen = false;
      this.loadAll();
    });
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  private loadAll() {
    this.loadTotal();
    this.loadPage();
    this.harryPotterService.getHouses().subscribe((data) => {
      this.houses = data;
    });
    this.harryPotterService.getSpells().subscribe((data) => {
      this.spellList = data;
    });
  }

  private loadTotal() {
    this.harryPotterService.getAllCharacters(this.search).subscribe((data) => {
      this.totalItems = data.length;
    });
  }

  get spells(): string[] {
    return this.spellList.map((s) => s.spell);
  }

  loadPage() {
    this.harryPotterService
      .getCharacters(this.page + 1, this.pageSize, this.search)
      .subscribe((data) => {
        this.characters = data.map((c) => this.getCharacterData(c));
      });
  }

  onPaginationChange({ page, size }: TuiTablePaginationEvent) {
    this.page = page;
    this.pageSize = size;
    this.loadPage();
  }

  onSearch() {
    this.page = 0;
    this.loadTotal();
    this.loadPage();
  }

  onSortChange(event: { sortKey: string | null; sortDirection: 1 | -1 }) {
    if (!event.sortKey) { this.loadPage(); return; }
    const key = event.sortKey as keyof Character;
    const dir = event.sortDirection;
    this.characters = [...this.characters].sort((a, b) => {
      if (key === 'birthdate') {
        const aMs = DateTime.fromFormat(a.birthdate ?? '', 'MMM d, yyyy').toMillis() || 0;
        const bMs = DateTime.fromFormat(b.birthdate ?? '', 'MMM d, yyyy').toMillis() || 0;
        return (aMs - bMs) * dir;
      }
      return String(a[key] ?? '').localeCompare(String(b[key] ?? '')) * dir;
    });
  }

  // ─── House helpers ──────────────────────────────────────────

  getHouse(houseName: string): House | undefined {
    return this.houses.find((h) => h.house === houseName);
  }

  getNameColor(colors: string[]): string {
    const lightColors = ['yellow', 'gold', 'white', 'silver'];
    return lightColors.includes(colors[0]) ? colors[1] : colors[0];
  }

  // ─── Edit helpers ───────────────────────────────────────────

  getCharacterData(character: Character): Character {
    const edits = this.localEdits.get(character.index);
    return edits ? { ...character, ...edits } : character;
  }

  private loadEditsFromStorage(): Map<number, Partial<Character>> {
    try {
      const raw = localStorage.getItem(this.EDITS_STORAGE_KEY);
      if (!raw) return new Map();
      const entries: [number, Partial<Character>][] = JSON.parse(raw);
      return new Map(entries);
    } catch {
      return new Map();
    }
  }

  private saveEditsToStorage() {
    localStorage.setItem(
      this.EDITS_STORAGE_KEY,
      JSON.stringify([...this.localEdits.entries()]),
    );
  }

  private setHouseColor(character: Character) {
    const house = this.getHouse(character.hogwartsHouse);
    const color = house ? this.getNameColor(house.colors) : 'transparent';
    this.document.documentElement.style.setProperty('--dialog-house-color', color);
  }

  private parseDateToISO(dateStr: string): string {
    const dt = DateTime.fromFormat(dateStr, 'MMM d, yyyy', { locale: 'en-US' });
    return dt.isValid ? (dt.toISODate() ?? '') : '';
  }

  private formatDateFromISO(iso: string): string {
    const dt = DateTime.fromISO(iso);
    return dt.isValid ? dt.toFormat('MMM d, yyyy') : '';
  }

  // ─── Reactive form getters ──────────────────────────────────

  get birthdateErrors(): string {
    const ctrl = this.editForm.get('birthdate');
    if (!ctrl?.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return this.transloco.translate('characters.validation.required');
    if (ctrl.errors['futureDate']) return this.transloco.translate('characters.validation.future');
    if (ctrl.errors['minYear']) return this.transloco.translate('characters.validation.minYear');
    return '';
  }

  get selectedSpells(): string[] {
    return this.editForm.get('spells')?.value ?? [];
  }

  // ─── Dialog ─────────────────────────────────────────────────

  openView(character: Character) {
    this.selectedCharacter = this.getCharacterData(character);
    this.setHouseColor(character);
    this.dialogMode = 'view';
    this.isDialogOpen = true;
  }

  switchToEdit() {
    if (!this.selectedCharacter) return;
    const isoDate = this.parseDateToISO(this.selectedCharacter.birthdate || '');
    this.editForm.setValue({
      interpretedBy: this.selectedCharacter.interpretedBy || '',
      birthdate: isoDate,
      children: (this.selectedCharacter.children || []).join(', '),
      spells: [...(this.selectedCharacter.spells || [])],
    });
    this.editForm.markAsUntouched();
    this.spellsDropdownOpen = false;
    this.dialogMode = 'edit';
  }

  toggleSpell(spell: string) {
    const current: string[] = this.editForm.get('spells')!.value;
    const next = current.includes(spell)
      ? current.filter((s) => s !== spell)
      : [...current, spell];
    this.editForm.get('spells')!.setValue(next);
  }

  isSpellSelected(spell: string): boolean {
    return (this.editForm.get('spells')?.value as string[]).includes(spell);
  }

  trySaveEdit() {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.saveEdit();
  }

  saveEdit() {
    if (!this.selectedCharacter) return;
    const { interpretedBy, birthdate, children, spells } = this.editForm.value as {
      interpretedBy: string;
      birthdate: string;
      children: string;
      spells: string[];
    };
    this.localEdits.set(this.selectedCharacter.index, {
      interpretedBy,
      birthdate: birthdate
        ? this.formatDateFromISO(birthdate)
        : this.selectedCharacter.birthdate,
      children: children.split(',').map((s) => s.trim()).filter(Boolean),
      spells,
    });
    this.saveEditsToStorage();
    this.selectedCharacter = this.getCharacterData(this.selectedCharacter);
    this.loadPage();
    this.dialogMode = 'view';
  }
}
