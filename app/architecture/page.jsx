export default function ArchitecturePage() {
  const layers = [
    {
      id: "input",
      label: "INPUT",
      shape: "1 × 3 × 128 × 128",
      desc: "RGB image tensor. Batch of 1. 3 color channels. 128×128 pixels.",
      color: "border-gray-600 bg-gray-800/50",
      accent: "text-gray-400",
      bar: "bg-gray-600",
      width: "w-16"
    },
    {
      id: "conv1",
      label: "CONV2D + ReLU",
      shape: "32 × 128 × 128",
      desc: "32 filters, kernel 3×3, padding 1. Detects low-level edges and textures across the entire face region.",
      color: "border-blue-500/40 bg-blue-500/10",
      accent: "text-blue-400",
      bar: "bg-blue-500",
      width: "w-24"
    },
    {
      id: "pool1",
      label: "MAXPOOL2D",
      shape: "32 × 64 × 64",
      desc: "2×2 kernel, stride 2. Picks the strongest activation from each 2×2 region — halving spatial dimensions while keeping important features.",
      color: "border-purple-500/40 bg-purple-500/10",
      accent: "text-purple-400",
      bar: "bg-purple-500",
      width: "w-20"
    },
    {
      id: "conv2",
      label: "CONV2D + ReLU",
      shape: "64 × 64 × 64",
      desc: "64 filters, kernel 3×3, padding 1. Detects complex patterns — mask straps, fabric textures, nose-bridge shapes.",
      color: "border-blue-500/40 bg-blue-500/10",
      accent: "text-blue-400",
      bar: "bg-blue-500",
      width: "w-28"
    },
    {
      id: "pool2",
      label: "MAXPOOL2D",
      shape: "64 × 32 × 32",
      desc: "Applies again — spatial dimensions shrink to 32×32. The model now has a compact 64-channel feature map.",
      color: "border-purple-500/40 bg-purple-500/10",
      accent: "text-purple-400",
      bar: "bg-purple-500",
      width: "w-24"
    },
    {
      id: "flatten",
      label: "FLATTEN",
      shape: "65,536 elements",
      desc: "64 × 32 × 32 = 65,536 values. The 3D feature map is stretched into a 1D vector for the dense layers.",
      color: "border-amber-500/40 bg-amber-500/10",
      accent: "text-amber-400",
      bar: "bg-amber-500",
      width: "w-full"
    },
    {
      id: "fc1",
      label: "LINEAR + ReLU",
      shape: "65,536 → 128",
      desc: "Fully connected layer compresses 65K features down to 128 essential signals. The first decision-making layer.",
      color: "border-orange-500/40 bg-orange-500/10",
      accent: "text-orange-400",
      bar: "bg-orange-500",
      width: "w-32"
    },
    {
      id: "dropout",
      label: "DROPOUT (0.5)",
      shape: "128 neurons",
      desc: "Randomly zeros 50% of neurons during training only. Forces the model to learn redundant features — prevents memorization.",
      color: "border-red-500/40 bg-red-500/10",
      accent: "text-red-400",
      bar: "bg-red-500",
      width: "w-28"
    },
    {
      id: "fc2",
      label: "LINEAR (OUTPUT)",
      shape: "128 → 2 logits",
      desc: "Final classification layer. Outputs 2 raw scores (logits): one for Without Mask, one for With Mask. Softmax converts them to probabilities.",
      color: "border-teal-500/40 bg-teal-500/10",
      accent: "text-teal-400",
      bar: "bg-teal-500",
      width: "w-10"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-6 tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          STEP 2 — MODEL DESIGN
        </div>
        <h1 className="text-5xl font-display font-black text-white mb-4">CNN<br /><span className="text-blue-400">Architecture</span></h1>
        <p className="text-gray-400 font-mono text-sm max-w-lg leading-relaxed">
          A custom-built Convolutional Neural Network. Every layer explained from raw pixels to final prediction.
        </p>
      </div>

      {/* Architecture Flow */}
      <div className="space-y-3 mb-16">
        {layers.map((layer, i) => (
          <div key={layer.id} className="group">
            <div className={`layer-card border ${layer.color} rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className={`text-xs font-mono font-bold ${layer.accent} tracking-widest`}>{layer.label}</div>
                    <div className="font-display font-black text-white text-lg mt-0.5">{layer.shape}</div>
                  </div>
                  <p className="text-gray-500 text-sm font-mono leading-relaxed flex-1">{layer.desc}</p>
                </div>
              </div>
              {/* Mini bar chart representing feature count */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${layer.bar} rounded-full ${layer.width}`} />
                </div>
                <span className="text-xs font-mono text-gray-700">{i + 1}/{layers.length}</span>
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-px h-4 bg-gray-700" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ONNX Export */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-teal-500/30 bg-teal-500/5">
          <div className="text-xs font-mono text-teal-400 tracking-widest mb-3">ONNX EXPORT</div>
          <h3 className="font-display font-bold text-white text-xl mb-3">Edge Inference</h3>
          <p className="text-gray-400 text-sm font-mono leading-relaxed">
            The trained PyTorch model was exported to ONNX format (opset 18) with baked-in weights. ONNX Runtime Web executes the model directly in-browser via WebAssembly — zero server needed.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/5">
          <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">INFERENCE PIPELINE</div>
          <h3 className="font-display font-bold text-white text-xl mb-3">Browser → Tensor</h3>
          <div className="space-y-2">
            {[
              "Capture 128×128 frame from canvas",
              "Extract RGBA pixels → Float32Array",
              "Normalize: (x − mean) / std",
              "Pack into [1, 3, 128, 128] CHW tensor",
              "Run ONNX session → 2 logits",
              "Softmax → probability → label",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-mono text-gray-400">
                <span className="text-purple-500 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}