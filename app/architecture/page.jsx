// src/app/architecture/page.tsx

export default function ArchitecturePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-blue-400 border-b border-gray-700 pb-4">CNN Architecture</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold">The PyTorch Model</h2>
        <p className="text-gray-300">
          The core "brain" is a custom-built Convolutional Neural Network (CNN) designed to scan 128x128 RGB images.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="font-bold text-blue-300">1. Feature Extraction</h3>
            <p className="text-sm text-gray-400 mt-2">Two Conv2d layers (32 and 64 filters respectively) paired with MaxPool2d layers to detect patterns and shrink the spatial dimensions down to 32x32 pixels.</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="font-bold text-blue-300">2. Classification</h3>
            <p className="text-sm text-gray-400 mt-2">The flattened tensor is passed through a Linear layer, regularized with a 50% Dropout to prevent overfitting, and finalized into 2 output logits.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold">Edge Inference via ONNX</h2>
        <p className="text-gray-300">
          Rather than relying on a heavy Flask backend, the trained model was exported to the <strong>ONNX (Open Neural Network Exchange)</strong> format with baked-in weights (opset 18). 
          This allows the Next.js frontend to execute the heavy matrix multiplications directly in the user's browser using WebAssembly and WebGL, resulting in zero-latency webcam inference.
        </p>
      </div>
    </div>
  );
}