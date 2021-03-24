import { SymbolType } from './symbol-type';

export class TextSymbol {
  type: SymbolType;
  text: string;
  range: Array<number>;

  constructor(type: SymbolType, text: string, pos: number) {
    this.type = type;
    this.text = text;
    this.range = [pos, pos + text.length - 1];
  }

  static whitespace(pos: number): TextSymbol {
    return new TextSymbol(SymbolType.Whitespace, ' ', pos);
  }
}
