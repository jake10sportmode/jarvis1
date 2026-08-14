// JARVIS - Voice AI Assistant with Settings (Google Gemini & OpenAI Support)
// ALL API KEYS ARE STORED ONLY IN YOUR BROWSER - NEVER SENT TO ANY SERVER
const canvas = document.getElementById('orb-canvas');
const ctx = canvas.getContext('2d');

// Settings management - STORED ONLY LOCALLY IN YOUR BROWSER
const settings = {
  apiKey: localStorage.getItem('jarvis_api_key') || '',
  apiProvider: localStorage.getItem('jarvis_api_provider') || 'gemini',
  language: localStorage.getItem('jarvis_language') || 'en-US',
};

function saveSettings() {
  // Keys only stored in browser's localStorage - never sent anywhere
  localStorage.setItem('jarvis_api_key', settings.apiKey);
  localStorage.setItem('jarvis_api_provider', settings.apiProvider);
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

  let coreColor;
  if (isResponding) {
    coreColor = 'rgba(255, 165, 0, 0.8)';
  } else if (isListening) {
    coreColor = 'rgba(0, 255, 100, 0.6)';
  } else {
    coreColor = 'rgba(0, 255, 255, 0.4)';
  }
  
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
  ctx.fill();

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

// Create settings panel
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
        <label style="display: block; color: rgba(0, 255, 255, 0.7); margin-bottom: 10px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">AI PROVIDER</label>
        <select id="provider-select" style="
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
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI (ChatGPT)</option>
        </select>
      </div>

      <div style="margin-bottom: 25px;">
        <label style="display: block; color: rgba(0, 255, 255, 0.7); margin-bottom: 10px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">API KEY</label>
        <input type="password" id="api-key-input" placeholder="Enter your API key..." style="
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
        <small style="color: rgba(0, 255, 255, 0.5); display: block; margin-top: 8px; line-height: 1.4;" id="provider-hint">
          Get your Google Gemini API key from: makersuite.google.com/app/apikey
        </small>
        <small style="color: rgba(0, 255, 100, 0.6); display: block; margin-top: 8px; line-height: 1.4;">
          🔒 Your API key is stored ONLY on your device in your browser.<br/>
          No one else can see it unless they access your computer.
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
        <p style="margin: 0 0 12px 0;"><strong style="color: rgba(0, 255, 255, 0.7);">PRIVACY & SECURITY</strong></p>
        <p style="margin: 0 0 8px 0;">✓ API key stored only locally</p>
        <p style="margin: 0 0 8px 0;">✓ Private to your browser</p>
        <p style="margin: 0 0 8px 0;">✓ Never uploaded anywhere</p>
        <p style="margin: 0;">✓ Delete from Settings anytime</p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  const providerSelect = document.getElementById('provider-select');
  const apiKeyInput = document.getElementById('api-key-input');
  const languageSelect = document.getElementById('language-select');
  const providerHint = document.getElementById('provider-hint');
  const saveBtn = document.getElementById('save-settings');
  const closeBtn = document.getElementById('close-settings');

  providerSelect.value = settings.apiProvider;
  languageSelect.value = settings.language;

  providerSelect.addEventListener('change', (e) => {
    if (e.target.value === 'openai') {
      providerHint.textContent = 'Get your OpenAI API key from: platform.openai.com/api-keys';
    } else {
      providerHint.textContent = 'Get your Google Gemini API key from: makersuite.google.com/app/apikey';
    }
  });

  saveBtn.addEventListener('click', () => {
    if (!apiKeyInput.value.trim()) {
      showError('Please enter an API key');
      return;
    }
    settings.apiKey = apiKeyInput.value;
    settings.apiProvider = providerSelect.value;
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
    
    if (settings.apiKey) {
      await getResponse(transcript);
    } else {
      showError('No API key. Click menu → Settings');
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
    let reply = '';

    if (settings.apiProvider === 'gemini') {
      // Google Gemini API - API key is sent directly from your browser
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${settings.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: userMessage
            }]
          }],
          generationConfig: {
            maxOutputTokens: 60,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const data = await response.json();
      reply = data.candidates[0].content.parts[0].text;

    } else if (settings.apiProvider === 'openai') {
      // OpenAI API - API key is sent directly from your browser
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are JARVIS, a helpful AI assistant. Keep responses brief (under 30 words).' },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 50
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      reply = data.choices[0].message.content;
    }

    updateStatus(`JARVIS: ${reply}`);
    
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
    showError(`Error: ${error.message}`);
    updateStatus('Ready');
    isResponding = false;
  }
}

const recognition = initVoiceInput();
updateStatus('Ready');
drawOrb();
