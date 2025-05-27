const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');
const optionsContainer = document.getElementById('options');

const earringImg = new Image();

const earringLinks = [
  {
    name: "Earring 1",
    url: "https://drive.google.com/uc?id=1AbCDeFGHiJKLmn1234"
  },
  {
    name: "Earring 2",
    url: "https://drive.google.com/uc?id=2ZYXWVUTSRQPonm5678"
  },
  {
    name: "Earring 3",
    url: "https://drive.google.com/uc?id=3LMNOPQRSTuvWxyZ9012"
  }
];

// Dynamically render buttons
earringLinks.forEach(({ name, url }) => {
  const button = document.createElement("button");
  const img = document.createElement("img");
  img.src = url;
  img.alt = name;
  button.appendChild(img);
  button.onclick = () => changeEarring(url);
  optionsContainer.appendChild(button);
});

// Load first image by default
earringImg.src = earringLinks[0].url;

function changeEarring(url) {
  earringImg.src = url;
}

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

let leftEarPositions = [], rightEarPositions = [];

function smooth(positions) {
  const sum = positions.reduce((acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }), { x: 0, y: 0 });
  return { x: sum.x / positions.length, y: sum.y / positions.length };
}

faceMesh.onResults((results) => {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    const offsetY = 20;
    const left = {
      x: landmarks[132].x * canvasElement.width,
      y: landmarks[132].y * canvasElement.height - offsetY,
    };
    const right = {
      x: landmarks[361].x * canvasElement.width,
      y: landmarks[361].y * canvasElement.height - offsetY,
    };

    leftEarPositions.push(left);
    rightEarPositions.push(right);
    if (leftEarPositions.length > 5) leftEarPositions.shift();
    if (rightEarPositions.length > 5) rightEarPositions.shift();

    const leftSmooth = smooth(leftEarPositions);
    const rightSmooth = smooth(rightEarPositions);

    if (earringImg.complete) {
      if (leftSmooth) canvasCtx.drawImage(earringImg, leftSmooth.x - 30, leftSmooth.y, 60, 70);
      if (rightSmooth) canvasCtx.drawImage(earringImg, rightSmooth.x - 20, rightSmooth.y, 60, 70);
    }
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

videoElement.addEventListener('loadedmetadata', () => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
});
