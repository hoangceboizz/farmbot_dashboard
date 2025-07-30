// mqtt.js

const client = mqtt.connect('ws://test.mosquitto.org:8080');

const topicSub = 'farmbot/state';
const topicPub = 'farmbot/control';

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  client.subscribe(topicSub, (err) => {
    if (!err) {
      console.log('📥 Subscribed to', topicSub);
    }
  });
});

client.on('message', (topic, message) => {
  const msg = message.toString();
  console.log('📨 Received:', msg);

  if (topic === topicSub) {
    try {
      const data = JSON.parse(msg);
      const state = data.state || "unknown";
      const x = data.x;
      const y = data.y;

      document.getElementById('state').textContent = `📡 Trạng thái: ${state} (${x}, ${y})`;

      if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        drawGarden(x, y);
      } else {
        notDraw();
      }
    } catch (e) {
      console.error("⚠️ Không parse được JSON từ MQTT:", msg);
    }
  }
});

function startMachine() {
  const payload = JSON.stringify({ command: "start" });
  client.publish(topicPub, payload);
  document.getElementById("state").textContent = `🔄 Sending start...`;
}

function EndMachine() {
  const payload = JSON.stringify({ command: "stop" });
  client.publish(topicPub, payload);
  document.getElementById("state").textContent = "🛑 Sending stop...";
  notDraw();
}

// ----------------------------- Canvas Drawing -----------------------------
function drawAxis() {
  const canvas = document.getElementById('gardenCanvas');
  const ctx = canvas.getContext('2d');

  // Vẽ ảnh nền lên trên
  const background = new Image();
  background.src = 'image/field3.jpg';

  background.onload = () => {
    //Vẽ ảnh nền trước
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    const originX = 30;
    const originY = canvas.height - 20;
    const axisWidth = 800;
    const axisHeight = 500;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Trục Ox
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + axisWidth, originY);
    ctx.stroke();

    // Trục Oy
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - axisHeight);
    ctx.stroke();

    // Ghi số trục
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    for (let x = 0; x <= axisWidth; x += 100) {
      ctx.fillText(x.toString(), originX + x, originY + 15);
    }

    ctx.textAlign = "right";
    for (let y = 100; y <= axisHeight; y += 100) {
      ctx.fillText(y.toString(), originX - 5, originY - y + 5);
    }
  };
}

function drawGarden(x, y) {
  drawAxis();
  drawPointMark(x, y);
}

function drawPointMark(x, y, color = 'red') {
  const canvas = document.getElementById('gardenCanvas');
  const ctx = canvas.getContext('2d');
  const originX = 30;
  const originY = canvas.height - 20;

  const canvasX = originX + x;
  const canvasY = originY - y;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(canvasX - 5, canvasY - 5);
  ctx.lineTo(canvasX + 5, canvasY + 5);
  ctx.moveTo(canvasX + 5, canvasY - 5);
  ctx.lineTo(canvasX - 5, canvasY + 5);
  ctx.stroke();
}

function notDraw() {
  drawAxis();
}

window.onload = drawAxis;
