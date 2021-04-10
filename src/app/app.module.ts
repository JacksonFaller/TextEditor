import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextEditorModule } from './modules/text-editor/text-editor.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, TextEditorModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
