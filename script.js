const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement.getContext('2d');
const optionsContainer = document.getElementById('options');

const earringImg = new Image();

const earringLinks = [
  const earringOptions = [
  {
    name: "Earring 1",
    url: "https://drive.google.com/uc?export=view&id=1PAldz_nDfCWYZgHGiaoUd6u9P0qVfKzu"
  },
  {
    name: "Earring 2",
    url: "https://drive.google.com/uc?export=view&id=12f5bGnRwDiUhzTlSxRu7D60wiZ3aga-O"
  },
  {
    name: "Earring 3",
    url: "https://drive.google.com/uc?export=view&id=15vsKBPpmvRzdf9ppB_BIJOb3r9B83Fpk"
  },
  {
    name: "Earring 4",
    url: "https://drive.google.com/uc?export=view&id=1B_phfMxgGdGFbmddYqY_KWgs6_AeoGk5"
  },
  {
    name: "Earring 5",
    url: "https://drive.google.com/uc?export=view&id=1E28IoaU9aIKXi2F53cfa35k-vqOFZ6zw"
  },
  {
    name: "Earring 6",
    url: "https://drive.google.com/uc?export=view&id=1FfmkYLiMWYrOkVttXTT_YZzZkWaE2LU5"
  },
  {
    name: "Earring 7",
    url: "https://drive.google.com/uc?export=view&id=1WDAGPHZsQhMpfORPhdTIrpNcpCYvrEIw"
  },
  {
    name: "Earring 8",
    url: "https://drive.google.com/uc?export=view&id=1hLrURynqdVyFsJFm4VaRTlVm7qEUnPau"
  },
  {
    name: "Earring 9",
    url: "https://drive.google.com/uc?export=view&id=1iCZQwbQIryKgGFLJb-rKzfxLaJ1GQC1D"
  },
  {
    name: "Earring 10",
    url: "https://drive.google.com/uc?export=view&id=1qdBGOukutdShe1UIQYtSGU7-l_0RmXry"
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
