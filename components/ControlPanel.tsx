import React, { useState } from 'react';
import { zoneEstimate } from '../services/api';
import type { ZoneEstimateResponse } from '../types';

interface ControlPanelProps {
  onResult: (result: ZoneEstimateResponse | null) => void;
  polygon: any | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onResult, polygon }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!polygon) {
      setError('Draw a zone on the map to begin.');
      return;
    }
    setError(null);
    setLoading(true);
    onResult(null);
    try {
      const res = await zoneEstimate({ 
        geojson: polygon, 
        window_min: 30, 
        modules: { roads: true, aviation: true } 
      });
      onResult(res);
    } catch (e: any) {
      setError(e.message || 'Failed to calculate emissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-5 bg-[#151821] border-r border-[#1d2230] flex flex-col">
      <h1 className="text-xl font-semibold mb-2 tracking-tight text-[#e8eaf1]">Global Transport Emissions</h1>
      <p className="text-[#9aa3b2] text-sm mb-6">Draw a zone on the map. Then run a real-time estimate for Roads + Aviation (LTO).</p>
      <button 
        onClick={run} 
        disabled={loading || !polygon} 
        className="rounded-lg bg-[#3b82f6] text-white py-2 px-3 w-full disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Calculating…' : 'Calculate Emissions'}
      </button>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
};

export default ControlPanel;
