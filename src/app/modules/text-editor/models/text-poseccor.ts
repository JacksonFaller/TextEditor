import { LinkedList } from 'src/app/modules/text-editor/models/linked-list/linked-list';
import { PositionedTextSymbol } from 'src/app/modules/text-editor/models/symbol/positioned-text-symbol';
import { SymbolType } from 'src/app/modules/text-editor/enums/symbol-type';
import { TextSymbol } from 'src/app/modules/text-editor/models/symbol/text-symbol';
import { Cursor } from './cursor';

export class TextProcessor {
  constructor(private cursor: Cursor, private rows: Array<LinkedList<TextSymbol>>) {}
  keyProcessors = new Map([
    ['ArrowUp', this.arrowUp],
    ['ArrowDown', this.arrowDown],
    ['ArrowLeft', this.arrowLeft],
    ['ArrowRight', this.arrowRight],
    ['Backspace', this.backspace],
    ['Tab', this.tab],
    ['Delete', this.delete],
  ]);

  processInput(key: string, curSymbol: PositionedTextSymbol) {
    const processor = this.keyProcessors.get(key);
    if (processor) {
      processor.apply(this, [curSymbol]);
    } else if (key.length == 1) {
      curSymbol.symbol.insert(this.cursor.position.col, key);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
    }
  }

  arrowUp(curSymbol: PositionedTextSymbol) {
    if (this.cursor.position.row == 0) return;
    let col = this.cursor.position.col;
    const row = this.rows[this.cursor.position.row - 1];
    if (row.last !== null) {
      const rowLength =
        PositionedTextSymbol.findPosition(row.last.value, row) + row.last.value.length;
      col = Math.min(rowLength, col);
    }
    // need to check for column too
    this.cursor.moveToRow(this.cursor.position.row - 1, col);
  }

  arrowDown(curSymbol: PositionedTextSymbol) {
    if (this.cursor.position.row == this.rows.length - 1) return;
    // need to check for column too
    this.cursor.moveToRow(this.cursor.position.row + 1, this.cursor.position.col);
  }

  arrowLeft(curSymbol: PositionedTextSymbol) {
    if (curSymbol.start <= this.cursor.position.col - 1) {
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
    }
  }

  arrowRight(curSymbol: PositionedTextSymbol) {
    if (curSymbol.end >= this.cursor.position.col) {
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
    }
  }

  backspace(curSymbol: PositionedTextSymbol) {
    if (curSymbol.start <= this.cursor.position.col - 1) {
      curSymbol.symbol.removeRange(this.cursor.position.col - 1, this.cursor.position.col);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
    }
  }

  delete(curSymbol: PositionedTextSymbol) {
    if (curSymbol.end > this.cursor.position.col - 1) {
      curSymbol.symbol.removeRange(this.cursor.position.col, this.cursor.position.col + 1);
    }
  }

  tab(curSymbol: PositionedTextSymbol) {
    const row = this.rows[this.cursor.position.row];
    if (!curSymbol.symbol.isTabOrWhitespace()) {
      const split = curSymbol.symbol.split(this.cursor.position.col - curSymbol.start);
      row.insertManyAfter(curSymbol.node, [
        split.before,
        TextSymbol.tab(this.cursor.position.row),
        split.after,
      ]);
      row.remove(curSymbol.node);
    }

    this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + TextSymbol.tabWidth);
  }
}
