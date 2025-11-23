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


  // Car animation on scroll
  function setupScrollAnimation(selector) {
    const el = document.querySelector(selector);
    if (el) {
      function updatePosition() {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;
        
        // Calculate progress: 0 when entering from bottom, 1 when leaving at top
        const totalDistance = windowHeight + elementHeight;
        const traveled = windowHeight - rect.top;
        let progress = traveled / totalDistance;

        // Map progress 0..1 to translateX
        // We want it to move from left (-60vw) to right (60vw)
        const moveRange = 120; 
        const translateX = (progress * moveRange) - (moveRange / 2);
        
        el.style.transform = `translateX(${translateX}vw)`;
      }

      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      // Initial call to set position
      updatePosition();
    }
  }

  setupScrollAnimation('.separator-car');
  setupScrollAnimation('.separator-gorilla');
})();
