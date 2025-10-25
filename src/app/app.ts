import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ScrollContainer } from './components/scroll-container/scroll-container';

@Component({
  selector: 'app-root',
  imports: [ScrollContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  constructor() { }

}
