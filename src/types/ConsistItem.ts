export type AnyConsistItem = StaticConsistItem | JobItem;

export interface ConsistItem {
    id: string;
}

export interface StaticConsistItem extends ConsistItem {
    isStatic: true;
}

export interface JobItem extends ConsistItem {
    weight: number;
    length: number;
    start_location: string;
    end_location: string;
    bonus_time_limit: number;
    bonus_time_elapsed: 0;
    status: JobStatus;
}

export enum JobStatus {
  NotStarted = "not_started",
  Active = "active",
  Paused = "paused",
}
