import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TextSymbol } from '../models/text-symbol';
import { SymbolType } from '../models/symbol-type';
import { Cursor } from 'src/text-editor/cursor';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit {
  constructor() {}

  rows: Array<Array<TextSymbol>> = [];
  SymbolType = SymbolType;
  curSymbol: TextSymbol | undefined;
  fontSize = 14.55;
  cursor = new Cursor();

  ngOnInit(): void {
    this.curSymbol = new TextSymbol(
      SymbolType.Plain,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit',
      0,
    );
    this.rows.push([this.curSymbol]);
    this.rows.push([this.curSymbol]);
    this.rows.push([this.curSymbol]);
    this.rows.push([this.curSymbol]);
  }

  textContainerClick(e: Event) {
    let event = e as MouseEvent;
    // checking for left-click
    if (event.button != 0) {
      return;
    }
    const element = event.target as HTMLElement;
    if (element.className == 'text-container') {
      const last = this.rows.length - 1;
      this.cursor.moveToRow(last, this.getRowLength(last));
    } else if (element.className == 'row') {
      // const rect = element.getBoundingClientRect();
      //const col = this.cursor.findColumnIndex(event.clientX - rect.left);
      const row = this.cursor.findRowIndexByAttribute(element);
      this.cursor.moveToRow(row, this.getRowLength(row));
    } else {
      this.cursor.moveCursor(event.clientX, event.clientY, element);
    }
    this.cursor.animate();
  }

  getRowLength(row: number): number {
    /// TODO: consider caching length of rows
    let rowLength = 0;
    this.rows[row].forEach((symbol) => {
      rowLength += symbol.text.length;
    });
    return rowLength;
  }

  blur() {
    console.error('pepega');
    this.cursor.hide();
  }

  textInput(e: Event) {
    let event = e as KeyboardEvent;
    if (event.isComposing) {
      return;
    }

    console.error(event.key);
  }

  getClass(type: SymbolType): string {
    switch (type) {
      case SymbolType.Keyword:
        return 'keyword';
      case SymbolType.Plain:
        return 'plain';
      default:
        throw `Couldn't find class for a ${type} symbol`;
    }
  }
}
