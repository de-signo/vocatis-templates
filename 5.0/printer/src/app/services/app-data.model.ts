export interface LeanButtonModel {
  queue: string;
  categories: string[];
  title: string | { [key: string]: string };
}

export class ButtonModel implements LeanButtonModel {
  queue: string = "";
  categories: string[] = [];
  title: string | { [key: string]: string } = "";
  queueLength: number = -1;
  estimateWaitTime: number = -1;
  openCloseStatus: number = 0;
}

export class OpenCloseStatus {
  static None = 0;
  static IsOpen = 0x01;
  static IsFull = 0x02;
  static IsOutsideHours = 0x04;
  static Manual = 0x08;
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

export class ConfigModel {
  groups: GroupModel[] = [];
}

export class GroupModel {
  title!: string | { [key: string]: string };
  items: ButtonModel[] = [];
}
