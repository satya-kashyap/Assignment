import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-cover',
  standalone: true,
  templateUrl: './cover.html',
  styleUrls: ['./cover.css']
})
export class Cover implements AfterViewInit {
  @ViewChild('photoWrapper', { static: true }) photoWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('coverImg', { static: true }) coverImg!: ElementRef<HTMLImageElement>;
  @ViewChild('line1', { static: true }) line1!: ElementRef<HTMLDivElement>;
  @ViewChild('line2', { static: true }) line2!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    const tl = gsap.timeline();

    // Step 1: Image rises from bottom
    tl.to(this.photoWrapper.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 2.5,
      ease: 'power3.out'
    });

    // Step 2: Image clears from blur
    tl.fromTo(
      this.coverImg.nativeElement,
      { filter: 'blur(12px)', opacity: 0.6 },
      { filter: 'blur(0px)', opacity: 1, duration: 2, ease: 'power2.out' },
      '-=2'
    );

    // Step 3: Fade in first line
    tl.to(
      this.line1.nativeElement,
      { opacity: 1, y: -10, duration: 1.2, ease: 'power2.out' },
      '+=0.6'
    );

    // Step 4: Fade in second line
    tl.to(
      this.line2.nativeElement,
      { opacity: 1, y: -5, duration: 1.0, ease: 'power1.out' },
      '+=0.4'
    );
  }
}
