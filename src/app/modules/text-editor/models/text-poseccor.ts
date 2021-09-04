import { PositionedTextSymbol } from 'src/app/modules/text-editor/models/symbol/positioned-text-symbol';
import { TextSymbol } from 'src/app/modules/text-editor/models/symbol/text-symbol';
import { Cursor } from './cursor';
import { Container } from './container';
import { ListNode } from './linked-list/list-node';
import { Row } from './row';

export class TextProcessor {
  constructor(private cursor: Cursor, private rows: Array<Row>) {}
  keyProcessors = new Map<string, (cur: Container<PositionedTextSymbol>) => void>([
    ['ArrowUp', this.arrowUp],
    ['ArrowDown', this.arrowDown],
    ['ArrowLeft', this.arrowLeft],
    ['ArrowRight', this.arrowRight],
    ['Backspace', this.backspace],
    ['Tab', this.tab],
    ['Delete', this.delete],
    ['Enter', this.enter],
    [' ', this.whitespace],
    ['Home', this.home],
    ['End', this.end],
  ]);

  processInput(key: string, ctrl: boolean, container: Container<PositionedTextSymbol>): boolean {
    const processor = this.keyProcessors.get(key);
    if (processor) {
      processor.apply(this, [container]);
    } else if (ctrl) {
      this.processCommand(key);
    } else if (key.length == 1) {
      this.insertChar(container, key);
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

  insertChar(container: Container<PositionedTextSymbol>, key: string) {
    const curSymbol = container.value;
    if (curSymbol.symbol.isLineEnd) {
      const row = this.rows[this.cursor.row];
      if (row.last !== null) {
        if (row.last.value.isPlainOrKey) {
          row.last.value.append(key);
        } else {
          row.append(TextSymbol.plain(key));
        }
      } else {
        row.append(TextSymbol.plain(key));
      }
    } else {
      container.value.symbol.insert(this.cursor.col - container.value.start, key);
    }
    this.cursor.moveToCol(this.cursor.col + 1);
    container.value.start++;
  }

  arrowUp(container: Container<PositionedTextSymbol>) {
    if (this.cursor.row == 0) return;
    const newRow = this.cursor.row - 1;
    this.moveToRow(container, newRow);
  }

  arrowDown(container: Container<PositionedTextSymbol>) {
    if (this.cursor.row == this.rows.length - 1) return;
    const newRow = this.cursor.row + 1;
    this.moveToRow(container, newRow);
  }

  moveToRow(container: Container<PositionedTextSymbol>, newRow: number) {
    let newCol = this.cursor.col;
    if (this.rows[newRow].length !== 0) {
      const result = PositionedTextSymbol.fromSymbolAtPositionOrLast(
        this.rows[newRow].nodes(),
        this.cursor.col,
        newRow,
      );
      if (result.found) {
        container.value = result.symbol;
      } else {
        newCol = result.symbol.end;
        container.value = PositionedTextSymbol.lineEnd(newCol, this.rows[newRow], newRow);
      }
    } else {
      newCol = 0;
      container.value = PositionedTextSymbol.lineEnd(0, this.rows[newRow], newRow);
    }
    this.cursor.moveToRow(newRow, newCol);
  }

  arrowLeft(container: Container<PositionedTextSymbol>) {
    const curSymbol = container.value;
    let cursorNewRow = this.cursor.row;
    let cursorNewCol = this.cursor.col - 1;
    if (curSymbol.start === this.cursor.col) {
      const newSymbol = curSymbol.getPrev();
      if (newSymbol !== null) {
        container.value = newSymbol;
      } else if (curSymbol.row !== 0) {
        const newRow = this.rows[curSymbol.row - 1];
        let position = 0;
        if (newRow.last !== null) {
          position = PositionedTextSymbol.findPosition(newRow, newRow.last.value);
          container.value = new PositionedTextSymbol(newRow.last, position, curSymbol.row - 1);
        }
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
    let cursorNewRow = this.cursor.row;
    let cursorNewCol = this.cursor.col + 1;
    if (container.value.end === this.cursor.col) {
      const newSymbol = curSymbol.getNext();
      if (newSymbol !== null) {
        container.value = newSymbol;
      } else if (curSymbol.row !== this.rows.length - 1) {
        let nextRow = this.rows[curSymbol.row + 1];
        let first = nextRow.first ?? nextRow.lineEnd;
        container.value = new PositionedTextSymbol(first, 0, curSymbol.row + 1);
        cursorNewRow++;
        cursorNewCol = 0;
      } else {
        return;
      }
    } else if (curSymbol.length === 1) {
      container.value = curSymbol.getNext() ?? curSymbol;
    }
    this.cursor.moveToRow(cursorNewRow, cursorNewCol);
  }

  backspace(container: Container<PositionedTextSymbol>) {
    let colInd = this.cursor.col - 1;
    let rowInd = this.cursor.row;
    const curSymbol = container.value;
    if (curSymbol.start !== this.cursor.col) {
      // TODO: if tab is composed of spaces - split it
      if (curSymbol.symbol.isSplittable) {
        let start = this.cursor.col - curSymbol.start;
        curSymbol.symbol.removeRange(start - 1, start);
      }
    } else {
      let prevNode = curSymbol.node.prev;
      if (prevNode === null) {
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
        prevNode = curSymbol.node.prev;
        curSymbol.start = PositionedTextSymbol.findPosition(prevRow, curSymbol.symbol);
        colInd = curSymbol.start;
        this.prependNode(curSymbol, prevNode, rowInd);
      } else if (prevNode.value.isPlainOrKey && prevNode.value.length > 1) {
        prevNode.value.removeRange(prevNode.value.length - 1, prevNode.value.length);
        curSymbol.start--;
      } else {
        this.rows[rowInd].remove(prevNode);
        colInd = curSymbol.start - prevNode.value.length;
        curSymbol.start = colInd;
        this.prependNode(curSymbol, prevNode.prev, rowInd);
      }
    }
    this.cursor.moveToRow(rowInd, colInd);
  }

  prependNode(
    curSymbol: PositionedTextSymbol,
    prefix: ListNode<TextSymbol> | null,
    rowInd: number,
  ) {
    if (prefix !== null && curSymbol.symbol.isPlainOrKey && prefix.value.isPlainOrKey) {
      curSymbol.prepend(prefix.value);
      this.rows[rowInd].remove(prefix);
    }
  }

  delete(container: Container<PositionedTextSymbol>) {
    if (container.value.end > this.cursor.col - 1) {
      container.value.symbol.removeRange(this.cursor.col, this.cursor.col + 1);
    }
  }

  tab(container: Container<PositionedTextSymbol>) {
    const curSymbol = container.value;
    const colInd = this.cursor.col;
    if (curSymbol.start === colInd) {
      this.rows[curSymbol.row].insertBefore(curSymbol.node, TextSymbol.tab);
    } else if (curSymbol.symbol.isSplittable) {
      const nodes = this.rows[curSymbol.row].insertSymbol(
        TextSymbol.tab,
        curSymbol.node,
        colInd - curSymbol.start,
      );
      container.value = new PositionedTextSymbol(nodes.after, colInd, this.cursor.row);
    } else {
      this.rows[curSymbol.row].insertAfter(curSymbol.node, TextSymbol.tab);
    }
    curSymbol.start += TextSymbol.tabWidth;
    this.cursor.moveToCol(colInd + TextSymbol.tabWidth);
  }

  enter(container: Container<PositionedTextSymbol>) {
    const rowInd = this.cursor.row + 1;
    const colInd = this.cursor.col;
    let newRow: Row;
    const curSymbol = container.value;

    if (curSymbol.symbol.isLineEnd) {
      newRow = new Row();
      container.value = PositionedTextSymbol.lineEnd(0, newRow, rowInd);
    } else {
      newRow = Row.fromList(this.rows[rowInd - 1].splitAfter(curSymbol.node));
      let split = curSymbol.symbol.split(colInd - curSymbol.start);
      curSymbol.node.value.text = split.before.text;
      let head = newRow.prepend(split.after);
      container.value = new PositionedTextSymbol(head, 0, rowInd);
    }

    this.rows.splice(rowInd, 0, newRow);
    this.cursor.moveToRow(rowInd, 0);
  }

  whitespace(container: Container<PositionedTextSymbol>) {
    const curSymbol = container.value;
    const colInd = this.cursor.col + 1;

    if (curSymbol.start === this.cursor.col) {
      this.rows[curSymbol.row].insertBefore(curSymbol.node, TextSymbol.whitespace);
      container.value.start++;
    } else if (!curSymbol.symbol.isSplittable) {
      const node = this.rows[curSymbol.row].insertAfter(curSymbol.node, TextSymbol.whitespace);
      container.value = new PositionedTextSymbol(node, colInd, curSymbol.row);
    } else {
      const nodes = this.rows[curSymbol.row].insertSymbol(
        TextSymbol.whitespace,
        curSymbol.node,
        this.cursor.col - curSymbol.start,
      );
      container.value = new PositionedTextSymbol(nodes.after, colInd, this.cursor.row);
    }
    this.cursor.moveToCol(colInd);
  }

  home(container: Container<PositionedTextSymbol>) {
    if (container.value.start == 0) return;
    const row = this.rows[this.cursor.row];
    if (row.first !== null) {
      container.value = new PositionedTextSymbol(row.first, 0, this.cursor.row);
    } else {
      container.value = PositionedTextSymbol.lineEnd(0, row, this.cursor.row);
    }
    this.cursor.moveToCol(0);
  }

  end(container: Container<PositionedTextSymbol>) {
    if (container.value.symbol.isLineEnd) return;
    const row = this.rows[this.cursor.row];
    let pos = 0;
    if (row.last !== null) {
      pos = PositionedTextSymbol.findPosition(row, row.last.value);
    }
    container.value = PositionedTextSymbol.lineEnd(pos, row, this.cursor.row);
    this.cursor.moveToCol(container.value.end);
  }

  paste(text: string) {}
}
