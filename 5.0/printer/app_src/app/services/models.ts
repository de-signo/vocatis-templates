/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  differnt tems, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
