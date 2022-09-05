export interface LeanButtonModel {
  queue: string;
  categories: string[];
  title: string;
  printView: "" | "forgot" | "appointment";
}

export class WaitNumberModel {
  id: string = "";
  number: string = "";
}

export class AppointmentModel {
  id!: string;
  ref!: string;
  time!: Date;
  title!: string;
  name!: string;
}
