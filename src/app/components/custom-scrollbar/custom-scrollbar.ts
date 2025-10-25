import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragHandle } from '../../directives/drag-handle';

@Component({
  selector: 'app-custom-scrollbar',
  standalone: true,
  imports: [CommonModule, DragHandle],
  templateUrl: './custom-scrollbar.html',
  styleUrls: ['./custom-scrollbar.css']

})
export class CustomScrollbar {
  @Input() scrollHeight = 0;
  @Input() viewHeight = 0;
  @Input() scrollPosition = 0;
  @Input() sections: { id: string; label: string }[] = [];
  @Input() activeSection = '';
  @Input() visible = false;
  @Output() scrollChange = new EventEmitter<number>();
  @Output() navigate = new EventEmitter<string>();


  showScrollbar = false;
  showLabels = false;
  hideTimeout: any = null;
  @Input() externalScrollTrigger?: EventEmitter<void>;

  ngOnInit() {
    this.externalScrollTrigger?.subscribe(() => {
      this.showScrollbar = true;
      this.showLabels = false;

      const currentIndex = Math.round(this.scrollPosition / this.scrollPerSection);
      if (this.sections[currentIndex]) {
        this.activeSection = this.sections[currentIndex].id;
      }

      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        this.showScrollbar = false;
      }, 1000);
    });
  }
  private get scrollPerSection(): number {
    if (this.sections.length <= 1) return 0;
    return (this.scrollHeight - this.viewHeight) / (this.sections.length - 1);
  }

  private get currentSectionIndex(): number {
    const index = Math.round(this.scrollPosition / this.scrollPerSection);
    return Math.max(0, Math.min(index, this.sections.length - 1));
  }

  get scrollProgressPercent(): number {
    if (this.sections.length <= 1) return 0;
    const ratio = this.scrollPosition / (this.scrollHeight - this.viewHeight);
    return Math.min(100, Math.max(0, ratio * 100));
  }

  get handleHeightPx(): number {
    const ratio = this.viewHeight / this.scrollHeight;
    return Math.max(30, ratio * this.viewHeight);
  }

  get handleTopPx(): number {
    const max = this.viewHeight - this.handleHeightPx;
    const posRatio = this.currentSectionIndex / (this.sections.length - 1);
    return posRatio * max;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const screenWidth = window.innerWidth;
    const distanceFromRight = screenWidth - event.clientX;

    if (distanceFromRight < 250) {
      this.showScrollbar = true;

      this.showLabels = distanceFromRight < 120;

      clearTimeout(this.hideTimeout);
    } else {
      this.showLabels = false;
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        this.showScrollbar = false;
      }, 800);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showScrollbar = true;
    this.showLabels = false;

    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.showScrollbar = false;
    }, 800);
  }

  onHandleDrag(event: { dy: number }) {
    const trackHeight = this.viewHeight;
    const ratio = this.scrollHeight / trackHeight;
    const newPos = Math.min(
      this.scrollHeight - this.viewHeight,
      Math.max(0, this.scrollPosition + event.dy * ratio)
    );
    const nearestIndex = Math.round(newPos / this.scrollPerSection);
    this.scrollPosition = nearestIndex * this.scrollPerSection;

    this.scrollChange.emit(this.scrollPosition);
    this.activeSection = this.sections[nearestIndex]?.id || this.activeSection;
  }

  onTrackClick(event: MouseEvent | TouchEvent) {
    const track = event.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const clickY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    const rel = (clickY - rect.top) / rect.height;
    const targetIndex = Math.round(rel * (this.sections.length - 1));
    this.navigateToIndex(targetIndex);
  }

  onNavigate(id: string) {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx >= 0) this.navigateToIndex(idx);
  }

  private navigateToIndex(index: number) {
    const targetPos = index * this.scrollPerSection;
    this.scrollPosition = targetPos;
    this.scrollChange.emit(this.scrollPosition);
    this.navigate.emit(this.sections[index].id);
  }
}
