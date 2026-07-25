import stationsData from "../data/stations.json";

export enum StationService {
  Repair = "repair",
  DieselService = "diesel-service",
  ElectricCharger = "electric-charger",
  Shop = "shop",
  CoalService = "coal-service",
  Museum = "museum",
}

export enum TrackType {
  Storage = "storage",
  Passenger = "passenger",
  Loading = "loading",
  Input = "input",
  Output = "output",
}

export interface Track {
  number: number;
  type: TrackType[];
  display_name: string;
}

export interface Yard {
  id: string;
  name: string;
  tracks: Track[];
}

export interface Station {
  name: string;
  code: string;
  yards: Yard[];
  services: StationService[];
}

export const stations: Station[] = (stationsData as any[]).map(station => ({
  ...station,
  services: (station.services || []).map((s: string) => s as StationService),
  yards: (station.yards || []).map((yard: any) => ({
    ...yard,
    tracks: (yard.tracks || []).map((track: any) => ({
      ...track,
      type: (track.type || []).map((t: string) => t as TrackType),
    })),
  })),
}));
