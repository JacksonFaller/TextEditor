import { ListNode } from '../linked-list/list-node';
import { SymbolType } from '../../enums/symbol-type';
import { TextSymbol } from './text-symbol';

export class PositionedTextSymbol {
  constructor(public node: ListNode<TextSymbol>, public start: number) {}

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
    return this.symbol.row;
  }

  get type(): SymbolType {
    return this.symbol.type;
  }

  get end(): number {
    return this.start + this.length;
  }

  static findPosition(symbol: TextSymbol, row: Iterable<TextSymbol>): number {
    let position = 0;
    for (let el of row) {
      if (el == symbol) break;
      position += el.text.length;
    }
    return position;
  }
}
