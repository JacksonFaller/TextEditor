import { ListNode } from '../linked-list/list-node';
import { SymbolType } from '../../enums/symbol-type';
import { TextSymbol } from './text-symbol';
import { Row } from '../row';

export class PositionedTextSymbol {
  constructor(public node: ListNode<TextSymbol>, private _start: number, private _row: number) {}

  get symbol(): TextSymbol {
    return this.node.value;
  }

  get text(): string {
    return this.symbol.text;
  }

  get length(): number {
    return this.symbol.length;
  }

  get row(): number {
    return this._row;
  }

  set row(value: number) {
    this._row = value;
  }

  get type(): SymbolType {
    return this.symbol.type;
  }

  get start(): number {
    return this._start;
  }

  set start(value: number) {
    this._start = value;
  }

  get end(): number {
    return this.start + this.length;
  }

  static findPosition(row: Iterable<TextSymbol>, symbol: TextSymbol): number {
    let position = 0;
    for (let el of row) {
      if (el == symbol) break;
      position += el.length;
    }
    return position;
  }

  static fromSymbolAtPosition(
    row: Iterable<ListNode<TextSymbol>>,
    colInd: number,
    rowInd: number,
  ): PositionedTextSymbol | null {
    let position = 0;
    for (let el of row) {
      if (position + el.value.length > colInd) {
        return new PositionedTextSymbol(el, position, rowInd);
      }
      position += el.value.length;
    }
    return null;
  }

  static fromSymbolAtPositionOrLast(
    row: Iterable<ListNode<TextSymbol>>,
    colInd: number,
    rowInd: number,
  ): { found: boolean; symbol: PositionedTextSymbol } {
    let position = 0;
    let el;
    for (el of row) {
      if (position + el.value.length > colInd) {
        return { found: true, symbol: new PositionedTextSymbol(el, position, rowInd) };
      }
      position += el.value.length;
    }
    if (el === undefined) throw `Row is empty`;
    return {
      found: false,
      symbol: new PositionedTextSymbol(el, position - el.value.length, rowInd),
    };
  }

  static lineEnd(start: number, row: Row, rowInd: number) {
    return new PositionedTextSymbol(row.lineEnd, start, rowInd);
  }

  getPrev(): PositionedTextSymbol | null {
    if (this.node.prev === null) {
      return null;
    }
    let start = this._start - this.node.prev.value.length;
    return new PositionedTextSymbol(this.node.prev, start, this._row);
  }

  getNext(): PositionedTextSymbol | null {
    if (this.node.next === null) {
      return null;
    }
    let start = this._start + this.length;
    return new PositionedTextSymbol(this.node.next, start, this._row);
  }

  prepend(symbol: TextSymbol) {
    this.symbol.prepend(symbol.text);
    this._start -= symbol.length;
  }
}
