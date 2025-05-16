import React, { useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd"; // library for object detection
import "@tensorflow/tfjs"; // library for TensorFlow.js operations

const getColorForClass = (className: string): string => {
  const colorMap: { [key: string]: string } = {
    person: "#00FF00",
    bottle: "#007BFF",
    chair: "#FF5733",
    tv: "#FFC107",
    book: "#9C27B0",
  };

  // if the class name is not in the color map, generate a random color
  if (!colorMap[className]) {
    colorMap[className] = getRandomColor();
  }

  return colorMap[className];
};

// generate a random color if the color is not in the color map
const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ObjectDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // check the type of video
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // check the type of canvas

  // ⏺️ start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Devices:", devices);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // 🧠 Run the model and start detection
  const runObjectDetection = async () => {
    const model = await cocoSsd.load(); // load the model

    const detectFrame = async () => {
      const video = videoRef.current;
      if (video && video.readyState === 4) {
        const predictions = await model.detect(video);

        drawPredictions(predictions); // draw the predictions on the canvas
        requestAnimationFrame(detectFrame); // request the next frame
      }
    };

    detectFrame(); // start the detection loop
  };

  // 🎨 Draw the canvas
  const drawPredictions = (predictions: cocoSsd.DetectedObject[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The canvas size should match the video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // 🧪 Generate a random color for the frame
      const color = getColorForClass(prediction.class);

      // Drawing the bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Calculate the percentage of the prediction
      const confidence = (prediction.score * 100).toFixed(1);

      // Drawing the text
      ctx.fillStyle = color;
      ctx.font = "16px Arial";
      ctx.fillText(
        `${prediction.class} (${confidence}%)`,
        x,
        y > 10 ? y - 5 : 10 // make sure the text is not too close to the top
      );
    });
  };
  useEffect(() => {
    startCamera();
    runObjectDetection();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", maxWidth: "720px" }}
      />

      {/* canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default ObjectDetection;
