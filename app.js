// Get the canvas and context
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const strokeColorInput = document.getElementById('strokeColor');
const bgColorInput = document.getElementById('bgColor');
const brushSizeInput = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const saveFormat = document.getElementById('saveFormat');
const startSpeechBtn = document.getElementById('startSpeechBtn');

// Set default colors
let defaultBgColor = '#ffffff'; // White
let defaultStrokeColor = '#000000'; // Black

// Set canvas size dynamically based on screen width
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 500); // 90% of window width, max 500px
    canvas.height = canvas.width * 0.6; // Maintain 5:3 aspect ratio
    redraw(); // Redraw the content after resizing
}

// Set canvas size on load and resize
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Variables for drawing state, history, etc.
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let strokeColor = strokeColorInput.value;
let bgColor = bgColorInput.value;
let brushSize = brushSizeInput.value;
let isErasing = false;
let drawingHistory = [];
let undoneHistory = [];

// Save the current canvas state (for undo functionality)
function saveState() {
    const dataURL = canvas.toDataURL();
    drawingHistory.push(dataURL);
    undoneHistory = []; // Clear the redo history
}

// Restore a previous canvas state (for undo/redo functionality)
function restoreState(imageData) {
    const img = new Image();
    img.src = imageData;
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// Start drawing
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    saveState(); // Save current state for undo
}

// Stop drawing
function stopDrawing() {
    isDrawing = false;
}

// Draw on the canvas
function draw(e) {
    if (!isDrawing) return;

    ctx.strokeStyle = isErasing ? bgColor : strokeColor;
    ctx.lineWidth = brushSize;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

// Event listeners for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('mousemove', draw);

// Update brush size
brushSizeInput.addEventListener('input', (e) => {
    brushSize = e.target.value;
});

// Update stroke color
strokeColorInput.addEventListener('input', (e) => {
    strokeColor = e.target.value;
});

// Update background color
bgColorInput.addEventListener('input', (e) => {
    bgColor = e.target.value;
    setCanvasBackground(bgColor);  // Set the new background color and redraw
    saveState();  // Save the state after changing the background
});

// Set eraser mode
eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing;
    eraserBtn.textContent = isErasing ? 'Pen' : 'Eraser';
});

// Undo last action
undoBtn.addEventListener('click', () => {
    if (drawingHistory.length > 1) {
        undoneHistory.push(drawingHistory.pop());
        restoreState(drawingHistory[drawingHistory.length - 1]);
    }
});

// Redo last undone action
redoBtn.addEventListener('click', () => {
    if (undoneHistory.length > 0) {
        const redoState = undoneHistory.pop();
        restoreState(redoState);
        drawingHistory.push(redoState);
    }
});

// Clear the canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground(bgColor);
    drawingHistory = [];
    undoneHistory = [];
});

// Save the canvas as an image
saveBtn.addEventListener('click', () => {
    const format = saveFormat.value;
    let dataURL = canvas.toDataURL('image/png');

    if (format === 'jpeg') {
        dataURL = canvas.toDataURL('image/jpeg');
    } else if (format === 'svg') {
        alert('SVG format is not directly supported for canvas. Please use PNG or JPEG.');
        return;
    }

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `signature.${format}`;
    link.click();
});

// Function to set the canvas background color
function setCanvasBackground(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to redraw the entire canvas content
function redraw() {
    if (drawingHistory.length > 0) {
        restoreState(drawingHistory[drawingHistory.length - 1]);
    } else {
        setCanvasBackground(bgColor);  // If no history, just set background
    }
}

// Initial setup
bgColor = defaultBgColor; // Initialize with default background color
strokeColor = defaultStrokeColor; // Initialize with default stroke color
setCanvasBackground(bgColor);
saveState(); // Save initial empty state

// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; // Set language to English
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Start speech recognition
function startSpeechRecognition() {
    recognition.start();
}

// Handle speech recognition results
    recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    console.log('Recognized Text:', transcript);

    // Draw the exact recognized text on the canvas
    ctx.font = '30px Arial';
    ctx.fillStyle = strokeColor;
    ctx.fillText(transcript, 10, 50); // Draw text at position (10, 50)
};

// Handle speech recognition errors
recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
};

// Event listener for speech recognition button
startSpeechBtn.addEventListener('click', startSpeechRecognition);
