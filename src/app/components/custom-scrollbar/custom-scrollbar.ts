import { Component, Input, Output, EventEmitter, HostListener, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { gsap } from 'gsap';

@Component({
  selector: 'app-custom-scrollbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-scrollbar.html',
  styleUrls: ['./custom-scrollbar.css']
})
export class CustomScrollbar {
  @Input() sections: { id: string; label: string }[] = [];
  @Input() activeSection = '';
  @Input() progressSegments: number[] = [];
  @Output() navigate = new EventEmitter<string>();
  @Input() overallProgress = 0;
  @Input() scrollposition = 0;
  @Input() sectionPositions: number[] = [];
 
  isHovered = false;
  hasScrolled = false;
  scrollTimeout: any;

  @HostListener('window:scroll')
  onScroll() {
    this.hasScrolled = true;

    // Target specific scrollbar elements
    const scrollBarLabel = document.querySelector('.scrollbar-label');
    const scrollBarTrack = document.querySelector('.scrollbar-track');
    const scrollBarLabels = document.querySelector('.scrollbar-labels');

    if (!scrollBarLabel || !scrollBarTrack) return;

    // Show scrollbar elements immediately when user scrolls with smooth fade-in
    gsap.to([scrollBarLabel, scrollBarTrack], {
      autoAlpha: 1,
      duration: 0.4,
      ease: 'power3.out',
      stagger: 0.08, // Elegant staggered appearance
    });

    // Clear any previous timeout
    clearTimeout(this.scrollTimeout);

    // Set timeout to fade out after user stops scrolling with smooth transition
    this.scrollTimeout = setTimeout(() => {
      if (!this.isHovered) { // Don't hide if hovering
        gsap.to([scrollBarLabel, scrollBarTrack], {
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power3.out', // Smoother easing curve
          stagger: 0.05, // Very slight stagger for elegance
        });
      }
    }, 1800); // Longer delay for better user experience
  }

  // Handle hover events for scrollbar
  onScrollbarHover(isHovering: boolean) {
    this.isHovered = isHovering;
    
    const scrollBarLabel = document.querySelector('.scrollbar-label');
    const scrollBarTrack = document.querySelector('.scrollbar-track');
    const scrollBarLabels = document.querySelector('.scrollbar-labels');

    if (isHovering) {
      // Show all elements on hover
      gsap.to([scrollBarLabel, scrollBarTrack], {
        autoAlpha: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
      
      // Show labels with slight delay
      gsap.to(scrollBarLabels, {
        autoAlpha: 1,
        duration: 0.3,
        delay: 0.1,
        ease: 'power2.out'
      });

      // Clear timeout while hovering
      clearTimeout(this.scrollTimeout);
    } else {
      // Hide labels immediately when not hovering
      gsap.to(scrollBarLabels, {
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power2.in'
      });

      // Start fade out timer for main elements with smooth transition
      this.scrollTimeout = setTimeout(() => {
        if (this.hasScrolled) {
          gsap.to([scrollBarLabel, scrollBarTrack], {
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            stagger: 0.1, 
            onComplete: () => {
              
            }
          });
        }
      }, 1200); // Slightly longer delay for better UX
    }
  }

  getActiveLabel(): string {
    const active = this.sections.find(s => s.id === this.activeSection);
    return active?.label || '';
  }

  showMobileBar = false;
  @Output() toggleBar = new EventEmitter<boolean>();

  toggleMobileBar() {
    this.showMobileBar = !this.showMobileBar;
    this.toggleBar.emit(this.showMobileBar);
  }

  // for mobile touch dragging...
  private isDragging = false;
  private barHeight = 0;
  private startY = 0;

  // for desktop mouse dragging...
  isDesktopDragging = false;
  private desktopStartY = 0;
  private trackElement: HTMLElement | null = null;

  onTouchStart(event: TouchEvent) {
    if (window.innerWidth >= 768) return;
    this.isDragging = true;
    this.barHeight = (event.target as HTMLElement).clientHeight;
    this.startY = event.touches[0].clientY;
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const touchY = event.touches[0].clientY - this.startY;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const newScroll = (touchY / this.barHeight) * scrollHeight;
    window.scrollTo({ top: Math.min(scrollHeight, Math.max(0, newScroll)), behavior: 'auto' });
  }

  onTouchEnd() {
    this.isDragging = false;
  }

  // Desktop mouse events for dragging
  onMouseDown(event: MouseEvent) {
    if (window.innerWidth < 768) return; // Only for desktop
    
    this.isDesktopDragging = true;
    this.trackElement = event.target as HTMLElement;
    this.desktopStartY = event.clientY;
    
    // Get the track height
    const trackEl = document.querySelector('.scrollbar-track') as HTMLElement;
    if (trackEl) {
      this.barHeight = trackEl.clientHeight;
    }
    
    // Prevent text selection during drag
    event.preventDefault();
    document.body.style.userSelect = 'none';
    
    // Add global mouse move and up listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isDesktopDragging) return;
    
    const trackEl = document.querySelector('.scrollbar-track') as HTMLElement;
    if (!trackEl) return;
    
    // Get track position and dimensions
    const trackRect = trackEl.getBoundingClientRect();
    const relativeY = event.clientY - trackRect.top;
    
    // Calculate scroll percentage based on mouse position within track
    const scrollPercentage = Math.max(0, Math.min(1, relativeY / trackRect.height));
    
    // Calculate and set scroll position
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const newScrollTop = scrollPercentage * scrollHeight;
    
    window.scrollTo({ 
      top: newScrollTop, 
      behavior: 'auto' 
    });
    
    event.preventDefault();
  }

  private handleMouseUp = (event: MouseEvent) => {
    if (!this.isDesktopDragging) return;
    
    this.isDesktopDragging = false;
    document.body.style.userSelect = '';
    
    // Remove global listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    event.preventDefault();
  }

  // Click to seek functionality
  onDesktopTrackClick(event: MouseEvent) {
    if (this.isDesktopDragging) return; // Don't seek if we're dragging
    
    const trackEl = event.currentTarget as HTMLElement;
    const trackRect = trackEl.getBoundingClientRect();
    const clickY = event.clientY - trackRect.top;
    
    // Calculate scroll percentage based on click position
    const scrollPercentage = Math.max(0, Math.min(1, clickY / trackRect.height));
    
    // Calculate and smoothly scroll to position
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const targetScrollTop = scrollPercentage * scrollHeight;
    
    window.scrollTo({ 
      top: targetScrollTop, 
      behavior: 'smooth' 
    });
  }

  // Mobile seek-to-scroll functionality
onMobileTrackClick(event: MouseEvent) {
  // Prevent interfering with drag
  if (this.isDragging) return;

  const trackEl = event.currentTarget as HTMLElement;
  const trackRect = trackEl.getBoundingClientRect();
  const clickY = event.clientY - trackRect.top;

  // Scrollable page height
  const scrollHeight = document.body.scrollHeight - window.innerHeight;

  // Where to scroll (percentage of track height)
  const scrollPercent = Math.max(0, Math.min(1, clickY / trackRect.height));
  const newScrollTop = scrollPercent * scrollHeight;

  // Scroll smoothly
  window.scrollTo({
    top: newScrollTop,
    behavior: 'smooth'
  });
}



}



