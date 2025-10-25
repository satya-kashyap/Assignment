import {
  Component, AfterViewInit, ElementRef, ViewChild, NgZone, HostListener, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Intro } from '../sections/intro/intro';
import { Preface } from '../sections/preface/preface';
import { Timeline } from '../sections/timeline/timeline';
import { Outro } from '../sections/outro/outro';
import { CustomScrollbar } from '../custom-scrollbar/custom-scrollbar';
import { ScrollService } from '../../services/scroll';
import { Cover } from "../sections/cover/cover";

gsap.registerPlugin(ScrollToPlugin);

@Component({
  selector: 'app-scroll-container',
  standalone: true,
  imports: [CommonModule, Intro, Preface, Timeline, Outro, CustomScrollbar, Cover],
  templateUrl: './scroll-container.html',
  styleUrls: ['./scroll-container.css']
})
export class ScrollContainer implements AfterViewInit {
  @ViewChild('content', { static: true }) content!: ElementRef<HTMLDivElement>;

  currentIndex = 0;
  viewHeight = window.innerHeight;
  hasScrolled = false;
  scrolling = false;
  lastTouchY = 0;

  parts = [
    { id: 'cover', label: '' },     // part 0 - COVER (no label shown in right nav)
    { id: 'intro', label: 'Intro' },     // part 1 - Intro content
    { id: 'preface', label: 'Preface' }, // part 2
    { id: 'events', label: 'Events' },   // part 3
    { id: 'credits', label: 'Credits' }    // part 4 - last
  ];


  navItems = this.parts.slice(1);

  activeSection = this.parts[1].id;

  @Output() scrollActive = new EventEmitter<void>();

  constructor(private ngZone: NgZone, private scrollService: ScrollService) { }

  ngAfterViewInit() {
    this.viewHeight = window.innerHeight;
    gsap.set(this.content.nativeElement, { y: 0 });
    this.setupSectionStyles();
  }

  private setupSectionStyles() {
    const sections = (this.content.nativeElement.querySelectorAll('section') as NodeListOf<HTMLElement>);
    (Array.from(sections) as HTMLElement[]).forEach((sec, i) => {
      sec.style.minHeight = `${this.viewHeight}px`;
      if (i === sections.length - 1) {
        sec.style.paddingBottom = '120px';
      }
    });
  }

  onWheel(e: WheelEvent) {
    if (this.scrolling) return;
    e.preventDefault();
    if (e.deltaY > 0) this.moveToNext();
    else this.moveToPrev();
  }

  onTouchStart(e: TouchEvent) {
    this.lastTouchY = e.touches[0].clientY;
  }

  onTouchMove(e: TouchEvent) {
    if (this.scrolling) return;
    const y = e.touches[0].clientY;
    const delta = this.lastTouchY - y;
    if (Math.abs(delta) > 40) {
      if (delta > 0) this.moveToNext();
      else this.moveToPrev();
      this.lastTouchY = y;
    }
  }

  private moveToNext() {
    if (this.currentIndex < this.parts.length - 1) {
      this.currentIndex++;
      this.animateToPart(this.currentIndex);
    }
  }

  private moveToPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.animateToPart(this.currentIndex);
    }
  }

  private animateToPart(index: number) {
    if (this.scrolling) return;
    this.scrolling = true;
    const targetY = -index * this.viewHeight;

    gsap.to(this.content.nativeElement, {
      y: targetY,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.scrollActive.emit();
      },
      onComplete: () => {
        this.scrolling = false;
        this.hasScrolled = true;
        this.activeSection = this.parts[Math.min(index, this.parts.length - 1)].id;
      }
    });
  }

  onNavigate(navId: string) {
    const navIndex = this.navItems.findIndex(n => n.id === navId);
    if (navIndex === -1) return;
    const targetPartIndex = navIndex + 1;
    if (targetPartIndex === this.currentIndex) return;
    this.currentIndex = targetPartIndex;
    this.animateToPart(this.currentIndex);
  }

  @HostListener('window:resize')
  onResize() {
    this.viewHeight = window.innerHeight;
    gsap.set(this.content.nativeElement, { y: -this.currentIndex * this.viewHeight });
    this.setupSectionStyles();
  }
}
