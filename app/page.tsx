'use client';

import { useState, useRef, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

export default function Home() {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load the Bundled ONNX model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelSession = await ort.InferenceSession.create('/face_mask_bundled.onnx');
        setSession(modelSession);
        console.log("Model loaded successfully!");
      } catch (err) {
        console.error("Failed to load model:", err);
      }
    };
    loadModel();
    
    // Cleanup loop on unmount
    return () => stopWebcam();
  }, []);

  // 2. Start the Webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        // Start running inference every 300ms (approx 3 frames per second)
        loopRef.current = setInterval(runInference, 300);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Please allow webcam access to use this feature.");
    }
  };

  // 3. Stop the Webcam
  const stopWebcam = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setPrediction(null);
  };

  // 4. The Core Real-Time Inference Pipeline
  const runInference = async () => {
    if (!session || !videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      // Step A: Draw the current video frame to the hidden 128x128 canvas
      canvas.width = 128;
      canvas.height = 128;
      
      // Calculate crop to keep the video aspect ratio centered (optional but recommended for accuracy)
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      
      ctx.drawImage(video, startX, startY, size, size, 0, 0, 128, 128);

      // Step B: Extract pixels and Normalize (Matching PyTorch)
      const imageData = ctx.getImageData(0, 0, 128, 128).data;
      const float32Data = new Float32Array(1 * 3 * 128 * 128); 
      const mean = [0.485, 0.456, 0.406];
      const std = [0.229, 0.224, 0.225];

      for (let i = 0; i < 128 * 128; i++) {
        const r = imageData[i * 4] / 255.0;
        const g = imageData[i * 4 + 1] / 255.0;
        const b = imageData[i * 4 + 2] / 255.0;

        float32Data[i] = (r - mean[0]) / std[0];                 
        float32Data[128 * 128 + i] = (g - mean[1]) / std[1];     
        float32Data[2 * 128 * 128 + i] = (b - mean[2]) / std[2]; 
      }

      // Step C: Create Tensor & Run Model
      const tensor = new ort.Tensor('float32', float32Data, [1, 3, 128, 128]);
      const inputName = session.inputNames[0];
      const results = await session.run({ [inputName]: tensor });
      const output = results[session.outputNames[0]].data as Float32Array;

      // Step D: Apply Softmax & Determine Winner
      const logits = [output[0], output[1]];
      const maxLogit = Math.max(...logits);
      const expScores = logits.map((l) => Math.exp(l - maxLogit));
      const sumExp = expScores.reduce((a, b) => a + b);
      const probabilities = expScores.map((e) => e / sumExp);

      const predictedClass = probabilities[0] > probabilities[1] ? 0 : 1;
      const labels = ["Without Mask", "With Mask"];

      setPrediction({
        label: labels[predictedClass],
        confidence: probabilities[predictedClass] * 100
      });

    } catch (err) {
      console.error("Inference Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6">
        
        <h1 className="text-2xl font-bold text-center">Live Face Mask Detector</h1>
        <p className="text-sm text-gray-400 text-center">Real-time inference using ONNX Runtime Web</p>

        {/* Hidden Canvas for Frame Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Feed */}
        <div className="flex justify-center relative rounded-lg overflow-hidden border-2 border-gray-600 bg-black min-h-[250px]">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-auto ${isCameraActive ? 'block' : 'hidden'} scale-x-[-1]`} 
          />
          {!isCameraActive && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Camera is off
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!isCameraActive ? (
            <button onClick={startWebcam} disabled={!session} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold disabled:opacity-50 transition-colors">
              Start Webcam
            </button>
          ) : (
            <button onClick={stopWebcam} className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors">
              Stop Webcam
            </button>
          )}
        </div>

        {/* Results Display */}
        {prediction && isCameraActive && (
          <div className={`p-4 rounded-lg text-center transition-colors ${prediction.label === "With Mask" ? "bg-green-900/50 border border-green-500" : "bg-red-900/50 border border-red-500"}`}>
            <h2 className="text-xl font-bold">{prediction.label}</h2>
            <p className="text-gray-300">Confidence: {prediction.confidence.toFixed(2)}%</p>
          </div>
        )}

      </div>
    </div>
  );
}