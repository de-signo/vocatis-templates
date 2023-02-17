export interface AppointmentModel {
  id: string;
  source: string;
  sourceid: string;
  start: string;
  title: string;
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
  ref?: string;

  // queue
  queue: string;
  categories: string[];
}
