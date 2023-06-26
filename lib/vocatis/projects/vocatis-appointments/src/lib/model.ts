export interface AppointmentModel {
  id: string;
  source: string;
  sourceId: string;
  start: string;
  title: string;
  participants: string;
  userData: { [key: string]: string };
}

export interface WaitNumberRequestModel {
  appointment: string;
  // number
  number?: string;
  postpone?: Date;

  // info
  name?: string;
  phone?: string;
  description?: string;
  ref?: string;

  // queue
  queue: string;
  categories: string[];
}
