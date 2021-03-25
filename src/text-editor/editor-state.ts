import { SymbolType } from 'src/models/symbol-type';
import { TextSymbol } from 'src/models/text-symbol';
import { Cursor } from './cursor';

export class EditorState {
  private wasInside = false;
  rows: Array<Array<TextSymbol>> = [];
  cursor = new Cursor();
  curSymbol: TextSymbol;
  tabWidth = 2;
  tabAsSpaces = true;
  focused = false;

  constructor() {
    this.curSymbol = new TextSymbol(
      SymbolType.Plain,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit',
      0,
    );
    this.rows.push([Object.create(this.curSymbol)]);
    this.rows.push([Object.create(this.curSymbol)]);
    this.rows.push([Object.create(this.curSymbol)]);
    this.rows.push([Object.create(this.curSymbol)]);
    this.curSymbol = this.rows[0][0];

    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].forEach((x) => (x.row = i));
    }
  }

  clickout() {
    if (!this.wasInside) {
      this.cursor.hide();
      this.focused = false;
    }
    this.wasInside = false;
  }

  click(e: Event) {
    this.wasInside = true;
    this.textContainerClick(e);
  }

  textContainerClick(e: Event) {
    let event = e as MouseEvent;
    // checking for left-click
    if (event.button != 0) {
      return;
    }
    const element = event.target as HTMLElement;
    if (element.className == 'text-container') {
      const last = this.rows.length - 1;
      this.cursor.moveToRow(last, this.getRowLength(last));
    } else if (element.className == 'row') {
      const row = this.cursor.findRowIndexByAttribute(element);
      this.cursor.moveToRow(row, this.getRowLength(row));
    } else {
      this.cursor.moveCursor(event.clientX, event.clientY, element);
    }
    this.curSymbol = this.findSymbol(this.cursor.position.col, this.cursor.position.row);
    this.cursor.animate();
    this.focused = true;
  }

  getRowLength(row: number): number {
    /// TODO: consider caching length of rows
    let rowLength = 0;
    this.rows[row].forEach((symbol) => {
      rowLength += symbol.text.length;
    });
    return rowLength;
  }

  keyDown(event: KeyboardEvent) {
    const except = new Map([
      [
        'ArrowUp',
        () => {
          if (this.cursor.position.row == 0) return;
          // need to check for column too
          this.cursor.moveToRow(this.cursor.position.row - 1, this.cursor.position.col);
        },
      ],
      [
        'ArrowDown',
        () => {
          if (this.cursor.position.row == this.rows.length - 1) return;
          // need to check for column too
          this.cursor.moveToRow(this.cursor.position.row + 1, this.cursor.position.col);
        },
      ],
      [
        'ArrowLeft',
        () => {
          if (this.curSymbol.range.start <= this.cursor.position.col - 1) {
            this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
          }
        },
      ],
      [
        'ArrowRight',
        () => {
          if (this.curSymbol.range.end >= this.cursor.position.col) {
            this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
          }
        },
      ],
      [
        'Backspace',
        () => {
          if (this.curSymbol.range.start <= this.cursor.position.col - 1) {
            this.curSymbol.removeRange(this.cursor.position.col - 1, this.cursor.position.col);
            this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
          }
        },
      ],
      [
        'Tab',
        () => {
          this.curSymbol.insert(
            this.cursor.position.col,
            this.tabAsSpaces ? ' '.repeat(this.tabWidth) : '\t',
          );
          this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + this.tabWidth);
        },
      ],
    ]);
    const special = except.get(event.key);
    if (event.isComposing || (event.key.length > 1 && !special)) {
      return;
    }

    if (special) {
      special();
    } else {
      this.curSymbol.insert(this.cursor.position.col, event.key);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
    }
    console.error(event.key);
  }

  findSymbol(colInd: number, rowInd: number): TextSymbol {
    if (this.curSymbol.row == rowInd && this.curSymbol.withinRange(colInd)) {
      return this.curSymbol;
    }
    return this.rows[rowInd].find((x) => x.withinRange(colInd)) ?? this.curSymbol;
  }
}
