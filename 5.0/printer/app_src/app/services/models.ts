export class TicketStatus {
  number: string = "";
  title: string = "";
  state: number = 0;
  position: number = 0;
  estimatedTimeOfCall: number = 0;
  room: string = "";
}

export enum WaitNumberState {
  Waiting,
  Called,
  Dismissed,
  Parked,
  Postponed,
}

export class WaitNumberModel {
  id: string = "";
  number: string = "";
}
