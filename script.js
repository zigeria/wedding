(function(){
  const WEDDING_DATE = new Date('2025-12-09T15:40:00+03:00'); // измените при необходимости

  // Countdown
  const cd = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };
  function updateTimer(){
    if(!cd.days) return;
    const now = new Date();
    let diff = WEDDING_DATE - now;
    if(diff < 0) diff = 0;
    const sec = Math.floor(diff/1000);
    const days = Math.floor(sec/86400);
    const hours = Math.floor((sec%86400)/3600);
    const mins = Math.floor((sec%3600)/60);
    const secs = sec%60;
    cd.days.textContent = days;
    cd.hours.textContent = hours.toString().padStart(2,'0');
    cd.mins.textContent = mins.toString().padStart(2,'0');
    cd.secs.textContent = secs.toString().padStart(2,'0');
  }
  updateTimer();
  setInterval(updateTimer,1000);


  // Smooth Scroll Animation
  const animatedElements = [
    document.querySelector('.separator-car'),
    document.querySelector('.separator-gorilla')
  ].filter(el => el);

  if (animatedElements.length > 0) {
    let elementsData = [];
    let windowHeight = window.innerHeight;
    let lastWidth = window.innerWidth;

    function cacheDimensions() {
      // Add a buffer to windowHeight to ensure animation starts before element enters viewport
      // This prevents "dead zones" on mobile when the address bar retracts (making viewport taller than cached height)
      windowHeight = window.innerHeight + 200;
      lastWidth = window.innerWidth;
      
      elementsData = animatedElements.map(el => {
        // Reset transform to get accurate original position
        el.style.transform = 'none';
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        return {
          el: el,
          absoluteTop: absoluteTop,
          height: rect.height
        };
      });
      updatePositions();
    }

    function onResize() {
      // On mobile, scrolling triggers resize (address bar). 
      // We don't want to reset transforms or recalculate height then as it causes stutter/jumps.
      // Only recalculate if width changes (e.g. orientation change).
      if (window.innerWidth !== lastWidth) {
        cacheDimensions();
      }
    }

    function updatePositions() {
      const scrollY = window.scrollY;
      
      elementsData.forEach(item => {
        const rectTop = item.absoluteTop - scrollY;
        
        const totalDistance = windowHeight + item.height;
        const traveled = windowHeight - rectTop;
        let progress = traveled / totalDistance;

        const moveRange = 120; 
        let translateX = (progress * moveRange) - (moveRange / 2);
        
        // Ensure elements off-screen are positioned at their start/end points
        // instead of resetting to center (which caused the jump)
        if (progress < 0) translateX = -moveRange / 2;
        else if (progress > 1) translateX = moveRange / 2;
        
        // Use translate3d for GPU acceleration
        item.el.style.transform = `translate3d(${translateX}vw, 0, 0)`;
      });
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updatePositions();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    // Initialize
    cacheDimensions();
    // Re-calculate on load to ensure images are loaded and layout is final
    window.addEventListener('load', cacheDimensions);
  }

  // Google Form Height Adjuster
  const iframe = document.getElementById('google-form-iframe');
  if (iframe) {
    // Define the heights for each stage (Desktop vs Mobile)
    const formHeightsDesktop = [200, 900, 3700, 900];
    const formHeightsMobile = [300, 1200, 5000, 1200]; // Increased for mobile text wrapping
    
    let currentStage = 0;

    function updateIframeHeight() {
      const isMobile = window.innerWidth <= 768;
      const heights = isMobile ? formHeightsMobile : formHeightsDesktop;
      
      // Use the height for the current stage, or the last one if we exceeded
      const index = Math.min(currentStage, heights.length - 1);
      iframe.style.height = heights[index] + 'px';
    }

    // Set initial height
    updateIframeHeight();

    iframe.addEventListener('load', () => {
      currentStage++;
      updateIframeHeight();
    });

    // Update on resize (e.g. orientation change)
    window.addEventListener('resize', updateIframeHeight);
  }
})();
