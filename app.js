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

// レスポンシブ対応
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 400);
  canvas.width = size;
  canvas.height = size * 0.75;
  drawTimer();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 時間選択肢（1〜60分）
for (let i = 1; i <= 60; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  timeSelect.appendChild(option);
}

imageInput.addEventListener("change", (event) => {
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
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const remaining = totalTime - elapsed;
  const percent = elapsed / totalTime;
  const angle = percent * 2 * Math.PI;

  ctx.clearRect(0, 0, width, height);

  // 経過部分
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, -Math.PI / 2, angle - Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = remaining <= 180 ? "#f66" : "#8fd1c8";
  ctx.fill();

  // 外枠
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 画像
  if (centerImage) {
    const size = radius * 1.2;
    const aspect = centerImage.width / centerImage.height;
    let w = size, h = size;
    if (aspect > 1) h = size / aspect;
    else w = size * aspect;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(centerImage, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
  }

  // 数値（残り時間）
  ctx.fillStyle = "#222";
  ctx.font = `${Math.floor(width * 0.08)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const min = String(Math.floor(remaining / 60)).padStart(2, "0");
  const sec = String(remaining % 60).padStart(2, "0");
  ctx.fillText(`${min}:${sec}`, cx, cy);
}

function playAlarm(times = 3) {
  if (alarm.paused) alarm.load(); // 再生準備
  let count = 0;
  const interval = setInterval(() => {
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
    count++;
    if (count >= times) clearInterval(interval);
  }, 1500);
}

function startTimer() {
  if (running) return;
  const selectedMinutes = parseInt(timeSelect.value);
  if (isNaN(selectedMinutes) || selectedMinutes <= 0) return;
  totalTime = selectedMinutes * 60;
  elapsed = 0;
  resizeCanvas();
  drawTimer();
  running = true;

  timer = setInterval(() => {
    if (elapsed < totalTime) {
      elapsed++;
      drawTimer();
    } else {
      clearInterval(timer);
      running = false;
      playAlarm(3);
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
