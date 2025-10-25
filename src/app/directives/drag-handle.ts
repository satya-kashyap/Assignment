import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDragHandle]'
})

export class DragHandle {
  @Output() dragging = new EventEmitter<number>();
  private draggingFlag = false;
  private lastY = 0;

  constructor(private el: ElementRef) { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.draggingFlag = true;
    this.lastY = e.clientY;
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.onUp);
  }

  onMove = (e: MouseEvent) => {
    if (!this.draggingFlag) return;
    const delta = e.clientY - this.lastY;
    this.lastY = e.clientY;
    this.dragging.emit(delta);
  };

  onUp = () => {
    this.draggingFlag = false;
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('mouseup', this.onUp);
  };

  // Touch support
  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.draggingFlag = true;
    this.lastY = e.touches[0].clientY;
    document.addEventListener('touchmove', this.onTouchMove, { passive: false });
    document.addEventListener('touchend', this.onTouchEnd);
  }

  onTouchMove = (e: TouchEvent) => {
    if (!this.draggingFlag) return;
    e.preventDefault();
    const delta = e.touches[0].clientY - this.lastY;
    this.lastY = e.touches[0].clientY;
    this.dragging.emit(delta);
  };

  onTouchEnd = () => {
    this.draggingFlag = false;
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  };

}

