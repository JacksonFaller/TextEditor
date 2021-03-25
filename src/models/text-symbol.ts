import { Interval } from 'src/text-editor/position';
import { SymbolType } from './symbol-type';

export class TextSymbol {
  type: SymbolType;
  text: string;
  range: Interval;
  row = 0;

  constructor(type: SymbolType, text: string, pos: number) {
    this.type = type;
    this.text = text;
    this.range = new Interval(pos, pos + text.length - 1);
  }

  static whitespace(pos: number): TextSymbol {
    return new TextSymbol(SymbolType.Whitespace, ' ', pos);
  }

  removeRange(start: number, end: number) {
    this.text = this.text.slice(0, start) + this.text.slice(end);
  }

  insert(pos: number, str: string) {
    this.text = `${this.text.slice(0, pos)}${str}${this.text.slice(pos)}`;
  }

  withinRange(ind: number) {
    return this.range.start <= ind && ind <= this.range.end + 1;
  }
}
