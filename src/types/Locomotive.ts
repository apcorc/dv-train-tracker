
import locomotivesData from '../data/locomotives.json';

export interface Locomotive {
  id: string;
  display_name: string;
  nickname?: string;
  weight: number;
  length: number;
}

export const locomotives: Locomotive[] = locomotivesData;
