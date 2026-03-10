export type JobStatus =
  | 'new'
  | 'in_progress'
  | 'awaiting_parts'
  | 'done'
  | 'invoiced';

export const STATUS_LABELS: Record<JobStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  awaiting_parts: 'Awaiting Parts',
  done: 'Done',
  invoiced: 'Invoiced',
};

export const STATUS_ORDER: JobStatus[] = [
  'new',
  'in_progress',
  'awaiting_parts',
  'done',
  'invoiced',
];

export const APPLIANCE_TYPES = [
  'Washing Machine',
  'Dryer',
  'Refrigerator',
  'Freezer',
  'Dishwasher',
  'Oven / Stove',
  'Microwave',
  'Air Conditioner',
  'Furnace / Heater',
  'Water Heater',
  'Garbage Disposal',
  'Other',
];

export const FREE_JOB_LIMIT = 10;
