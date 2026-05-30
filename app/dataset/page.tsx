// src/app/dataset/page.tsx

export default function DatasetPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-blue-400 border-b border-gray-700 pb-4">Dataset Preparation</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold">The Source</h2>
        <p className="text-gray-300">
          The model was trained on the <strong>andrewmvd/face-mask-detection</strong> dataset from Kaggle. 
          The raw dataset consisted of 853 complex crowd images rather than isolated faces.
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold">XML Parsing & Bounding Boxes</h2>
        <p className="text-gray-300">
          Because PyTorch cannot natively feed XML data into a Neural Network, a custom parsing script was required. 
          I extracted the <code>xmin</code>, <code>ymin</code>, <code>xmax</code>, and <code>ymax</code> coordinates for every object to crop individual faces.
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2 mt-2">
          <li>Extracted 4,072 individual face images from the raw crowd photos.</li>
          <li>Re-mapped classes to a binary system: <strong>Without Mask (Label 0)</strong> and <strong>With Mask (Label 1)</strong>.</li>
          <li>Applied class weights during training (Without Mask: 2.75, With Mask: 0.61) to penalize errors on the minority class and prevent bias.</li>
        </ul>
      </div>
    </div>
  );
}