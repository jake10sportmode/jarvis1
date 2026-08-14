// JARVIS - Voice AI Assistant with Settings
const canvas = document.getElementById('orb-canvas');
const ctx = canvas.getContext('2d');

// Settings management
const settings = {
  apiKey: localStorage.getItem('jarvis_api_key') || '',
  language: localStorage.getItem('jarvis_language') || 'en-US',
};

function saveSettings() {
  localStorage.setItem('jarvis_api_key', settings.apiKey);
  localStorage.setItem('jarvis_language', settings.language);
}

// Canvas setup
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
    this.vy += 0.1;
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
let isResponding = false;

// Draw animated orb
function drawOrb() {
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const time = Date.now() / 1000;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
  gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 150, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.fill();

  // Inner core color changes based on state
  let coreColor;
  if (isResponding) {
    coreColor = 'rgba(255, 165, 0, 0.8)'; // Orange when responding
  } else if (isListening) {
    coreColor = 'rgba(0, 255, 100, 0.6)'; // Green when listening
  } else {
    coreColor = 'rgba(0, 255, 255, 0.4)'; // Cyan when idle
  }
  
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
  ctx.fill();

  // Outer rings
  let ringColor;
  if (isResponding) {
    ringColor = 'rgba(255, 165, 0, 0.3)';
  } else if (isListening) {
    ringColor = 'rgba(0, 255, 100, 0.3)';
  } else {
    ringColor = 'rgba(0, 255, 255, 0.2)';
  }
  
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80 + Math.sin(time) * 10, 0, Math.PI * 2);
  ctx.stroke();

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });

  requestAnimationFrame(drawOrb);
}

function emitParticles() {
  if (!isListening && !isResponding) return;
  for (let i = 0; i < 3; i++) {
    const angle = (Math.random() * Math.PI * 2);
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

// Create settings panel (dynamic)
let settingsPanel = null;

function createSettingsPanel() {
  const panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.style.cssText = `
    position: fixed;
    top: 0;
    right: -450px;
    width: 400px;
    max-width: 100vw;
    height: 100vh;
    background: rgba(10, 15, 30, 0.99);
    border-left: 2px solid rgba(0, 255, 255, 0.3);
    z-index: 1000;
    transition: right 0.3s ease;
    overflow-y: auto;
    padding: 30px;
    box-sizing: border-box;
  `;

  panel.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h2 style="color: rgba(0, 255, 255, 0.9); margin: 0 0 30px 0; font-size: 20px; letter-spacing: 3px;">⚙️ SETTINGS</h2>
      
      <div style="margin-bottom: 25px;">
        <label style="display: block; color: rgba(0, 255, 255, 0.7); margin-bottom: 10px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">API KEY</label>
        <input type="password" id="api-key-input" placeholder="Enter your OpenAI API key..." style="
          width: 100%;
          padding: 12px;
          background: rgba(0, 255, 255, 0.08);
          border: 1px solid rgba(0, 255, 255, 0.25);
          border-radius: 8px;
          color: rgba(0, 255, 255, 0.95);
          font-size: 14px;
          box-sizing: border-box;
          font-family: monospace;
        " value="${settings.apiKey}">
        <small style="color: rgba(0, 255, 255, 0.5); display: block; margin-top: 8px; line-height: 1.4;">
          Get your API key from openai.com<br/>This enables JARVIS to understand and respond to your voice.
        </small>
      </div>

      <div style="margin-bottom: 25px;">
        <label style="display: block; color: rgba(0, 255, 255, 0.7); margin-bottom: 10px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">LANGUAGE</label>
        <select id="language-select" style="
          width: 100%;
          padding: 12px;
          background: rgba(0, 255, 255, 0.08);
          border: 1px solid rgba(0, 255, 255, 0.25);
          border-radius: 8px;
          color: rgba(0, 255, 255, 0.95);
          font-size: 14px;
          box-sizing: border-box;
          cursor: pointer;
        ">
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="it-IT">Italian</option>
        </select>
      </div>

      <button id="save-settings" style="
        width: 100%;
        padding: 14px;
        background: rgba(0, 255, 100, 0.25);
        border: 1px solid rgba(0, 255, 100, 0.5);
        border-radius: 8px;
        color: rgba(0, 255, 100, 0.9);
        font-size: 13px;
        cursor: pointer;
        font-weight: bold;
        letter-spacing: 1.5px;
        transition: all 0.2s;
      ">✓ SAVE SETTINGS</button>

      <button id="close-settings" style="
        width: 100%;
        padding: 12px;
        margin-top: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        letter-spacing: 1px;
      ">CLOSE</button>

      <div style="
        margin-top: 40px;
        padding-top: 25px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.8;
      ">
        <p style="margin: 0 0 12px 0;"><strong style="color: rgba(0, 255, 255, 0.7);">HOW IT WORKS</strong></p>
        <p style="margin: 0 0 8px 0;">1. Enter your OpenAI API key</p>
        <p style="margin: 0 0 8px 0;">2. Click the glowing orb to speak</p>
        <p style="margin: 0;">3. JARVIS will respond to you</p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  const apiKeyInput = document.getElementById('api-key-input');
  const languageSelect = document.getElementById('language-select');
  const saveBtn = document.getElementById('save-settings');
  const closeBtn = document.getElementById('close-settings');

  // Set language select to saved value
  languageSelect.value = settings.language;

  saveBtn.addEventListener('click', () => {
    settings.apiKey = apiKeyInput.value;
    settings.language = languageSelect.value;
    saveSettings();
    updateStatus('Settings saved ✓');
    setTimeout(() => closeSettingsPanel(), 800);
  });

  closeBtn.addEventListener('click', closeSettingsPanel);

  function closeSettingsPanel() {
    panel.style.right = '-450px';
    menuDropdown.style.display = 'none';
  }

  function openSettingsPanel() {
    panel.style.right = '0px';
  }

  return { openSettingsPanel, closeSettingsPanel };
}

// Initialize settings panel after DOM is ready
setTimeout(() => {
  settingsPanel = createSettingsPanel();
}, 100);

function updateStatus(text) {
  statusText.textContent = text;
}

function showError(text) {
  errorText.textContent = text;
  setTimeout(() => {
    errorText.textContent = '';
  }, 5000);
}

// Event listeners
btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  btnMute.style.opacity = isMuted ? '0.5' : '1';
  updateStatus(isMuted ? 'Muted' : 'Unmuted');
});

btnMenu.addEventListener('click', () => {
  menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
});

btnSettings.addEventListener('click', (e) => {
  e.stopPropagation();
  if (settingsPanel) {
    settingsPanel.openSettingsPanel();
  }
  menuDropdown.style.display = 'none';
});

btnRestart.addEventListener('click', () => {
  updateStatus('Restarting...');
  setTimeout(() => {
    updateStatus('Ready');
    menuDropdown.style.display = 'none';
  }, 2000);
});

btnFixSelf.addEventListener('click', () => {
  updateStatus('Self-repair initiated...');
  setTimeout(() => {
    updateStatus('Ready');
    menuDropdown.style.display = 'none';
  }, 3000);
});

// Voice input with API response
function initVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showError('Speech recognition not supported');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = settings.language;

  recognition.onstart = () => {
    isListening = true;
    jarvisLabel.classList.add('listening');
    updateStatus('Listening...');
  };

  recognition.onresult = async (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    
    isListening = false;
    updateStatus(`You: ${transcript}`);
    
    // Call API if key is configured
    if (settings.apiKey) {
      await getResponse(transcript);
    } else {
      showError('No API key. Open Settings to add one.');
      updateStatus('Ready');
    }
  };

  recognition.onerror = (event) => {
    showError(`Error: ${event.error}`);
    isListening = false;
  };

  recognition.onend = () => {
    isListening = false;
    jarvisLabel.classList.remove('listening');
  };

  canvas.addEventListener('click', () => {
    if (!isListening && !isMuted && !isResponding) {
      recognition.start();
    }
  });

  return recognition;
}

async function getResponse(userMessage) {
  isResponding = true;
  updateStatus('JARVIS: Processing...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are JARVIS, a helpful AI assistant. Keep responses brief and concise (under 30 words).' },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    updateStatus(`JARVIS: ${reply}`);
    
    // Text to speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reply);
      speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      updateStatus('Ready');
      isResponding = false;
    }, 3000);

  } catch (error) {
    console.error('API Error:', error);
    showError('API Error: Check your key.');
    updateStatus('Ready');
    isResponding = false;
  }
}

// Initialize
const recognition = initVoiceInput();
updateStatus('Ready');
drawOrb();
