export interface LeanButtonModel {
  queue: string;
  categories: string[];
  title: string;
}

export class WaitNumberModel {
  id: string = "";
  number: string = "";
}

export class AppointmentModel {
  id!: string;
  ref!: string;
  plan!: string;
  time!: string;
  title!: string;
  name!: string;
}
