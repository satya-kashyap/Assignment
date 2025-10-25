import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  scrollPosition$ = new BehaviorSubject<number>(0);
  viewHeight$ = new BehaviorSubject<number>(window.innerHeight);
  contentHeight$ = new BehaviorSubject<number>(0);

  setScrollPosition(pos: number) {
    this.scrollPosition$.next(pos);
  }
  setHeights(view: number, content: number) {
    this.viewHeight$.next(view);
    this.contentHeight$.next(content);
  }
}
