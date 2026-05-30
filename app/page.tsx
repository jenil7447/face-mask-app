'use client';

import { useState, useRef, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

export default function Home() {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Load the ONNX model when the page loads
  // 1. Load the ONNX model when the page loads
  // 1. Load the ONNX model when the page loads
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Fetching bundled model...");
        
        // Since the model is now one complete file, this clean method works perfectly
        const modelSession = await ort.InferenceSession.create('/face_mask_bundled.onnx');
        
        setSession(modelSession);
        console.log("Model loaded successfully!");
      } catch (err) {
        console.error("Failed to load model:", err);
      }
    };
    
    loadModel();
  }, []);

  // 2. Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setPrediction(null); // Reset previous prediction
    };
    reader.readAsDataURL(file);
  };

  // 3. The Core Image Processing & Inference Pipeline
  const runInference = async () => {
    if (!session || !imageSrc || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => { image.onload = resolve; });

      // Step A: Draw to Canvas and Resize to 128x128 (Matching your PyTorch transforms.Resize)
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      canvas.width = 128;
      canvas.height = 128;
      ctx.drawImage(image, 0, 0, 128, 128);

      // Step B: Extract pixels and Normalize (Matching PyTorch transforms.Normalize)
      const imageData = ctx.getImageData(0, 0, 128, 128).data;
      const float32Data = new Float32Array(1 * 3 * 128 * 128); 

      const mean = [0.485, 0.456, 0.406];
      const std = [0.229, 0.224, 0.225];

      // PyTorch expects NCHW format (Batch, Channels, Height, Width)
      // So we separate all Reds, then all Greens, then all Blues
      for (let i = 0; i < 128 * 128; i++) {
        const r = imageData[i * 4] / 255.0;
        const g = imageData[i * 4 + 1] / 255.0;
        const b = imageData[i * 4 + 2] / 255.0;

        float32Data[i] = (r - mean[0]) / std[0];                   // Red channel
        float32Data[128 * 128 + i] = (g - mean[1]) / std[1];       // Green channel
        float32Data[2 * 128 * 128 + i] = (b - mean[2]) / std[2];   // Blue channel
      }

      // Step C: Create the ONNX Tensor
      const tensor = new ort.Tensor('float32', float32Data, [1, 3, 128, 128]);

      // Step D: Run the model
      const inputName = session.inputNames[0];
      const results = await session.run({ [inputName]: tensor });
      const output = results[session.outputNames[0]].data as Float32Array;

      // Step E: Apply Softmax to get percentages
      const logits = [output[0], output[1]];
      const maxLogit = Math.max(...logits);
      const expScores = logits.map((l) => Math.exp(l - maxLogit));
      const sumExp = expScores.reduce((a, b) => a + b);
      const probabilities = expScores.map((e) => e / sumExp);

      // Step F: Determine the winner (0 = Without Mask, 1 = With Mask)
      const predictedClass = probabilities[0] > probabilities[1] ? 0 : 1;
      const labels = ["Without Mask", "With Mask"];

      setPrediction({
        label: labels[predictedClass],
        confidence: probabilities[predictedClass] * 100
      });

    } catch (err) {
      console.error("Inference Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6">
        
        <h1 className="text-2xl font-bold text-center">Face Mask Detector</h1>
        <p className="text-sm text-gray-400 text-center">Running locally in your browser using ONNX</p>

        {/* Hidden Canvas for Image Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Upload Button */}
        <div className="flex flex-col items-center gap-4">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        {/* Image Preview */}
        {imageSrc && (
          <div className="flex justify-center">
            <img src={imageSrc} alt="Preview" className="w-64 h-64 object-cover rounded-lg border-2 border-gray-600" />
          </div>
        )}

        {/* Analyze Button */}
        {imageSrc && (
          <button 
            onClick={runInference} 
            disabled={isProcessing}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:opacity-50 transition-colors"
          >
            {isProcessing ? "Analyzing..." : "Analyze Image"}
          </button>
        )}

        {/* Results Display */}
        {prediction && (
          <div className={`p-4 rounded-lg text-center ${prediction.label === "With Mask" ? "bg-green-900/50 border border-green-500" : "bg-red-900/50 border border-red-500"}`}>
            <h2 className="text-xl font-bold">{prediction.label}</h2>
            <p className="text-gray-300">Confidence: {prediction.confidence.toFixed(2)}%</p>
          </div>
        )}

      </div>
    </div>
  );
}