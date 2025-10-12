export type ModuleBreakdown = {
  name: "roads" | "aviation" | "rail";
  co2e_t: number;
  ci90_t?: number | null;
  quality: "Q1" | "Q2" | "Q3" | "Qx";
  notes: string[];
};

export type ZoneEstimateResponse = {
  zone_id: string;
  window_min: number;
  by_module: ModuleBreakdown[];
  co2e_t: number;
  co2e_ci90_t?: number | null;
  sources: string[];
  coverage_km?: number | null;
  grid_intensity?: {
    value: number;
    zone_name: string;
  };
};

export type ZoneEstimateRequest = {
  geojson: any;
  window_min?: number;
  modules?: { roads?: boolean; aviation?: boolean; rail?: boolean };
  country_hint?: string;
};