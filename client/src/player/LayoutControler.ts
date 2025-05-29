
function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const left = document.getElementById('left');
    const middle = document.getElementById('middle');
    const bottom = document.getElementById('bottom');
    
    if (!left || !middle || !bottom) {
      console.error('LayoutControler: left, middle, or bottom element not found');
      return;
    }

    // Check if mobile (portrait orientation)
    const isMobile = h > w;
    
    if (isMobile) {
      // Mobile layout - hide left sidebar, make bottom 40%
      const topHeight = h * 0.75;
      const bottomHeight = h * 0.25;
      
      // Hide left sidebar
      left.style.position = 'fixed';
      left.style.left = '-100%';
      left.style.top = '0px';
      left.style.width = '0px';
      left.style.height = '0px';
      left.style.display = 'none';
      
      // Middle takes full width
      middle.style.position = 'fixed';
      middle.style.left = '0px';
      middle.style.top = '0px';
      middle.style.width = `${w}px`;
      middle.style.height = `${topHeight}px`;
      
      // Bottom takes 40% height
      bottom.style.position = 'fixed';
      bottom.style.left = '0px';
      bottom.style.top = `${topHeight}px`;
      bottom.style.width = `${w}px`;
      bottom.style.height = `${bottomHeight}px`;
    } else {
      // Desktop layout - original layout
      const leftWidth = w * 0.2;
      const topHeight = h * 0.85;
      const bottomHeight = h * 0.15;
      
      // Show left sidebar
      left.style.display = 'flex';
      left.style.position = 'fixed';
      left.style.left = '0px';
      left.style.top = '0px';
      left.style.width = `${leftWidth}px`;
      left.style.height = `${topHeight}px`;
      
      middle.style.position = 'fixed';
      middle.style.left = `${leftWidth}px`;
      middle.style.top = '0px';
      middle.style.width = `${w - leftWidth}px`;
      middle.style.height = `${topHeight}px`;
      
      bottom.style.position = 'fixed';
      bottom.style.left = '0px';
      bottom.style.top = `${topHeight}px`;
      bottom.style.width = `${w}px`;
      bottom.style.height = `${bottomHeight}px`;
    }
  }

  window.addEventListener('resize', layout);
  window.addEventListener('DOMContentLoaded', layout);
  layout();