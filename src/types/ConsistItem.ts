export type AnyConsistItem = StaticConsistItem | JobItem;

export interface ConsistItem {
  id: string;
}

export interface StaticConsistItem extends ConsistItem {
  isStatic: true;
  is_on: boolean;
  can_run: boolean;
}

export interface JobItem extends ConsistItem {
  weight: number;
  length: number;
  start_location: string;
  end_location: string;
  bonus_time_limit: number;
  bonus_time_elapsed: number;
  status: JobStatus;
  end_timestamp?: EpochTimeStamp;
  type: JobType;
}

export enum JobStatus {
  NotStarted = "not_started",
  Active = "active",
  Paused = "paused",
}

export enum JobType {
  Freight = "frieght",
  Shunting = "shunting",
  Logistics = "logistics",
}
