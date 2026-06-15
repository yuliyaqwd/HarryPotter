import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { CommonModule, DOCUMENT } from '@angular/common';
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
import { TuiHint } from '@taiga-ui/core/directives/hint';
import { TuiDialog } from '@taiga-ui/core/components/dialog';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiIcon } from '@taiga-ui/core/components/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { HarryPotterService } from '../../services/harry-potter.service';

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
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiTable,
    TuiHint,
    TuiDialog,
    TuiButton,
    TuiIcon,
    TranslatePipe,
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit, OnDestroy {
  private langSub!: Subscription;

  // All data for search + total count
  allCharacters: any[] = [];

  // Displayed page data (merged with localEdits)
  characters: any[] = [];

  houses: any[] = [];
  spells: string[] = [];
  columns = ['fullName', 'birthdate', 'hogwartsHouse', 'interpretedBy'];

  // Pagination
  page = 0;
  pageSize = 5;
  pageSizes = [5, 10, 20];
  totalItems = 0;

  // Search
  search = '';

  // Dialog
  selectedCharacter: any = null;
  isDialogOpen = false;
  dialogMode: 'view' | 'edit' = 'view';
  dialogOptions: any = { label: '', size: 's', closeable: false };
  spellsDropdownOpen = false;

  editForm: FormGroup;

  private localEdits = new Map<number, Partial<any>>();

  constructor(
    private harryPotterService: HarryPotterService,
    private translate: TranslationService,
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.editForm = this.fb.group({
      interpretedBy: [''],
      birthdate: ['', [Validators.required, notFutureDateValidator, minYear1800Validator]],
      children: [''],
      spells: [[] as string[]],
    });
  }

  ngOnInit() {
    this.loadAll();
    this.langSub = this.translate.currentLang$.pipe(skip(1)).subscribe(() => {
      this.page = 0;
      this.search = '';
      this.isDialogOpen = false;
      this.localEdits.clear();
      this.loadAll();
    });
  }

  ngOnDestroy() {
    this.langSub.unsubscribe();
  }

  private loadAll() {
    this.harryPotterService.getAllCharacters().subscribe((data) => {
      this.allCharacters = data;
      this.totalItems = data.length;
      this.loadPage();
    });
    this.harryPotterService.getHouses().subscribe((data) => {
      this.houses = data;
    });
    this.harryPotterService.getSpells().subscribe((data: any[]) => {
      this.spells = data.map((s) => s.spell);
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  loadPage() {
    if (this.search.trim()) {
      const filtered = this.allCharacters.filter((c) =>
        c.fullName.toLowerCase().includes(this.search.toLowerCase()),
      );
      this.totalItems = filtered.length;
      const start = this.page * this.pageSize;
      this.characters = filtered
        .slice(start, start + this.pageSize)
        .map((c) => this.getCharacterData(c));
    } else {
      this.totalItems = this.allCharacters.length;
      this.harryPotterService
        .getCharacters(this.page + 1, this.pageSize)
        .subscribe((data) => {
          this.characters = data.map((c) => this.getCharacterData(c));
        });
    }
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadPage();
  }

  onPageSizeChange(size: number) {
    this.pageSize = Number(size);
    this.page = 0;
    this.loadPage();
  }

  onSearch() {
    this.page = 0;
    this.loadPage();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  onSortChange(event: { sortKey: string | null; sortDirection: 1 | -1 }) {
    if (!event.sortKey) {
      this.loadPage();
      return;
    }
    const key = event.sortKey;
    const dir = event.sortDirection;
    this.characters = [...this.characters].sort((a, b) => {
      if (key === 'birthdate') {
        const aDate = new Date(a[key] ?? '').getTime() || 0;
        const bDate = new Date(b[key] ?? '').getTime() || 0;
        return (aDate - bDate) * dir;
      }
      const aVal = String(a[key] ?? '');
      const bVal = String(b[key] ?? '');
      return aVal.localeCompare(bVal) * dir;
    });
  }

  // ─── House helpers ──────────────────────────────────────────

  getHouse(houseName: string) {
    return this.houses.find((h) => h.house === houseName);
  }

  getNameColor(colors: string[]): string {
    const lightColors = ['yellow', 'gold', 'white', 'silver'];
    return lightColors.includes(colors[0]) ? colors[1] : colors[0];
  }

  // ─── Edit helpers ───────────────────────────────────────────

  getCharacterData(character: any): any {
    const edits = this.localEdits.get(character.index);
    return edits ? { ...character, ...edits } : character;
  }

  private setHouseColor(character: any) {
    const house = this.getHouse(character.hogwartsHouse);
    const color = house ? this.getNameColor(house.colors) : 'transparent';
    this.document.documentElement.style.setProperty('--dialog-house-color', color);
  }

  private parseDateToISO(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateFromISO(iso: string): string {
    if (!iso) return '';
    const [year, month, day] = iso.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ─── Reactive form getters ──────────────────────────────────

  get birthdateErrors(): string {
    const ctrl = this.editForm.get('birthdate');
    if (!ctrl?.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return this.translate.instant('characters.validation.required');
    if (ctrl.errors['futureDate']) return this.translate.instant('characters.validation.future');
    if (ctrl.errors['minYear']) return this.translate.instant('characters.validation.minYear');
    return '';
  }

  get selectedSpells(): string[] {
    return this.editForm.get('spells')?.value ?? [];
  }

  // ─── Dialog ─────────────────────────────────────────────────

  openView(character: any) {
    this.selectedCharacter = this.getCharacterData(character);
    this.setHouseColor(character);
    this.dialogMode = 'view';
    this.isDialogOpen = true;
  }

  switchToEdit() {
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
    const { interpretedBy, birthdate, children, spells } = this.editForm.value;
    this.localEdits.set(this.selectedCharacter.index, {
      interpretedBy,
      birthdate: birthdate
        ? this.formatDateFromISO(birthdate)
        : this.selectedCharacter.birthdate,
      children: (children as string)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
      spells,
    });
    this.selectedCharacter = this.getCharacterData(this.selectedCharacter);
    // Refresh displayed page so edits appear in the table
    this.loadPage();
    this.dialogMode = 'view';
  }
}
