const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearButton = document.getElementById('clearButton');
const resizeHandle = document.getElementById('resizeHandle');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

let painting = false;
let resizing = false;
let lastX, lastY;

// Create an off-screen canvas to store the drawing history
const offScreenCanvas = document.createElement('canvas');
const offScreenCtx = offScreenCanvas.getContext('2d');
offScreenCanvas.width = canvas.width;
offScreenCanvas.height = canvas.height;

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = colorPicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Draw to the off-screen canvas as well
    offScreenCtx.lineWidth = brushSize.value;
    offScreenCtx.lineCap = 'round';
    offScreenCtx.strokeStyle = colorPicker.value;
    offScreenCtx.lineTo(x, y);
    offScreenCtx.stroke();
    offScreenCtx.beginPath();
    offScreenCtx.moveTo(x, y);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    offScreenCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
});

resizeHandle.addEventListener('mousedown', (e) => {
    resizing = true;
    lastX = e.clientX;
    lastY = e.clientY;
    e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
    if (resizing) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        const newWidth = Math.max(canvas.width + dx, 1);
        const newHeight = Math.max(canvas.height + dy, 1);

        // Create a temporary canvas to store the off-screen canvas content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = Math.max(newWidth, offScreenCanvas.width);
        tempCanvas.height = Math.max(newHeight, offScreenCanvas.height);

        // Draw the off-screen canvas content into the temporary canvas
        tempCtx.drawImage(offScreenCanvas, 0, 0);

        // Resize the off-screen canvas
        offScreenCanvas.width = tempCanvas.width;
        offScreenCanvas.height = tempCanvas.height;

        // Draw back the content from the temporary canvas to the off-screen canvas
        offScreenCtx.drawImage(tempCanvas, 0, 0);

        // Resize the visible canvas
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the off-screen canvas content to the visible canvas
        ctx.drawImage(offScreenCanvas, 0, 0);

        lastX = e.clientX;
        lastY = e.clientY;
    }
});

window.addEventListener('mouseup', () => {
    resizing = false;
});