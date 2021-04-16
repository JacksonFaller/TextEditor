import { SymbolType } from '../../enums/symbol-type';

export class TextSymbol {
  constructor(public type: SymbolType, public text: string) {}

  public static tabWidth = 2;
  public static tabAsSpaces = true;

  get length(): number {
    return this.text.length;
  }

  static get whitespace(): TextSymbol {
    return new TextSymbol(SymbolType.Whitespace, ' ');
  }

  static get tab(): TextSymbol {
    return new TextSymbol(SymbolType.Tab, this.tabAsSpaces ? ' '.repeat(this.tabWidth) : '\t');
  }

  static get empty(): TextSymbol {
    return new TextSymbol(SymbolType.Plain, '');
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
      before: new TextSymbol(SymbolType.Plain, this.text.slice(0, index)),
      after: new TextSymbol(SymbolType.Plain, this.text.slice(index)),
    };
  }

  prepend(text: string) {
    this.text = text + this.text;
  }

  isTabOrWhitespace() {
    return this.type == SymbolType.Tab || this.type == SymbolType.Whitespace;
  }

  isPlainOrKey(): boolean {
    return this.type === SymbolType.Plain || this.type == SymbolType.Keyword;
  }
}
