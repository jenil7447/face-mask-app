'use client';

import { useState, useRef, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

export default function Home() {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [prediction, setPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'webcam' | 'upload'>('webcam');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadPrediction, setUploadPrediction] = useState<{ label: string; confidence: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRunningRef = useRef(false);

  // 1. Load the Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelSession = await ort.InferenceSession.create('/face_mask_bundled.onnx');
        setSession(modelSession);
      } catch (err) {
        console.error("Failed to load model:", err);
      } finally {
        setModelLoading(false);
      }
    };
    loadModel();
    return () => stopWebcam();
  }, []);

  // 2. Core Prediction Math (Used by both Webcam and Upload)
  const predictFromCanvas = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, sess: ort.InferenceSession) => {
    const imageData = ctx.getImageData(0, 0, 128, 128).data;
    const float32Data = new Float32Array(1 * 3 * 128 * 128);
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    for (let i = 0; i < 128 * 128; i++) {
      float32Data[i] = (imageData[i * 4] / 255.0 - mean[0]) / std[0];
      float32Data[128 * 128 + i] = (imageData[i * 4 + 1] / 255.0 - mean[1]) / std[1];
      float32Data[2 * 128 * 128 + i] = (imageData[i * 4 + 2] / 255.0 - mean[2]) / std[2];
    }
    
    const tensor = new ort.Tensor('float32', float32Data, [1, 3, 128, 128]);
    const results = await sess.run({ [sess.inputNames[0]]: tensor });
    const output = results[sess.outputNames[0]].data as Float32Array;
    
    const maxLogit = Math.max(output[0], output[1]);
    const expScores = [Math.exp(output[0] - maxLogit), Math.exp(output[1] - maxLogit)];
    const sum = expScores[0] + expScores[1];
    const probs = expScores.map(e => e / sum);
    const cls = probs[0] > probs[1] ? 0 : 1;
    
    return { label: cls === 0 ? "Without Mask" : "With Mask", confidence: probs[cls] * 100 };
  };

  // 3. Webcam Start
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        isRunningRef.current = true;

        videoRef.current.onloadedmetadata = () => {
          detectFrame(); 
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Please allow webcam access.");
    }
  };

  // 4. Webcam Stop
  const stopWebcam = () => {
    isRunningRef.current = false; 
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setPrediction(null);
  };

  // 5. Recursive Webcam Loop
  const detectFrame = async () => {
    if (!isRunningRef.current || !session || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    
    if (video.readyState === 4) {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        canvas.width = 128; 
        canvas.height = 128;
        
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 128, 128);
        const result = await predictFromCanvas(canvas, ctx, session);
        if (result) setPrediction(result);
      } catch (err) {
        console.error("Frame Processing Error:", err);
      }
    }

    if (isRunningRef.current) {
      setTimeout(detectFrame, 150); 
    }
  };

  // 6. Image Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setUploadPrediction(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeUploadedImage = async () => {
    if (!uploadedImage || !session || !canvasRef.current) return;
    setIsAnalyzing(true);
    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current!;
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 128, 128);
      
      const result = await predictFromCanvas(canvas, ctx, session);
      if (result) setUploadPrediction(result);
      setIsAnalyzing(false);
    };
    img.src = uploadedImage;
  };

  const isMask = prediction?.label === "With Mask";
  const isUploadMask = uploadPrediction?.label === "With Mask";

  return (
    <div className="min-h-screen">
      <canvas ref={canvasRef} className="hidden" />

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="hero-grid" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-mono mb-6 tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            LIVE INFERENCE ENGINE — ONNX RUNTIME WEB
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black mb-4 leading-none">
            <span className="text-white">MASK</span>
            <span className="text-teal-400">VISION</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Real-time face mask detection running entirely in your browser. <br />
            No server. No upload. Pure edge AI via WebAssembly.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { val: "97.47%", label: "Val Accuracy" },
              { val: "4,072", label: "Training Faces" },
              { val: "~6fps", label: "Inference Rate" },
              { val: "0ms", label: "Server Latency" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="text-2xl font-display font-black text-teal-400">{s.val}</div>
                <div className="text-xs font-mono text-gray-500 tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        {/* Model Status */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border font-mono text-sm mb-6 ${modelLoading ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-teal-500/30 bg-teal-500/10 text-teal-400'}`}>
          <span className={`w-2 h-2 rounded-full ${modelLoading ? 'bg-amber-400 animate-pulse' : 'bg-teal-400'}`} />
          {modelLoading ? 'Loading ONNX model into browser memory...' : '✓ Model loaded — FaceMaskCNN ready for inference'}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl mb-6">
          {(['webcam', 'upload'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === 'upload') stopWebcam(); }}
              className={`flex-1 py-3 rounded-lg font-mono text-sm tracking-widest transition-all ${activeTab === tab ? 'bg-teal-500 text-black font-bold' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab === 'webcam' ? '⬡ LIVE WEBCAM' : '⬡ UPLOAD IMAGE'}
            </button>
          ))}
        </div>

        {/* Webcam Tab */}
        {activeTab === 'webcam' && (
          <div className="demo-card">
            
            <div className="video-container relative bg-gray-900 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
              
              {/* FIX: Video is always rendered, but hidden via CSS when inactive */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover scale-x-[-1] absolute inset-0 z-10 ${isCameraActive ? 'block' : 'hidden'}`} 
              />
              
              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center text-gray-600 z-0">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-2xl mb-4">⬡</div>
                  <span className="font-mono text-sm">Camera feed inactive</span>
                </div>
              )}

              {/* Prediction Overlay */}
              {prediction && isCameraActive && (
                <div className={`prediction-overlay absolute bottom-4 left-4 right-4 z-20 p-4 rounded-lg backdrop-blur-md border ${isMask ? 'bg-green-900/60 border-green-500 text-green-400' : 'bg-red-900/60 border-red-500 text-red-400'}`}>
                  <span className="font-display font-black text-xl">{prediction.label.toUpperCase()}</span>
                  <div className="w-full bg-gray-800 h-2 mt-2 rounded-full overflow-hidden">
                    <div className={`h-full ${isMask ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${prediction.confidence}%` }} />
                  </div>
                  <span className="font-mono text-xs opacity-80 mt-1 block">{prediction.confidence.toFixed(1)}% confidence</span>
                </div>
              )}

              {/* Corner Scanlines */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-500/50 z-20 m-4" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal-500/50 z-20 m-4" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-500/50 z-20 m-4" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500/50 z-20 m-4" />
            </div>

            <button
              onClick={isCameraActive ? stopWebcam : startWebcam}
              disabled={modelLoading}
              className={`w-full mt-6 py-4 rounded-xl font-display font-black text-sm tracking-widest transition-all ${isCameraActive ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30' : 'bg-teal-500 text-black hover:bg-teal-400 disabled:opacity-40'}`}
            >
              {isCameraActive ? '■ STOP WEBCAM' : '▶ START LIVE DETECTION'}
            </button>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="demo-card">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            {!uploadedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-teal-500/5 transition-all min-h-[300px]"
              >
                <div className="text-4xl mb-3 text-gray-500">⬡</div>
                <p className="font-display font-bold text-gray-400 mb-1">Drop a face image here</p>
                <p className="font-mono text-xs text-gray-600">JPG, PNG, WEBP supported</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-full max-h-[500px] object-contain" />
                  
                  {uploadPrediction && (
                    <div className={`prediction-overlay absolute bottom-4 left-4 right-4 z-20 p-4 rounded-lg backdrop-blur-md border ${isUploadMask ? 'bg-green-900/60 border-green-500 text-green-400' : 'bg-red-900/60 border-red-500 text-red-400'}`}>
                      <span className="font-display font-black text-xl">{uploadPrediction.label.toUpperCase()}</span>
                      <div className="w-full bg-gray-800 h-2 mt-2 rounded-full overflow-hidden">
                        <div className={`h-full ${isUploadMask ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${uploadPrediction.confidence}%` }} />
                      </div>
                      <span className="font-mono text-xs opacity-80 mt-1 block">{uploadPrediction.confidence.toFixed(1)}% confidence</span>
                    </div>
                  )}

                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-500/50 z-20 m-4" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal-500/50 z-20 m-4" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-500/50 z-20 m-4" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500/50 z-20 m-4" />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={analyzeUploadedImage}
                    disabled={isAnalyzing || modelLoading}
                    className="flex-1 py-4 rounded-xl font-display font-black text-sm tracking-widest bg-teal-500 text-black hover:bg-teal-400 disabled:opacity-40 transition-all"
                  >
                    {isAnalyzing ? 'ANALYZING...' : '⬡ ANALYZE IMAGE'}
                  </button>
                  <button
                    onClick={() => { setUploadedImage(null); setUploadPrediction(null); }}
                    className="px-6 py-4 rounded-xl font-mono text-sm text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white transition-all"
                  >
                    RESET
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}