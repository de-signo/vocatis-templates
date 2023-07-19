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
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using iSign;
using Stolltec.Vocatis;


/////////////
// OPTIONS //
/////////////
// source name in vocatis appointments
const string thisSource = "terminland";

// field names
const string idField = "TerminNr";
const string dateField = "Datum";
const string timeField = "Uhrzeit";
//const string timestampField = "ts";
const string nameField = "Nachname";
const string titleField = "Nachname";
const string descriptionField = "Hinweistext";
const string urlField = "Termin anzeigen";
const string planField = "Terminplan";
const string numberField = "Referenz-Nr;";
const string stateField = "Status";

// define timezone of the import
DateTimeStyles parseFlags = DateTimeStyles.AssumeLocal;
//DateTimeStyles parseFlags = DateTimeStyles.AssumeUniversal;

// define how to read datetime
var format = new CultureInfo("de-DE");
// separate date and time
DateTime ReadDateTime(IDictionary<string, object> item) => DateTime.Parse((string)item[dateField], format, parseFlags) + TimeSpan.Parse((string)item[timeField]);
// date and time in on e string
//DateTime ReadDateTime(IDictionary<string, string> item) => DateTime.Parse((string)item[timestampField], format, parseFlags);

// Select import time span (local time!)
DateTime timeFrom = DateTime.Today;
DateTime timeTo = timeFrom.AddDays(1.0);

////////////
// Functions //
////////////

string Normalize(string text) =>
    (text.StartsWith("=\"") && text.EndsWith("\"")) ?
        text.Substring(2, text.Length - 3) : text;

////////////
// Import //
////////////
if (timeTo <= timeFrom)
    return;

// filter list by time range [from, to)
var importList = (from item in importData
              let start = ReadDateTime(item)
              where start >= timeFrom && start < timeTo
              orderby start ascending
              select new {
                Id = (string)item[idField],
                Start = start,
                Name = (string)item[nameField],
                Title = (string)item[titleField],
                Desc = (string)item[descriptionField],
                Url = (string)item[urlField],
                Plan = Normalize((string)item[planField]),
                Number = (string)item[numberField]
            }).ToList();
logger.LogInformation("Got {0} incoming appointments for the timespan [{1},{2})", importList.Count, timeFrom, timeTo);


// find existing appointments
var existingList = await vocatis.FindAppointments(source:thisSource, sourceIds:importList.Select(i => i.Id));
logger.LogInformation("Found {0} matching appointments", existingList.Count());

// add = importList / existingList
// remove = existingList / importList
// update = importList & existingList
var exisitingIds = new HashSet<string>(existingList.Select(x=>x.SourceId));
var addList = importList.Where(imp => !exisitingIds.Contains(imp.Id)).ToList();
var importedIds = new HashSet<string>(importList.Select(x=>x.Id));
var removeList = existingList.Where(ex => !importedIds.Contains(ex.SourceId)).Select(r => r.SourceId).ToList();
var updateList = importList.Where(imp => exisitingIds.Contains(imp.Id)).ToList();

if (removeList.Any())
{
    logger.LogInformation("Removing {0} appointments (deleted upstream)", removeList.Count);
    await vocatis.RemoveAppointments(source: thisSource, sourceIds: removeList);
}

if (addList.Any())
{
    logger.LogInformation("Adding {0} appointments)", addList.Count);
    var addAppointments = from item in addList
        select new AppointmentInfo() {
            Title = item.Title,
            Start = item.Start,
            Participants = item.Name,
            UserData = new Dictionary<string, string>() {
                { "Description", item.Desc },
                { "Url", item.Url },
                { "Plan", item.Plan },
                { "Number", item.Number }
            },
            Source = thisSource,
            SourceId = item.Id
        };
    await vocatis.AddAppointments(addAppointments); 
}

if (updateList.Any())
{
    logger.LogInformation("Updating {0} appointments)", updateList.Count);
    var updateAppointments = from item in updateList
        select new AppointmentInfo() {
            Title = item.Title,
            Start = item.Start,
            Participants = item.Name,
            UserData = new Dictionary<string, string>() {
                { "Description", item.Desc },
                { "Url", item.Url },
                { "Plan", item.Plan },
                { "Number", item.Number }
            },
            Source = thisSource,
            SourceId = item.Id
        };
    await vocatis.UpdateAppointments(updateAppointments, AppointmentIdMatchMode.SourceId);
}
