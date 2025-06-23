const canvas = document.getElementById("timerCanvas");
const ctx = canvas.getContext("2d");
const timeSelect = document.getElementById("timeSelect");
const alarm = document.getElementById("alarmSound");
const imageInput = document.getElementById("imageInput");

let totalTime = 60;
let elapsed = 0;
let timer;
let running = false;
let centerImage = null;

// 1〜60分の選択肢を動的に生成
for (let i = 1; i <= 60; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `${i}分`;
  timeSelect.appendChild(option);
}

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    centerImage = img;
    drawTimer();
  };
  img.src = URL.createObjectURL(file);
});

function resetImage() {
  centerImage = null;
  imageInput.value = "";
  drawTimer();
}

function drawTimer() {
  const percent = elapsed / totalTime;
  const angle = percent * 2 * Math.PI;
  const remaining = totalTime - elapsed;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const fillColor = (remaining <= 180) ? "#f66" : "#8fd1c8";

  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.arc(200, 200, 180, -Math.PI / 2, angle - Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(200, 200, 180, 0, 2 * Math.PI);
  ctx.stroke();

  if (centerImage) {
    const size = 160;
    const aspect = centerImage.width / centerImage.height;
    let drawWidth = size, drawHeight = size;

    if (aspect > 1) {
      drawHeight = size / aspect;
    } else {
      drawWidth = size * aspect;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(200, 200, size / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(centerImage, 200 - drawWidth / 2, 200 - drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }
}

function startTimer() {
  if (running) return;
  const selectedMinutes = parseInt(timeSelect.value);
  if (isNaN(selectedMinutes) || selectedMinutes <= 0) return;
  totalTime = selectedMinutes * 60;
  elapsed = 0;
  drawTimer();

  running = true;
  timer = setInterval(() => {
    if (elapsed < totalTime) {
      elapsed++;
      drawTimer();
    } else {
      clearInterval(timer);
      running = false;
      alarm.play();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  running = false;
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  elapsed = 0;
  drawTimer();
}
resetTimer();
