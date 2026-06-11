import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table/components/table';
import { TuiHint } from '@taiga-ui/core/directives/hint';
import { TuiDialog } from '@taiga-ui/core/components/dialog';
import { TuiButton } from '@taiga-ui/core/components/button';
import { TuiIcon } from '@taiga-ui/core/components/icon';
import { HarryPotterService } from '../../services/harry-potter.service';

interface EditForm {
  interpretedBy: string;
  birthdate: string; // stored as YYYY-MM-DD for <input type="date">
  birthdateDisplay: string; // original string for display in view mode
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
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit {
  characters: any[] = [];
  houses: any[] = [];
  spells: string[] = [];
  columns = ['fullName', 'birthdate', 'hogwartsHouse', 'interpretedBy'];

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

  private localEdits = new Map<number, Partial<any>>();

  constructor(
    private harryPotterService: HarryPotterService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    this.harryPotterService.getCharacters().subscribe((data) => {
      this.characters = data;
    });
    this.harryPotterService.getHouses().subscribe((data) => {
      this.houses = data;
    });
    this.harryPotterService.getSpells().subscribe((data: any[]) => {
      this.spells = data.map((s) => s.spell);
    });
  }

  getHouse(houseName: string) {
    return this.houses.find((h) => h.house === houseName);
  }

  getNameColor(colors: string[]): string {
    const lightColors = ['yellow', 'gold', 'white', 'silver'];
    return lightColors.includes(colors[0]) ? colors[1] : colors[0];
  }

  getCharacterData(character: any): any {
    const edits = this.localEdits.get(character.index);
    return edits ? { ...character, ...edits } : character;
  }

  private setHouseColor(character: any) {
    const house = this.getHouse(character.hogwartsHouse);
    const color = house ? this.getNameColor(house.colors) : 'transparent';
    this.document.documentElement.style.setProperty('--dialog-house-color', color);
  }

  /** Convert "Jul 31, 1980" → "1980-07-31" for <input type="date"> */
  private parseDateToISO(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Convert "1980-07-31" back to "Jul 31, 1980" */
  private formatDateFromISO(iso: string): string {
    if (!iso) return '';
    const [year, month, day] = iso.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  openView(character: any) {
    this.selectedCharacter = this.getCharacterData(character);
    this.setHouseColor(character);
    this.dialogMode = 'view';
    this.isDialogOpen = true;
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
    this.dialogMode = 'view';
  }
}
