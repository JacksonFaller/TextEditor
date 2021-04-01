import { LinkedList } from 'src/models/linked-list';
import { TextSymbol } from 'src/models/text-symbol';
import { Cursor } from './cursor';

export class TextProcessor {
  constructor(private cursor: Cursor, private rows: Array<LinkedList<TextSymbol>>) {}
  tabWidth = 2;
  tabAsSpaces = true;

  processInput(key: string, curSymbol: TextSymbol) {
    const keyProcessors = new Map([
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
          if (curSymbol.range.start <= this.cursor.position.col - 1) {
            this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
          }
        },
      ],
      [
        'ArrowRight',
        () => {
          if (curSymbol.range.end >= this.cursor.position.col) {
            this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
          }
        },
      ],
      [
        'Backspace',
        () => {
          if (curSymbol.range.start <= this.cursor.position.col - 1) {
            curSymbol.removeRange(this.cursor.position.col - 1, this.cursor.position.col);
            this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
          }
        },
      ],
      [
        'Tab',
        () => {
          curSymbol.insert(
            this.cursor.position.col,
            this.tabAsSpaces ? ' '.repeat(this.tabWidth) : '\t',
          );
          this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + this.tabWidth);
        },
      ],
    ]);
    const processor = keyProcessors.get(key);
    if (processor) {
      processor();
    } else if (key.length == 1) {
      curSymbol.insert(this.cursor.position.col, key);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
    }
  }
}
