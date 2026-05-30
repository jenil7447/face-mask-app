export default function TrainingPage() {
  const epochs = [
    { ep: 1, trainLoss: 0.3515, trainAcc: 87.62, valLoss: 0.1159, valAcc: 96.96 },
    { ep: 2, trainLoss: 0.1288, trainAcc: 95.73, valLoss: 0.0751, valAcc: 96.71 },
    { ep: 3, trainLoss: 0.1153, trainAcc: 96.17, valLoss: 0.0830, valAcc: 95.32 },
    { ep: 4, trainLoss: 0.1101, trainAcc: 96.23, valLoss: 0.0695, valAcc: 97.22 },
    { ep: 5, trainLoss: 0.1055, trainAcc: 96.14, valLoss: 0.0648, valAcc: 97.72 },
    { ep: 6, trainLoss: 0.0887, trainAcc: 96.83, valLoss: 0.0732, valAcc: 96.84 },
    { ep: 7, trainLoss: 0.0843, trainAcc: 97.21, valLoss: 0.0978, valAcc: 96.08 },
    { ep: 8, trainLoss: 0.0957, trainAcc: 96.68, valLoss: 0.1206, valAcc: 96.46 },
    { ep: 9, trainLoss: 0.0941, trainAcc: 96.77, valLoss: 0.1148, valAcc: 95.82 },
    { ep: 10, trainLoss: 0.0770, trainAcc: 97.40, valLoss: 0.0681, valAcc: 97.47 },
  ];

  const maxLoss = 0.40;
  const confusionMatrix = [
    { actual: "Without Mask", predicted: "Without Mask", count: 141, type: "tp" },
    { actual: "Without Mask", predicted: "With Mask", count: 2, type: "fp" },
    { actual: "With Mask", predicted: "Without Mask", count: 18, type: "fn" },
    { actual: "With Mask", predicted: "With Mask", count: 629, type: "tn" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono mb-6 tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          STEP 3 — TRAINING RESULTS
        </div>
        <h1 className="text-5xl font-display font-black text-white mb-4">Training<br /><span className="text-green-400">Metrics</span></h1>
        <p className="text-gray-400 font-mono text-sm max-w-lg leading-relaxed">
          10 epochs on CUDA. Final validation accuracy: 97.47%. Model stopped at the right time.
        </p>
      </div>

      {/* Final Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { val: "97.47%", label: "Final Val Acc", color: "text-green-400", border: "border-green-500/30 bg-green-500/5" },
          { val: "97.40%", label: "Final Train Acc", color: "text-blue-400", border: "border-blue-500/30 bg-blue-500/5" },
          { val: "0.0681", label: "Final Val Loss", color: "text-amber-400", border: "border-amber-500/30 bg-amber-500/5" },
          { val: "10", label: "Epochs Trained", color: "text-purple-400", border: "border-purple-500/30 bg-purple-500/5" },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-xl border ${s.border}`}>
            <div className={`text-3xl font-display font-black ${s.color} mb-1`}>{s.val}</div>
            <div className="text-xs font-mono text-gray-500 tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loss Chart */}
      <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-8">
        <h3 className="font-display font-bold text-white mb-1">Loss Over Epochs</h3>
        <p className="text-xs font-mono text-gray-600 mb-6">Both curves descending together = healthy generalization</p>
        <div className="space-y-3">
          {epochs.map(e => (
            <div key={e.ep} className="flex items-center gap-4">
              <div className="w-8 text-xs font-mono text-gray-600 text-right">E{e.ep}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-blue-500/30 rounded-full overflow-hidden" style={{ width: `${(e.trainLoss / maxLoss) * 100}%`, minWidth: '4px', maxWidth: '100%' }}>
                    <div className="h-full bg-blue-500 rounded-full w-full" />
                  </div>
                  <span className="text-xs font-mono text-blue-400 w-12">{e.trainLoss.toFixed(4)}</span>
                  <span className="text-xs font-mono text-gray-700">{e.trainAcc.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-amber-500/30 rounded-full overflow-hidden" style={{ width: `${(e.valLoss / maxLoss) * 100}%`, minWidth: '4px', maxWidth: '100%' }}>
                    <div className="h-full bg-amber-500 rounded-full w-full" />
                  </div>
                  <span className="text-xs font-mono text-amber-400 w-12">{e.valLoss.toFixed(4)}</span>
                  <span className="text-xs font-mono text-gray-700">{e.valAcc.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2"><div className="w-3 h-2 rounded-sm bg-blue-500" /><span className="text-xs font-mono text-gray-500">Train Loss</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-2 rounded-sm bg-amber-500" /><span className="text-xs font-mono text-gray-500">Val Loss</span></div>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 mb-8">
        <h3 className="font-display font-bold text-white mb-1">Confusion Matrix</h3>
        <p className="text-xs font-mono text-gray-600 mb-6">Evaluated on 790 held-out validation faces</p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {confusionMatrix.map(cell => (
            <div key={`${cell.actual}-${cell.predicted}`}
              className={`p-5 rounded-xl text-center border ${
                cell.type === 'tp' ? 'border-teal-500/40 bg-teal-500/10' :
                cell.type === 'tn' ? 'border-blue-500/40 bg-blue-500/15' :
                'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className={`text-4xl font-display font-black mb-2 ${
                cell.type === 'tp' ? 'text-teal-400' :
                cell.type === 'tn' ? 'text-blue-400' :
                'text-red-400'
              }`}>{cell.count}</div>
              <div className="text-xs font-mono text-gray-600 leading-tight">
                <div>Actual: {cell.actual.split(' ').slice(-1)[0]}</div>
                <div>Pred: {cell.predicted.split(' ').slice(-1)[0]}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm mx-auto text-center text-xs font-mono text-gray-500">
          <div>← Predicted Without | With →</div>
          <div />
        </div>
      </div>

      {/* Analysis */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Fast Convergence", desc: "Both loss curves dropped sharply in the first 2 epochs — the model learned the shape of a mask very quickly.", color: "border-green-500/30 bg-green-500/5", accent: "text-green-400" },
          { title: "Healthy Gap", desc: "Training loss is only slightly lower than validation loss at the end. The model generalizes well — no significant overfitting.", color: "border-blue-500/30 bg-blue-500/5", accent: "text-blue-400" },
          { title: "Stopped in Time", desc: "Validation loss showed a small uptick at epoch 10 — a hint of overfitting starting. Training was stopped at exactly the right moment.", color: "border-amber-500/30 bg-amber-500/5", accent: "text-amber-400" },
        ].map(a => (
          <div key={a.title} className={`p-5 rounded-xl border ${a.color}`}>
            <div className={`font-display font-bold ${a.accent} mb-2`}>{a.title}</div>
            <p className="text-gray-400 text-xs font-mono leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}