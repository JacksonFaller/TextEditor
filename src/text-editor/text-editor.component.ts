import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SymbolType } from '../models/symbol-type';
import { EditorState } from './editor-state';

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
