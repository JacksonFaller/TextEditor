import { LinkedList } from 'src/app/modules/text-editor/models/linked-list/linked-list';
import { PositionedTextSymbol } from 'src/app/modules/text-editor/models/symbol/positioned-text-symbol';
import { TextSymbol } from 'src/app/modules/text-editor/models/symbol/text-symbol';
import { Cursor } from './cursor';
import { Container } from './container';
import { ListNode } from './linked-list/list-node';

export class TextProcessor {
  constructor(private cursor: Cursor, private rows: Array<LinkedList<TextSymbol>>) {}
  keyProcessors = new Map<string, (cur: Container<PositionedTextSymbol>) => void>([
    ['ArrowUp', this.arrowUp],
    ['ArrowDown', this.arrowDown],
    ['ArrowLeft', this.arrowLeft],
    ['ArrowRight', this.arrowRight],
    ['Backspace', this.backspace],
    ['Tab', this.tab],
    ['Delete', this.delete],
  ]);

  processInput(key: string, container: Container<PositionedTextSymbol>) {
    const processor = this.keyProcessors.get(key);
    if (processor) {
      processor.apply(this, [container]);
    } else if (key.length == 1) {
      container.value.symbol.insert(this.cursor.position.col, key);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
    }
  }

  arrowUp(container: Container<PositionedTextSymbol>) {
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

  arrowDown(container: Container<PositionedTextSymbol>) {
    if (this.cursor.position.row == this.rows.length - 1) return;
    // need to check for column too
    this.cursor.moveToRow(this.cursor.position.row + 1, this.cursor.position.col);
  }

  arrowLeft(container: Container<PositionedTextSymbol>) {
    const curSymbol = container.value;
    let cursorNewRow = this.cursor.position.row;
    let cursorNewCol = this.cursor.position.col - 1;
    if (curSymbol.start === this.cursor.position.col) {
      const newSymbol = curSymbol.getPrev();
      if (newSymbol) {
        container.value = newSymbol;
      } else if (curSymbol.row !== 0) {
        const newRow = this.rows[curSymbol.row - 1];
        let last: ListNode<TextSymbol>;
        let position = 0;
        if (newRow.last !== null) {
          last = newRow.last;
          position = PositionedTextSymbol.findPosition(last.value, newRow) + last.value.length;
        } else {
          last = new ListNode(TextSymbol.empty);
        }
        container.value = new PositionedTextSymbol(last, position, curSymbol.row - 1);
        cursorNewRow--;
        cursorNewCol = position;
      } else {
        return;
      }
    }
    this.cursor.moveToRow(cursorNewRow, cursorNewCol);
  }

  arrowRight(container: Container<PositionedTextSymbol>) {
    const curSymbol = container.value;
    let cursorNewRow = this.cursor.position.row;
    let cursorNewCol = this.cursor.position.col + 1;
    if (container.value.end === this.cursor.position.col) {
      const newSymbol = curSymbol.getNext();
      if (newSymbol !== null) {
        container.value = newSymbol;
      } else if (curSymbol.row !== this.rows.length - 1) {
        let newRow = this.rows[curSymbol.row + 1];
        let first = newRow.first ?? new ListNode(TextSymbol.empty);
        container.value = new PositionedTextSymbol(first, 0, curSymbol.row + 1);
        cursorNewRow++;
        cursorNewCol = 0;
      } else {
        return;
      }
    }
    this.cursor.moveToRow(cursorNewRow, cursorNewCol);
  }

  backspace(container: Container<PositionedTextSymbol>) {
    if (container.value.start <= this.cursor.position.col - 1) {
      container.value.symbol.removeRange(this.cursor.position.col - 1, this.cursor.position.col);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col - 1);
    }
  }

  delete(container: Container<PositionedTextSymbol>) {
    if (container.value.end > this.cursor.position.col - 1) {
      container.value.symbol.removeRange(this.cursor.position.col, this.cursor.position.col + 1);
    }
  }

  tab(container: Container<PositionedTextSymbol>) {
    const curSymbol = container.value;
    const row = this.rows[this.cursor.position.row];
    if (!curSymbol.symbol.isTabOrWhitespace()) {
      const split = curSymbol.symbol.split(this.cursor.position.col - curSymbol.start);
      row.insertManyAfter(curSymbol.node, [split.before, TextSymbol.tab, split.after]);
      row.remove(curSymbol.node);
    }

    this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + TextSymbol.tabWidth);
  }
}
