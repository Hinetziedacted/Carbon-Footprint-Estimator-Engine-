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
  const [windowMin, setWindowMin] = useState(30);
  const [railEnabled, setRailEnabled] = useState(true);

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
        window_min: windowMin, 
        modules: { roads: true, aviation: true, rail: railEnabled } 
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
      
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="window_min" className="block text-sm font-medium text-[#9aa3b2] mb-1">
            Time Window (minutes)
          </label>
          <input
            type="number"
            id="window_min"
            value={windowMin}
            onChange={(e) => setWindowMin(Number(e.target.value))}
            className="w-full bg-[#0f1115] border border-[#1d2230] rounded-md p-2 text-sm text-[#e8eaf1]"
            min="1"
            step="1"
          />
        </div>
        <div className="flex items-center justify-between">
            <label htmlFor="rail-toggle" className="text-sm font-medium text-[#9aa3b2]">
                Include Rail Module
            </label>
            <label htmlFor="rail-toggle" className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="rail-toggle"
                className="sr-only peer" 
                checked={railEnabled}
                onChange={(e) => setRailEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-[#0f1115] peer-focus:outline-none rounded-full peer border border-[#1d2230] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
            </label>
        </div>
      </div>

      <button 
        onClick={run} 
        disabled={loading || !polygon} 
        className="rounded-lg bg-[#3b82f6] text-white py-2 px-3 w-full disabled:opacity-50 transition-opacity mt-2"
      >
        {loading ? 'Calculating…' : 'Calculate Emissions'}
      </button>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
};

export default ControlPanel;