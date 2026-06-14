import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import { TuiHint } from '@taiga-ui/core/directives/hint';
import { TuiDialog } from '@taiga-ui/core/components/dialog';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiIcon } from '@taiga-ui/core/components/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { HarryPotterService } from '../../services/harry-potter.service';

interface EditForm {
  interpretedBy: string;
  birthdate: string;
  birthdateDisplay: string;
  children: string;
  spells: string[];
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
export class CharactersComponent implements OnInit {
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

  editForm: EditForm = {
    interpretedBy: '',
    birthdate: '',
    birthdateDisplay: '',
    children: '',
    spells: [],
  };

  birthdateError = '';

  private localEdits = new Map<number, Partial<any>>();

  constructor(
    private harryPotterService: HarryPotterService,
    private translate: TranslationService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
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

  // ─── Dialog ─────────────────────────────────────────────────

  openView(character: any) {
    this.selectedCharacter = this.getCharacterData(character);
    this.setHouseColor(character);
    this.dialogMode = 'view';
    this.isDialogOpen = true;
  }

  validateBirthdate(): boolean {
    const val = this.editForm.birthdate;
    if (!val) {
      this.birthdateError = this.translate.instant('characters.validation.required');
      return false;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      this.birthdateError = this.translate.instant('characters.validation.invalid');
      return false;
    }
    if (d > new Date()) {
      this.birthdateError = this.translate.instant('characters.validation.future');
      return false;
    }
    if (d.getFullYear() < 1800) {
      this.birthdateError = this.translate.instant('characters.validation.minYear');
      return false;
    }
    this.birthdateError = '';
    return true;
  }

  onBirthdateChange() {
    if (this.editForm.birthdate) {
      this.validateBirthdate();
    } else {
      this.birthdateError = '';
    }
  }

  switchToEdit() {
    const isoDate = this.parseDateToISO(this.selectedCharacter.birthdate || '');
    this.editForm = {
      interpretedBy: this.selectedCharacter.interpretedBy || '',
      birthdate: isoDate,
      birthdateDisplay: this.selectedCharacter.birthdate || '',
      children: (this.selectedCharacter.children || []).join(', '),
      spells: [...(this.selectedCharacter.spells || [])],
    };
    this.birthdateError = '';
    this.dialogMode = 'edit';
  }

  toggleSpell(spell: string) {
    const idx = this.editForm.spells.indexOf(spell);
    if (idx === -1) {
      this.editForm.spells = [...this.editForm.spells, spell];
    } else {
      this.editForm.spells = this.editForm.spells.filter((s) => s !== spell);
    }
  }

  isSpellSelected(spell: string): boolean {
    return this.editForm.spells.includes(spell);
  }

  trySaveEdit() {
    if (!this.validateBirthdate()) return;
    this.saveEdit();
  }

  saveEdit() {
    this.localEdits.set(this.selectedCharacter.index, {
      interpretedBy: this.editForm.interpretedBy,
      birthdate: this.editForm.birthdate
        ? this.formatDateFromISO(this.editForm.birthdate)
        : this.editForm.birthdateDisplay,
      children: this.editForm.children
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      spells: this.editForm.spells,
    });
    this.selectedCharacter = this.getCharacterData(this.selectedCharacter);
    // Refresh displayed page so edits appear in the table
    this.loadPage();
    this.dialogMode = 'view';
  }
}
