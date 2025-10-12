import { ZoneEstimateRequest, ZoneEstimateResponse, ModuleBreakdown } from '../types';

// Mock function to simulate fetching grid intensity from ElectricityMaps
const mockFetchGridIntensity = async (geojson: any): Promise<{ value: number; zone_name: string; }> => {
  // In a real app, you'd extract lat/lon from the geojson centroid
  // and make a call to api.electricitymaps.com
  console.log("Mocking ElectricityMaps API call for geojson:", geojson);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Return a randomized but realistic value and a mock zone
  const zones = ['GB', 'FR-IDF', 'US-CAL-CISO', 'DE'];
  const randomZone = zones[Math.floor(Math.random() * zones.length)];
  const randomIntensity = 50 + Math.random() * 400; // gCO2e/kWh

  return {
    value: parseFloat(randomIntensity.toFixed(1)),
    zone_name: randomZone,
  };
};

export async function zoneEstimate(req: ZoneEstimateRequest): Promise<ZoneEstimateResponse> {
  console.log("Mocking API call with request:", req);

  // Simulate a network delay to make it feel real.
  await new Promise(resolve => setTimeout(resolve, 1500));

  // --- Simulate fetching grid intensity ---
  const gridIntensityData = await mockFetchGridIntensity(req.geojson);
  const GI = gridIntensityData.value; // gCO2e/kWh

  // --- Simulate roads calculation using the dynamic GI ---
  const randomFactor = 0.7 + Math.random() * 0.6;
  const evShare = 0.10; // From the original prompt's fleet mix
  const coverageKm = 157.2 * randomFactor;
  const evEnergyKwh = 0.2 * coverageKm; // Simplified: 0.2 kWh/km
  const chargeEff = 0.92;
  const evCo2e_g = (evEnergyKwh / chargeEff) * GI;
  
  const base_roads_t = (12.345 * randomFactor) * (1 - evShare);
  const ev_roads_t = evCo2e_g / 1e6; // grams -> tonnes
  const roads_t = base_roads_t + ev_roads_t;

  const aviation_t = 5.678 * randomFactor;

  const by_module: ModuleBreakdown[] = [
    {
      name: "roads",
      co2e_t: roads_t,
      quality: "Q1",
      notes: [
        "Data from TomTom, OSMnx",
        `Using real-time grid intensity from ElectricityMaps (${GI} gCO₂e/kWh).`
      ],
    },
    {
      name: "aviation",
      co2e_t: aviation_t,
      quality: "Q2",
      notes: ["Data from OpenSky"],
    },
  ];

  let rail_t = 0;
  const sources = ["mock:tomtom", "mock:opensky", "mock:electricitymaps", "factors:EU_COPERT_Euro6_sample.json"];

  if (req.modules?.rail) {
    const railRandomFactor = 0.3 + Math.random() * 0.4;
    const electricTrainShare = 0.6; // 60% electric
    const trainKm = 45 * railRandomFactor;
    
    // Diesel train emissions
    const diesel_rail_t = (trainKm * 3.5) / 1000; // 3.5 kgCO2e/km -> tonnes
    
    // Electric train emissions using grid intensity
    const electricEnergyKwh = 15 * trainKm; // 15 kWh/km
    const gridLoss = 1.08; // 8% grid loss
    const electric_rail_co2e_g = electricEnergyKwh * gridLoss * GI;
    const electric_rail_t = electric_rail_co2e_g / 1e6; // g -> tonnes

    rail_t = (diesel_rail_t * (1 - electricTrainShare)) + (electric_rail_t * electricTrainShare);

    by_module.push({
      name: "rail",
      co2e_t: rail_t,
      quality: "Q2",
      notes: [
        "Data from mock GTFS/GTFS-RT",
        `Using real-time grid intensity for ${Math.round(electricTrainShare * 100)}% of fleet.`
      ],
    });
    sources.push("mock:gtfs");
  }
  
  const mockResponse: ZoneEstimateResponse = {
    zone_id: `zone_${new Date().getTime()}`,
    window_min: req.window_min || 30,
    by_module: by_module,
    co2e_t: roads_t + aviation_t + rail_t,
    sources: sources,
    coverage_km: coverageKm,
    grid_intensity: gridIntensityData,
  };

  return mockResponse;
}