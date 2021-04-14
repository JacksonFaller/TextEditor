import { ListNode } from '../linked-list/list-node';
import { SymbolType } from '../../enums/symbol-type';
import { TextSymbol } from './text-symbol';

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

  get type(): SymbolType {
    return this.symbol.type;
  }

  get start(): number {
    return this._start;
  }

  get end(): number {
    return this.start + this.length;
  }

  static findPosition(symbol: TextSymbol, row: Iterable<TextSymbol>): number {
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
  ): PositionedTextSymbol {
    let position = 0;
    for (let el of row) {
      if (position + el.value.length > colInd) {
        return new PositionedTextSymbol(el, position, rowInd);
      }
      position += el.value.length;
    }
    throw `Couldn't find node at position ${colInd}`;
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
}
