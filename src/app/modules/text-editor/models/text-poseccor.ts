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
    ['Enter', this.enter],
  ]);

  processInput(key: string, ctrl: boolean, container: Container<PositionedTextSymbol>): boolean {
    const processor = this.keyProcessors.get(key);
    if (processor) {
      processor.apply(this, [container]);
    } else if (ctrl) {
      this.processCommand(key);
    } else if (key.length == 1) {
      container.value.symbol.insert(this.cursor.position.col, key);
      this.cursor.moveToRow(this.cursor.position.row, this.cursor.position.col + 1);
    }
    return false;
  }

  processCommand(key: string): boolean {
    switch (key) {
      case 'c': {
        document.execCommand('copy');
        break;
      }
      case 'v': // processed separately
        return true;
      case 'a': {
        const range = new Range();
        //range.selectNodeContents(temp1, 0); temp1 is a textcontainer
        document.getSelection()?.addRange(range);
      }
    }
    return false;
  }

  arrowUp(container: Container<PositionedTextSymbol>) {
    if (this.cursor.position.row == 0) return;
    const newRow = this.cursor.position.row - 1;
    this.moveToRow(container, newRow);
  }

  arrowDown(container: Container<PositionedTextSymbol>) {
    if (this.cursor.position.row == this.rows.length - 1) return;
    const newRow = this.cursor.position.row + 1;
    this.moveToRow(container, newRow);
  }

  moveToRow(container: Container<PositionedTextSymbol>, newRow: number) {
    let newCol = this.cursor.position.col;
    if (this.rows[newRow].length !== 0) {
      const result = PositionedTextSymbol.fromSymbolAtPositionOrLast(
        this.rows[newRow].iterator(),
        this.cursor.position.col,
        newRow,
      );
      if (result.isLast) {
        newCol = result.symbol.end;
      }
      container.value = result.symbol;
    } else {
      newCol = 0;
      container.value = PositionedTextSymbol.empty(0, newRow);
    }
    this.cursor.moveToRow(newRow, newCol);
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
          position = PositionedTextSymbol.findPosition(newRow, last.value) + last.value.length;
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
    let colInd = this.cursor.position.col - 1;
    let rowInd = this.cursor.position.row;
    const curSymbol = container.value;
    if (curSymbol.start !== this.cursor.position.col) {
      if (curSymbol.symbol.isTabOrWhitespace()) {
        container.value = curSymbol.getPrev() ?? PositionedTextSymbol.empty(colInd, rowInd);
      } else {
        let start = this.cursor.position.col - curSymbol.start;
        curSymbol.symbol.removeRange(start - 1, start);
      }
    } else {
      let node = curSymbol.node.prev;
      if (node === null) {
        if (rowInd === 0) return;
        rowInd--;
        let prevRow = this.rows[rowInd];
        if (prevRow.length === 0) {
          this.rows.splice(rowInd, 1);
          curSymbol.row--;
          return;
        }

        prevRow.appendList(this.rows[rowInd + 1]);
        this.rows.splice(rowInd + 1, 1);
        node = curSymbol.node.prev;
        curSymbol.start = PositionedTextSymbol.findPosition(prevRow, curSymbol.symbol);
        colInd = curSymbol.start;
        if (node !== null && node.value.isPlainOrKey()) {
          curSymbol.prepend(node.value);
          prevRow.remove(node);
        }
      } else if (node.value.isPlainOrKey()) {
        node.value.removeRange(node.value.length - 1, node.value.length);
        curSymbol.start--;
      } else {
        this.rows[rowInd].remove(node);
        colInd = curSymbol.start - node.value.length;
        curSymbol.start = colInd;
        if (node.prev !== null && node.prev.value.isPlainOrKey()) {
          curSymbol.prepend(node.prev.value);
          this.rows[rowInd].remove(node.prev);
        }
      }
    }
    this.cursor.moveToRow(rowInd, colInd);
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

  enter(container: Container<PositionedTextSymbol>) {
    const rowInd = this.cursor.position.row + 1;
    const colInd = this.cursor.position.col;
    let newRow: LinkedList<TextSymbol>;
    const curSymbol = container.value;

    if (colInd === curSymbol.end) {
      newRow = new LinkedList<TextSymbol>();
      container.value = PositionedTextSymbol.empty(0, rowInd);
      newRow.appendNode(curSymbol.node);
    } else {
      newRow = this.rows[rowInd - 1].splitAfter(curSymbol.node);
      let split = curSymbol.symbol.split(colInd - curSymbol.start);
      curSymbol.node.value.text = split.before.text;
      let head = newRow.prepend(split.after);
      container.value = new PositionedTextSymbol(head, 0, rowInd);
    }

    this.rows.splice(rowInd, 0, newRow);
    this.cursor.moveToRow(rowInd, 0);
  }

  paste(text: string) {}
}
