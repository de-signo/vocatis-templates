/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stolltec.Vocatis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using iSign;

/////////////
// OPTIONS //
/////////////

const string thisSource = "terminland";
const string terminlandUrl = "https://www.terminland.de/designo_Buergerbuero/";
const string apiKey = "ea47e9d3-bc7d-45ad-b620-e6b5564bb4cb";
const string terminlandStateInHouse = "wahrgenommen";
const string terminlandStateDone = "wahrgenommen";

///////////////
// FUNCTIONS //
///////////////

async Task<bool> TerminlandPutEvent(HttpClient http, string terminNr, string status) {
    // build request
    var url = $"{terminlandUrl}api/event/{terminNr}";
    var msg = new HttpRequestMessage(HttpMethod.Put, url);
    msg.Headers.Add("token", apiKey);
    var jsonReq = JsonSerializer.Serialize(new {
        realStatus = new {
            name = status
        }
    });
    msg.Content = new StringContent(jsonReq, Encoding.UTF8, "application/json");

    // send
    var res = await http.SendAsync(msg);
    if (!res.IsSuccessStatusCode) {
        var errorReturn = await res.Content.ReadAsStringAsync();
        logger.LogWarning("Terminland rest api result: {errorReturn}", errorReturn);
        res.EnsureSuccessStatusCode();
    }


    if (res.Content.Headers.ContentType.MediaType != "application/json")
        throw new ApplicationException("API did not return a json result.");

    // parse
    var stream = await res.Content.ReadAsStreamAsync();
    var ret = await JsonSerializer.DeserializeAsync<Dictionary<string, JsonElement>>(stream, new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    return ret["updated"].GetBoolean();
}
/////////////
// TICKETS //
/////////////

// take all appointment of today, which have a number
readonly var timeFrom = DateTime.Today;
readonly var timeTo = timeFrom.AddDays(1.0);
var appAndNums = await vocatis.FindAppointmentsWithNumbers(source: thisSource, timeFrom: timeFrom, timeTo: timeTo, number: true);
logger.LogInformation("We have {0} appointments with a number assinged", appAndNums.Count());

var http = services.GetService<HttpClient>();
Exception lastSyncEx = null;
foreach (var (appointment, numbers) in appAndNums)
{
    var numC = numbers.Count();
    if (numC == 0) {
        logger.LogWarning("Appointment {0} has no number assigned. Skipping.", appointment.Id);
        continue;
    }
    if (numC > 1) {
        logger.LogWarning("Appointment {0} has more than one number assigned. Using first number.", appointment.Id);
    }
    var number = numbers.FirstOrDefault();

    // convert isign => terminland
    string currentState = null;
    switch (number.State) {
        case WaitNumberState.Waiting:
        case WaitNumberState.Parked:
        case WaitNumberState.Postponed:
        case WaitNumberState.Called:
            currentState = terminlandStateInHouse;
            break;
        case WaitNumberState.Dismissed:
            currentState = terminlandStateDone;
            break;
    }
    vocatis.GetHistory(number.Id);

    // sync state
    appointment.UserData.TryGetValue("UpstreamState", out string lastState);
    if (currentState == lastState)
        continue;

    try {
        var updated = await TerminlandPutEvent(http, appointment.SourceId, currentState);
        appointment.UserData["UpstreamState"] = currentState;
        await vocatis.ApplyAppointment(appointment);
    }
    catch (Exception ex) {
        logger.LogError("Failed to sync appoingment {0}. {1}", appointment.Id, ex);
        lastSyncEx = ex;
    }
}

if (lastSyncEx != null)
    throw lastSyncEx;