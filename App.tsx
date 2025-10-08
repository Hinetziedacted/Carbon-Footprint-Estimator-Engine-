import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import MapCanvas from './components/MapCanvas';
import type { ZoneEstimateResponse } from './types';

const ResultsDisplay: React.FC<{ result: ZoneEstimateResponse }> = ({ result }) => {
    return (
        <div className="p-5 text-sm">
            <h2 className="text-lg font-medium mb-2 text-[#e8eaf1]">Results</h2>
            <div className="grid grid-cols-2 gap-y-1 gap-x-4 bg-[#151821] p-4 rounded-lg border border-[#1d2230]">
                <div className="font-extrabold text-lg">Total CO₂e</div>
                <div className="text-right font-extrabold text-lg">{result.co2e_t.toFixed(3)} t</div>

                {result.by_module.map((m) => (
                    <React.Fragment key={m.name}>
                        <div className="capitalize text-[#9aa3b2] mt-2">{m.name}</div>
                        <div className="text-right text-[#9aa3b2] mt-2">{m.co2e_t.toFixed(3)} t ({m.quality})</div>
                        
                        {m.notes && m.notes.length > 0 && (
                            <div className="col-span-2 pl-4">
                                <ul className="list-disc list-inside text-xs text-gray-400">
                                    {m.notes.map((note, index) => (
                                        <li key={index}>{note}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </React.Fragment>
                ))}

                {result.coverage_km != null && (
                    <>
                        <div className="text-[#9aa3b2] mt-2">Road coverage</div>
                        <div className="text-right text-[#9aa3b2] mt-2">{result.coverage_km.toFixed(0)} km</div>
                    </>
                )}
            </div>
            <div className="text-[#9aa3b2] mt-3 text-xs break-all">
                <span className="font-semibold">Sources:</span> {result.sources?.join(', ')}
            </div>
        </div>
    );
};


export default function App() {
  const [polygon, setPolygon] = useState<any | null>(null);
  const [result, setResult] = useState<ZoneEstimateResponse | null>(null);

  return (
    <main className="h-full w-full bg-[#0f1115] text-[#e8eaf1]">
      <div className="h-full grid grid-cols-1 md:grid-cols-[400px_1fr]">
        <div className="flex flex-col h-full overflow-y-auto">
          <ControlPanel polygon={polygon} onResult={setResult} />
          {result && <ResultsDisplay result={result} />}
        </div>
        <div className="h-full w-full grayscale contrast-[1.1] brightness-[0.8]">
          <MapCanvas onPolygon={setPolygon} />
        </div>
      </div>
    </main>
  );
}