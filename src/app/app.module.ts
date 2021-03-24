import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TextEditorComponent } from 'src/text-editor/text-editor.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent, TextEditorComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
