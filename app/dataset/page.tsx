export default function DatasetPage() {
  const steps = [
    {
      num: "01",
      title: "Source Dataset",
      desc: "Downloaded andrewmvd/face-mask-detection from Kaggle — 853 raw crowd photographs with XML annotation files mapping every face's bounding box and label.",
      detail: "398 MB · CC0 License · 853 crowd images"
    },
    {
      num: "02",
      title: "XML Parsing",
      desc: "PyTorch cannot consume raw XML. A custom parser extracted xmin, ymin, xmax, ymax coordinates from each annotation file, treating every <object> tag as a single face region.",
      detail: "Tags parsed: <bndbox> · <name> · <size>"
    },
    {
      num: "03",
      title: "Face Cropping",
      desc: "Each crowd image was opened as an RGB PIL image. The bounding box coordinates were used to crop individual face tiles. The third class (mask_weared_incorrect) was deliberately skipped for a clean binary task.",
      detail: "3,949 faces extracted · mask_weared_incorrect → dropped"
    },
    {
      num: "04",
      title: "Class Remapping",
      desc: "Raw string labels were remapped to a binary integer system. without_mask becomes Label 0, with_mask becomes Label 1. This simplifies the output layer to just 2 logits.",
      detail: "Label 0: without_mask · Label 1: with_mask"
    },
    {
      num: "05",
      title: "Class Weighting",
      desc: "The dataset is heavily imbalanced (717 without-mask vs 3,232 with-mask). Inverse frequency weights were calculated to penalize errors on the minority class during training.",
      detail: "Without Mask weight: 2.75 · With Mask weight: 0.61"
    },
    {
      num: "06",
      title: "80/20 Train Split",
      desc: "The full dataset was randomly split: 80% for training (3,159 faces) and 20% held out for validation (790 faces). The model never sees validation faces during training.",
      detail: "Train: 3,159 samples · Val: 790 samples"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-6 tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          STEP 1 — DATA PIPELINE
        </div>
        <h1 className="text-5xl font-display font-black text-white mb-4">Dataset<br /><span className="text-amber-400">Preparation</span></h1>
        <p className="text-gray-400 font-mono text-sm max-w-lg leading-relaxed">
          From 853 raw crowd photos to 3,949 clean face crops — the full preprocessing pipeline explained.
        </p>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-2 gap-4 mb-16">
        <div className="dist-card border-red-500/30 bg-red-500/5">
          <div className="text-xs font-mono text-red-400 tracking-widest mb-2">LABEL 0 · MINORITY CLASS</div>
          <div className="text-4xl font-display font-black text-white mb-1">717</div>
          <div className="text-sm font-mono text-gray-500">without_mask faces</div>
          <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '18%' }} />
          </div>
          <div className="text-xs font-mono text-gray-600 mt-1">18% of dataset</div>
        </div>
        <div className="dist-card border-teal-500/30 bg-teal-500/5">
          <div className="text-xs font-mono text-teal-400 tracking-widest mb-2">LABEL 1 · MAJORITY CLASS</div>
          <div className="text-4xl font-display font-black text-white mb-1">3,232</div>
          <div className="text-sm font-mono text-gray-500">with_mask faces</div>
          <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: '82%' }} />
          </div>
          <div className="text-xs font-mono text-gray-600 mt-1">82% of dataset</div>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-px">
        {steps.map((step, i) => (
          <div key={step.num} className="pipeline-step group">
            <div className="flex items-start gap-6">
              <div className="step-num">{step.num}</div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-amber-400 transition-colors">{step.title}</h3>
                <p className="text-gray-400 text-sm font-mono leading-relaxed mb-3">{step.desc}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-md">
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono text-gray-500">{step.detail}</span>
                </div>
              </div>
            </div>
            {i < steps.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      {/* Augmentation Box */}
      <div className="mt-12 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
        <h3 className="font-display font-bold text-white mb-4">⬡ Data Augmentation & Normalization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Resize", desc: "All crops resized to 128×128 px for uniform tensor shape" },
            { name: "ToTensor", desc: "Pixel values [0–255] converted to float tensors [0.0–1.0]" },
            { name: "Normalize", desc: "ImageNet mean [0.485, 0.456, 0.406] & std [0.229, 0.224, 0.225]" },
          ].map(a => (
            <div key={a.name} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="font-mono text-amber-400 text-xs tracking-widest mb-2">{a.name.toUpperCase()}</div>
              <p className="text-gray-400 text-xs font-mono leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}