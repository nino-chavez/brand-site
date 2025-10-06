// === TOAST UI ===
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1500);
}

// === SHUFFLE UTILITY ===
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// === IMAGE SETUP ===
const landingImage = "images/ncp-landing-001.jpg";
const shuffledPortfolio = Array.from({ length: 19 }, (_, i) => {
  const num = i.toString().padStart(2, '0');
  return `images/portfolio-${num}.jpg`;
});
shuffleArray(shuffledPortfolio);
const imageUrls = [landingImage, ...shuffledPortfolio];

function preloadAllImages(urls) {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

function preloadInitialImages(urls) {
  // Always preload the landing image
  const preloadLanding = new Image();
  preloadLanding.src = urls[0];

  // Preload just the first portfolio image (the next one shown)
  const preloadNext = new Image();
  preloadNext.src = urls[1];
}

preloadInitialImages(imageUrls);


// === STATE ===
let current = 0;
let interval = null;
let isPlaying = true;

const container = document.querySelector('.background-container');
const blur = document.querySelector('.blurred-background');
const overlay = document.querySelector('.overlay-image');

// === DISPLAY LOGIC ===
function setBackground(imageUrl) {
  const img = new Image();
  img.onload = () => {
    const isPortrait = img.height > img.width;

    blur.style.transition = 'none';
    overlay.style.transition = 'none';
    blur.style.opacity = 0;
    overlay.style.opacity = 0;
    void blur.offsetWidth;

    blur.style.transition = 'opacity 0.8s ease, transform 1.5s ease';
    overlay.style.transition = 'opacity 0.8s ease, transform 1.5s ease';

    if (isPortrait) {
      document.body.style.backgroundImage = 'none';
      container.classList.add('portrait-mode');
      blur.style.backgroundImage = `url('${imageUrl}')`;
      overlay.src = imageUrl;
    } else {
      container.classList.remove('portrait-mode');
      overlay.src = '';
      blur.style.backgroundImage = 'none';
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }

    requestAnimationFrame(() => {
      blur.style.opacity = 1;
      overlay.style.opacity = 1;
    });
  };
  img.src = imageUrl;
}

// === AUTOPLAY ===
function advanceToNextImage() {
  current = (current + 1) % imageUrls.length;
  setBackground(imageUrls[current]);
}

function startCarousel() {
  if (!interval) {
    interval = setInterval(advanceToNextImage, 4000);
    isPlaying = true;
    document.getElementById('playBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    showToast("▶️ Autoplay started");
  }
}

function stopCarousel() {
  clearInterval(interval);
  interval = null;
  isPlaying = false;
  document.getElementById('playBtn').style.display = 'inline-block';
  document.getElementById('pauseBtn').style.display = 'none';
  showToast("⏸ Autoplay paused");
}

// === USER NAVIGATION ===
function nextImageManual() {
  if (interval) stopCarousel();
  advanceToNextImage();
  showToast("⏭ Skipped to next");
}

function previousImageManual() {
  if (interval) stopCarousel();
  current = (current - 1 + imageUrls.length) % imageUrls.length;
  setBackground(imageUrls[current]);
  showToast("⏮ Back");
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pauseBtn').addEventListener('click', stopCarousel);
  document.getElementById('playBtn').addEventListener('click', startCarousel);
  document.getElementById('nextBtn').addEventListener('click', nextImageManual);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextImageManual();
    if (e.key === 'ArrowLeft') previousImageManual();
  });

  // Touch gesture
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
    }
  });

  document.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      touchEndX = e.changedTouches[0].clientX;
      handleGesture();
    }
  });

  // Tap to toggle play/pause
document.addEventListener('click', (e) => {
  const ignoreClick =
    e.target.closest('.carousel-controls') ||
    e.target.closest('button') ||
    e.target.closest('.nav-links') ||
    e.target.closest('a');

  if (!ignoreClick) {
    togglePlayPause();
  }
});


  setBackground(imageUrls[current]);
  startCarousel();
});


// === GESTURE HANDLING ===
let touchStartX = null;
let touchEndX = null;
let tapTimeout = null;

function handleGesture() {
  if (touchEndX - touchStartX > 50) {
    // swipe right
    previousImageManual();
  } else if (touchStartX - touchEndX > 50) {
    // swipe left
    nextImageManual();
  }
}

function togglePlayPause() {
  if (isPlaying) {
    stopCarousel();
  } else {
    startCarousel();
  }
  showToast(isPlaying ? "▶️ Autoplay started" : "⏸ Autoplay paused");
}
