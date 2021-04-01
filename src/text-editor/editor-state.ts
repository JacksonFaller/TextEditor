import { LinkedList } from 'src/models/linked-list';
import { SymbolType } from 'src/models/symbol-type';
import { TextSymbol } from 'src/models/text-symbol';
import { Cursor } from './cursor';
import { TextProcessor } from './text-poseccor';

export class EditorState {
  private wasInside = false;
  private textProcessor;

  rows: Array<LinkedList<TextSymbol>> = [];
  cursor = new Cursor();
  curSymbol: TextSymbol;
  focused = false;

  constructor() {
    this.curSymbol = new TextSymbol(
      SymbolType.Plain,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit',
      0,
    );
    for (let i = 0; i < 4; i++) {
      let list = new LinkedList<TextSymbol>();
      list.append(Object.create(this.curSymbol));
      this.rows.push(list);
    }
    this.curSymbol = this.rows[0].getElementAt(0)?.value || this.curSymbol;

    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].forEach((x) => (x.row = i));
    }
    this.textProcessor = new TextProcessor(this.cursor, this.rows);
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
    console.error(event.key);
    if (event.isComposing) {
      return;
    }
    this.textProcessor.processInput(event.key, this.curSymbol);
  }

  findSymbol(colInd: number, rowInd: number): TextSymbol {
    if (this.curSymbol.row == rowInd && this.curSymbol.withinRange(colInd)) {
      return this.curSymbol;
    }
    const row = this.rows[rowInd];
    /* let l = 0,
      r = row.length - 1;
    while (l < r) {
      let mid = Math.floor((l + r) / 2);
      if (colInd > row[mid].range.end) {
        l = mid + 1;
      } else if (colInd < row[mid].range.start) {
        r = mid - 1;
      } else {
        return row[mid];
      }
    }*/
    return this.rows[rowInd].find((x) => colInd <= x.range.end) ?? this.curSymbol;
  }
}
