import { Component, HostListener, OnInit } from '@angular/core';
import { SymbolType } from './enums/symbol-type';
import { EditorState } from './models/editor-state';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit {
  constructor() {}

  SymbolType = SymbolType;
  fontSize = 14.55;
  state: EditorState = new EditorState();

  ngOnInit(): void {}

  @HostListener('document:click')
  clickout() {
    this.state.clickout();
  }

  @HostListener('document:keydown', ['$event'])
  textInput(e: Event) {
    if (this.state.focused) {
      this.state.keyDown(e as KeyboardEvent);
    }
    return !this.state.focused;
  }

  getClass(type: SymbolType): string {
    return SymbolType[type].toLowerCase();
  }
}
