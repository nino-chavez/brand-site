/**
 * Animation Performance Test Script
 * Run in browser console to measure FPS during scroll and animations
 */

// Test 1: Scroll FPS measurement
function measureScrollFPS() {
  let frames = 0;
  let lastTime = performance.now();
  const fps = [];

  const measureFrame = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= 1000) {
      const currentFPS = Math.round((frames * 1000) / deltaTime);
      fps.push(currentFPS);
      console.log(`Scroll FPS: ${currentFPS}`);
      frames = 0;
      lastTime = currentTime;
    }

    frames++;
    requestAnimationFrame(measureFrame);
  };

  requestAnimationFrame(measureFrame);

  // Auto-scroll to trigger animations
  let scrollPos = 0;
  const scrollInterval = setInterval(() => {
    scrollPos += 50;
    window.scrollTo(0, scrollPos);

    if (scrollPos >= document.body.scrollHeight - window.innerHeight) {
      clearInterval(scrollInterval);
      setTimeout(() => {
        const avgFPS = Math.round(fps.reduce((a, b) => a + b, 0) / fps.length);
        const minFPS = Math.min(...fps);
        console.log(`\n=== Scroll Performance Results ===`);
        console.log(`Average FPS: ${avgFPS}`);
        console.log(`Minimum FPS: ${minFPS}`);
        console.log(`Target: 60 FPS`);
        console.log(`Status: ${minFPS >= 60 ? '✅ PASS' : minFPS >= 50 ? '⚠️ ACCEPTABLE' : '❌ FAIL'}`);
      }, 1000);
    }
  }, 16); // ~60fps scroll speed
}

// Test 2: Layout thrashing detection
function detectLayoutThrashing() {
  console.log('\n=== Layout Thrashing Detection ===');

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const layoutShifts = entries.filter(entry => entry.duration > 50);

    if (layoutShifts.length > 0) {
      console.log(`⚠️ Detected ${layoutShifts.length} long layout shifts`);
      layoutShifts.forEach(shift => {
        console.log(`  - ${shift.name}: ${shift.duration.toFixed(2)}ms`);
      });
    } else {
      console.log('✅ No layout thrashing detected');
    }
  });

  observer.observe({ entryTypes: ['measure', 'layout-shift'] });
}

// Test 3: Animation frame timing
function testAnimationTiming() {
  console.log('\n=== Animation Frame Timing ===');
  let lastFrameTime = performance.now();
  let frameDeltas = [];
  let frameCount = 0;
  const maxFrames = 300; // 5 seconds at 60fps

  const checkFrame = () => {
    const currentTime = performance.now();
    const delta = currentTime - lastFrameTime;
    frameDeltas.push(delta);
    lastFrameTime = currentTime;
    frameCount++;

    if (frameCount < maxFrames) {
      requestAnimationFrame(checkFrame);
    } else {
      const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
      const maxDelta = Math.max(...frameDeltas);
      const jankFrames = frameDeltas.filter(d => d > 16.67 * 1.5).length; // >25ms = janky

      console.log(`Average frame time: ${avgDelta.toFixed(2)}ms`);
      console.log(`Max frame time: ${maxDelta.toFixed(2)}ms`);
      console.log(`Janky frames: ${jankFrames}/${maxFrames} (${((jankFrames/maxFrames)*100).toFixed(1)}%)`);
      console.log(`Status: ${jankFrames < maxFrames * 0.05 ? '✅ SMOOTH' : '⚠️ SOME JANK DETECTED'}`);
    }
  };

  requestAnimationFrame(checkFrame);
}

// Run all tests
console.log('🎬 Starting Animation Performance Tests...\n');
detectLayoutThrashing();
testAnimationTiming();

// Wait 2s for animation timing test, then run scroll test
setTimeout(() => {
  measureScrollFPS();
}, 2000);

console.log('\n📊 Tests will complete in ~10 seconds...');
