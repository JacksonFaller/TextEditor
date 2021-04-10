import { LinkedList } from 'src/app/modules/text-editor/models/linked-list/linked-list';
import { PositionedTextSymbol } from 'src/app/modules/text-editor/models/symbol/positioned-text-symbol';
import { SymbolType } from 'src/app/modules/text-editor/enums/symbol-type';
import { TextSymbol } from 'src/app/modules/text-editor/models/symbol/text-symbol';
import { Cursor } from './cursor';
import { TextProcessor } from './text-poseccor';

export class EditorState {
  private wasInside = false;
  private textProcessor;

  rows: Array<LinkedList<TextSymbol>> = [];
  cursor = new Cursor();
  curSymbol: PositionedTextSymbol;
  focused = false;

  constructor() {
    this.textProcessor = new TextProcessor(this.cursor, this.rows);
    this.testData();
    this.curSymbol = new PositionedTextSymbol(this.rows[0].first!, 0);
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
    if (element.classList.contains('symbol') && element.parentElement) {
      this.cursor.moveCursor(event.clientX, event.clientY, element.parentElement);
    } else if (element.className == 'text-container') {
      const last = this.rows.length - 1;
      this.cursor.moveToRow(last, this.getRowLength(last));
    } else if (element.className == 'row') {
      const row = this.cursor.findRowIndexByAttribute(element);
      this.cursor.moveToRow(row, this.getRowLength(row));
    } else {
      throw 'Clicked somewhere and idk what to do';
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

  findSymbol(colInd: number, rowInd: number): PositionedTextSymbol {
    if (
      this.curSymbol.row == rowInd &&
      colInd >= this.curSymbol.start &&
      colInd <= this.curSymbol.end
    ) {
      return this.curSymbol;
    }

    let position = 0;
    for (let el of this.rows[rowInd].iterator()) {
      if (position + el.value.length > colInd) {
        return new PositionedTextSymbol(el, position);
      }
      position += el.value.length;
    }
    throw `Couldn't find current symbol`;
  }

  testData() {
    const str = 'Lorem ipsum dolor sit amet consectetur adipisicing elit';
    for (let i = 0; i < 4; i++) {
      let list = new LinkedList<TextSymbol>();
      str.split(' ').forEach((x) => {
        list.append(new TextSymbol(SymbolType.Plain, x, i));
        list.append(TextSymbol.whitespace(i));
      });
      this.rows.push(list);
    }
    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].forEach((x) => (x.row = i));
    }
  }
}