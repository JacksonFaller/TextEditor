import { SymbolType } from '../../enums/symbol-type';

export class TextSymbol {
  constructor(public type: SymbolType, public text: string, public row: number) {}

  public static tabWidth = 2;
  public static tabAsSpaces = true;

  get length(): number {
    return this.text.length;
  }

  static whitespace(row: number): TextSymbol {
    return new TextSymbol(SymbolType.Whitespace, ' ', row);
  }

  static tab(row: number): TextSymbol {
    return new TextSymbol(SymbolType.Tab, this.tabAsSpaces ? ' '.repeat(this.tabWidth) : '\t', row);
  }

  removeRange(start: number, end: number) {
    this.text = this.text.slice(0, start) + this.text.slice(end);
  }

  insert(index: number, str: string) {
    this.text = `${this.text.slice(0, index)}${str}${this.text.slice(index)}`;
  }

  split(index: number): { before: TextSymbol; after: TextSymbol } {
    if (index >= this.length) {
      throw `Index out of range, can't split symbol`;
    }

    return {
      before: new TextSymbol(SymbolType.Plain, this.text.slice(0, index), this.row),
      after: new TextSymbol(SymbolType.Plain, this.text.slice(index), this.row),
    };
  }

  isTabOrWhitespace() {
    return this.type == SymbolType.Tab || this.type == SymbolType.Whitespace;
  }
}
