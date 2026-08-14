// JARVIS - Voice AI Assistant
// Canvas setup for animated orb
const canvas = document.getElementById('orb-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Orb particle system
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1;
    this.decay = Math.random() * 0.01 + 0.005;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vy += 0.1; // Gravity
  }

  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

let particles = [];
let isListening = false;
let isMuted = false;

// Draw animated orb
function drawOrb() {
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const time = Date.now() / 1000;

  // Draw glowing orb
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
  gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.fill();

  // Inner core
  ctx.fillStyle = isListening ? 'rgba(0, 255, 100, 0.6)' : 'rgba(0, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
  ctx.fill();

  // Outer rings
  ctx.strokeStyle = isListening ? 'rgba(0, 255, 100, 0.3)' : 'rgba(0, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80 + Math.sin(time) * 10, 0, Math.PI * 2);
  ctx.stroke();

  // Update and draw particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });

  requestAnimationFrame(drawOrb);
}

// Emit particles when listening
function emitParticles() {
  if (!isListening) return;
  for (let i = 0; i < 3; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const speed = Math.random() * 3 + 2;
    const x = canvas.width / 2 + Math.cos(angle) * 40;
    const y = canvas.height / 2 + Math.sin(angle) * 40;
    particles.push(new Particle(x, y));
  }
}
setInterval(emitParticles, 50);

// UI Elements
const statusText = document.getElementById('status-text');
const errorText = document.getElementById('error-text');
const jarvisLabel = document.getElementById('jarvis-label');
const btnMute = document.getElementById('btn-mute');
const btnMenu = document.getElementById('btn-menu');
const menuDropdown = document.getElementById('menu-dropdown');
const btnSettings = document.getElementById('btn-settings');
const btnRestart = document.getElementById('btn-restart');
const btnFixSelf = document.getElementById('btn-fix-self');

// Update status
function updateStatus(text) {
  statusText.textContent = text;
}

// Show error
function showError(text) {
  errorText.textContent = text;
  setTimeout(() => {
    errorText.textContent = '';
  }, 5000);
}

// Mute button
btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  btnMute.style.opacity = isMuted ? '0.5' : '1';
  updateStatus(isMuted ? 'Muted' : 'Unmuted');
});

// Menu button
btnMenu.addEventListener('click', () => {
  menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
});

// Menu options
btnSettings.addEventListener('click', () => {
  updateStatus('Settings opened');
  menuDropdown.style.display = 'none';
});

btnRestart.addEventListener('click', () => {
  updateStatus('Restarting...');
  setTimeout(() => {
    updateStatus('Ready');
  }, 2000);
  menuDropdown.style.display = 'none';
});

btnFixSelf.addEventListener('click', () => {
  updateStatus('Self-repair initiated...');
  setTimeout(() => {
    updateStatus('Ready');
  }, 3000);
  menuDropdown.style.display = 'none';
});

// Voice input (placeholder - requires Web Speech API)
function initVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showError('Speech recognition not supported in this browser');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    jarvisLabel.classList.add('listening');
    updateStatus('Listening...');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    updateStatus(`You said: ${transcript}`);
    
    // Simulate response
    setTimeout(() => {
      updateStatus('JARVIS: Processing...');
      setTimeout(() => {
        updateStatus('Ready');
      }, 1500);
    }, 500);
  };

  recognition.onerror = (event) => {
    showError(`Error: ${event.error}`);
  };

  recognition.onend = () => {
    isListening = false;
    jarvisLabel.classList.remove('listening');
    if (statusText.textContent !== 'Ready') {
      updateStatus('Ready');
    }
  };

  // Start listening on click
  canvas.addEventListener('click', () => {
    if (!isListening && !isMuted) {
      recognition.start();
    }
  });
}

// Initialize
initVoiceInput();
updateStatus('Ready');
drawOrb();
