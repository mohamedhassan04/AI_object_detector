import React, { useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd"; // مكتبة التعرف على الأشياء
import "@tensorflow/tfjs"; // لازم هذا حتى يشتغل cocoSsd

const getColorForClass = (className: string): string => {
  const colorMap: { [key: string]: string } = {
    person: "#00FF00",
    bottle: "#007BFF",
    chair: "#FF5733",
    tv: "#FFC107",
    book: "#9C27B0",
    // 👇 تضيف أنواع أخرى حسب الحاجة
  };

  // لو النوع مش موجود، نرجع لون عشوائي
  if (!colorMap[className]) {
    colorMap[className] = getRandomColor();
  }

  return colorMap[className];
};

// 🎲 توليد لون عشوائي في حالة ما كانش النوع موجود
const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ObjectDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // تحديد نوع الفيديو
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // تحديد نوع الكانفاس

  // ⏺️ تشغيل الكاميرا
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

  // 🧠 تشغيل الموديل والتعرف على الأشياء
  const runObjectDetection = async () => {
    const model = await cocoSsd.load(); // تحميل الموديل

    const detectFrame = async () => {
      const video = videoRef.current;
      if (video && video.readyState === 4) {
        const predictions = await model.detect(video);

        drawPredictions(predictions); // يرسم التوقعات
        requestAnimationFrame(detectFrame); // يعيد التشغيل كل فريم
      }
    };

    detectFrame(); // أول نداء
  };

  // 🎨 رسم التوقعات على الكانفاس
  const drawPredictions = (predictions: cocoSsd.DetectedObject[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ضبط أبعاد الكانفاس
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // 🧪 توليد لون فريد حسب اسم الكائن
      const color = getColorForClass(prediction.class);

      // رسم المستطيل
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // حساب النسبة
      const confidence = (prediction.score * 100).toFixed(1);

      // رسم النص
      ctx.fillStyle = color;
      ctx.font = "16px Arial";
      ctx.fillText(
        `${prediction.class} (${confidence}%)`,
        x,
        y > 10 ? y - 5 : 10 // حدد الموقع الذي سيحتوي على النص
      );
    });
  };
  useEffect(() => {
    startCamera();
    runObjectDetection();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* الفيديو */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", maxWidth: "720px" }}
      />

      {/* الكانفاس */}
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
