import locomotivesData from '../data/locomotives.json';

export interface Locomotive {
  id: string;
  display_name: string;
  nickname?: string;
  weight: number;
  length: number;
  load_rating: LocomotiveLoadRating;
}

export interface LocomotiveLoadRating {
  grade_0_dry: number;
  grade_2_dry: number;
  grade_2_wet: number;
}

export const locomotives: Locomotive[] = locomotivesData;
