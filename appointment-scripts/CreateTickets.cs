using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using iSign;

/////////////
// OPTIONS //
/////////////

const string thisSource = "terminland";
const string planname = "Bürgerbüro";
readonly CommonGuidId queue = CommonGuidId.FromString("f63b5118-317a-4a1e-9926-91075a604288");
readonly CommonGuidId[] categories = new CommonGuidId[0];
//var categories = new CommonGuidId[] { CommonGuidId.FromString("") };

const bool postpone = true;
// Select import time span
readonly var timeFrom = DateTime.Today;
//timeTo = timeFrom.AddDays(1.0);
readonly var timeTo = DateTime.Now.AddMinutes(5);
//timeTo = DateTime.Now;

const string NumberPrefix = "T";
const int NumberLength = 4;

///////////////
// FUNCTIONS //
///////////////

string ExtractNumber(string text) =>
    NumberPrefix + (NumberLength > 0 ? text.Substring(Math.Max(0, text.Length - NumberLength)) : text);

/////////////
// TICKETS //
/////////////

if (timeTo <= timeFrom)
    return;

// filter list by time range [from, to)
var appointments = await vocatis.FindAppointments(source: thisSource, timeFrom: timeFrom, timeTo: timeTo, number: false);
logger.LogInformation("Creating tickets for {0} incoming appointments. (from {1} to {2}", appointments.Count(), timeFrom, timeTo);

appointments = appointments.Where(item => 
    item.UserData.TryGetValue("Plan", out string plan) && plan == planname);
appointments = appointments.ToList();
logger.LogInformation("After filtering for planname '{0}' {1} appointments are left.", planname, appointments.Count());

foreach (var item in appointments)
{
    if (!item.UserData.TryGetValue("Number", out string number))
    {
        logger.LogWarning("Skipping appointment {0}, because it does not have Number data field.", item.Id);
        continue;
    }
    var ticketNum = ExtractNumber(number);
    item.UserData.TryGetValue("Description", out string desc);
    item.UserData.TryGetValue("Url", out string url);
    
    var ticket = vocatis.NewNumber(ticketNum, queue, categories, appointmentId: item.Id);
    ticket.Name = item.Participants;
    ticket.Phone = item.Start.ToLocalTime().ToShortTimeString() + ": " + item.Title;
    ticket.Description = desc;
    ticket.ReferenceId = url;
    vocatis.UpdateNumber(ticket);
    if (postpone)
    {
        vocatis.PostponeNumber(ticket.Id, item.Start);
    }
}