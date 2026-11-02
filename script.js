const paintCanvas = document.getElementById('paintCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');
const ctxPaint = paintCanvas.getContext('2d');
const ctxOverlay = overlayCanvas.getContext('2d');

let currentMode = 'paint';
let isDrawing = false;
let currentColor = '#2b2d42';
let brushSize = 14;
let isDocked = false;

// Farbpalette für das aktuelle Bild
const paletteColors = [
  { id: 1, hex: '#2b2d42', name: 'Nr. 1' },
  { id: 2, hex: '#8d99ae', name: 'Nr. 2' },
  { id: 3, hex: '#edf2f4', name: 'Nr. 3' },
  { id: 4, hex: '#d90429', name: 'Nr. 4' },
  { id: 5, hex: '#ef233c', name: 'Nr. 5' }
];

// Events nach Laden des Dokuments sicher verknüpfen
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupPalette();
  setupDraggablePalette();
  setupCanvasEvents();
});

// Navigation zwischen Menü und App
function setupNavigation() {
  document.getElementById('btn-paint-mode').addEventListener('click', () => startApp('paint'));
  document.getElementById('btn-diamond-mode').addEventListener('click', () => startApp('diamond'));
  document.getElementById('btn-back').addEventListener('click', returnToMenu);
  
  document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = e.target.value;
  });

  document.getElementById('btn-clear').addEventListener('click', clearCanvas);
}

function startApp(mode) {
  currentMode = mode;
  document.getElementById('start-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  
  document.getElementById('app-title').innerText = mode === 'paint' ? 'Fine Line Malen' : 'Diamond Painting';
  document.getElementById('brushSize').style.display = mode === 'paint' ? 'inline-block' : 'none';
  document.getElementById('label-size').style.display = mode === 'paint' ? 'inline-block' : 'none';

  initCanvasSize();
}

function returnToMenu() {
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('start-screen').classList.add('active');
}

// Canvas Initialisierung
function initCanvasSize() {
  const width = Math.min(window.innerWidth - 30, 420);
  const height = Math.min(window.innerHeight - 130, 420);

  paintCanvas.width = overlayCanvas.width = width;
  paintCanvas.height = overlayCanvas.height = height;

  clearCanvas();
  drawOverlayGuide();
}

function clearCanvas() {
  ctxPaint.fillStyle = '#18181c';
  ctxPaint.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

// Palette aufbauen
function setupPalette() {
  const container = document.getElementById('swatches-list');
  container.innerHTML = '';

  paletteColors.forEach((c, index) => {
    const item = document.createElement('div');
    item.className = `color-swatch ${index === 0 ? 'selected' : ''}`;
    item.innerHTML = `
      <div class="swatch-dot" style="background-color: ${c.hex}"></div>
      <span class="swatch-text">${c.name}</span>
    `;
    item.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      item.classList.add('selected');
      currentColor = c.hex;
    });
    container.appendChild(item);
  });
}

// Drag & Drop für die schwebende Palette + Festklemmen (Dock)
function setupDraggablePalette() {
  const palette = document.getElementById('floating-palette');
  const handle = document.getElementById('palette-handle');
  const dockBtn = document.getElementById('btn-dock');

  let startX = 0, startY = 0, posX = 0, posY = 0;

  const dragStart = (e) => {
    if (isDocked) return;
    e.preventDefault();
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;

    document.onmousemove = dragging;
    document.onmouseup = dragEnd;
    document.ontouchmove = dragging;
    document.ontouchend = dragEnd;
  };

  const dragging = (e) => {
    if (isDocked) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    posX = startX - clientX;
    posY = startY - clientY;
    startX = clientX;
    startY = clientY;

    palette.style.top = (palette.offsetTop - posY) + "px";
    palette.style.right = "auto";
    palette.style.left = (palette.offsetLeft - posX) + "px";
  };

  const dragEnd = () => {
    document.onmousemove = null;
    document.onmouseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
  };

  handle.onmousedown = dragStart;
  handle.ontouchstart = dragStart;

  dockBtn.addEventListener('click', () => {
    isDocked = !isDocked;
    palette.classList.toggle('docked', isDocked);
    if (isDocked) {
      palette.style.top = '';
      palette.style.left = '';
      palette.style.right = '';
      dockBtn.innerText = '🔓';
    } else {
      dockBtn.innerText = '📌';
    }
  });
}

// Vorlagen & Konturen auf dem Overlay zeichnen
function drawOverlayGuide() {
  ctxOverlay.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (currentMode === 'paint') {
    // Schöne feine Linien (Fine-Line-Aesthetic)
    ctxOverlay.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctxOverlay.lineWidth = 1;
    ctxOverlay.font = '11px sans-serif';
    ctxOverlay.fillStyle = 'rgba(255, 255, 255, 0.5)';

    // Kontur 1 (Kreis)
    ctxOverlay.beginPath();
    ctxOverlay.arc(120, 120, 55, 0, Math.PI * 2);
    ctxOverlay.stroke();
    ctxOverlay.fillText('1', 116, 124);

    // Kontur 2 (Rechteck)
    ctxOverlay.beginPath();
    ctxOverlay.rect(200, 70, 120, 110);
    ctxOverlay.stroke();
    ctxOverlay.fillText('2', 255, 128);

  } else if (currentMode === 'diamond') {
    // Diamond Painting Gitter
    const gridSize = 20;
    ctxOverlay.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctxOverlay.lineWidth = 0.5;

    for (let x = 0; x < overlayCanvas.width; x += gridSize) {
      ctxOverlay.beginPath();
      ctxOverlay.moveTo(x, 0);
      ctxOverlay.lineTo(x, overlayCanvas.height);
      ctxOverlay.stroke();
    }
    for (let y = 0; y < overlayCanvas.height; y += gridSize) {
      ctxOverlay.beginPath();
      ctxOverlay.moveTo(0, y);
      ctxOverlay.lineTo(overlayCanvas.width, y);
      ctxOverlay.stroke();
    }
  }
}

// Zeichen- & Diamanten-Logik
function setupCanvasEvents() {
  const getPos = (e) => {
    const rect = paintCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    if (e.target.closest('#floating-palette') || e.target.closest('header')) return;
    isDrawing = true;
    const pos = getPos(e);
    if (currentMode === 'paint') drawPencil(pos.x, pos.y, false);
    else placeDiamond(pos.x, pos.y);
  };

  const moveDraw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    if (currentMode === 'paint') drawPencil(pos.x, pos.y, true);
    else placeDiamond(pos.x, pos.y);
  };

  const stopDraw = () => {
    isDrawing = false;
    ctxPaint.beginPath();
  };

  overlayCanvas.addEventListener('mousedown', startDraw);
  overlayCanvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', stopDraw);

  overlayCanvas.addEventListener('touchstart', startDraw);
  overlayCanvas.addEventListener('touchmove', moveDraw);
  window.addEventListener('touchend', stopDraw);
}

function drawPencil(x, y, isDragging) {
  ctxPaint.lineWidth = brushSize;
  ctxPaint.lineCap = 'round';
  ctxPaint.lineJoin = 'round';
  ctxPaint.strokeStyle = currentColor;

  if (!isDragging) {
    ctxPaint.beginPath();
    ctxPaint.moveTo(x, y);
  }
  ctxPaint.lineTo(x, y);
  ctxPaint.stroke();
}

function placeDiamond(x, y) {
  const gridSize = 20;
  const gridX = Math.floor(x / gridSize) * gridSize;
  const gridY = Math.floor(y / gridSize) * gridSize;

  // Diamond-Stein mit 3D-Effekt
  ctxPaint.fillStyle = currentColor;
  ctxPaint.fillRect(gridX + 1, gridY + 1, gridSize - 2, gridSize - 2);

  ctxPaint.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctxPaint.beginPath();
  ctxPaint.moveTo(gridX + 1, gridY + 1);
  ctxPaint.lineTo(gridX + gridSize - 1, gridY + 1);
  ctxPaint.lineTo(gridX + 1, gridY + gridSize - 1);
  ctxPaint.fill();
}
