import { ZoneEstimateRequest, ZoneEstimateResponse } from '../types';

export async function zoneEstimate(req: ZoneEstimateRequest): Promise<ZoneEstimateResponse> {
  console.log("Mocking API call with request:", req);

  // In a real application, you would fetch from a backend:
  // const url = 'http://localhost:8000'; 
  // const res = await fetch(`${url}/api/v1/zone-estimate`, { ... });
  
  // For this demo environment, we return mock data to prevent "failed to fetch" errors.
  // We'll simulate a network delay to make it feel real.
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Create a dynamic mock response
  const randomFactor = 0.7 + Math.random() * 0.6; // Randomness between 0.7 and 1.3
  const roads_t = 12.345 * randomFactor;
  const aviation_t = 5.678 * randomFactor;
  
  const mockResponse: ZoneEstimateResponse = {
    zone_id: `zone_${new Date().getTime()}`,
    window_min: req.window_min || 30,
    by_module: [
      {
        name: "roads",
        co2e_t: roads_t,
        quality: "Q1",
        notes: ["Data from TomTom, OSMnx"],
      },
      {
        name: "aviation",
        co2e_t: aviation_t,
        quality: "Q2",
        notes: ["Data from OpenSky"],
      },
    ],
    co2e_t: roads_t + aviation_t,
    sources: ["mock:tomtom", "mock:opensky", "factors:EU_COPERT_Euro6_sample.json"],
    coverage_km: 157.2 * randomFactor,
  };

  return mockResponse;
}