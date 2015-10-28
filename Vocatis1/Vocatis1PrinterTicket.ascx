<%@ Control Language="c#" AutoEventWireup="false" Inherits="Stolltec.Forms.Show.StyleControlBase, Stolltec.Forms.Core, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<%@ Register Assembly="Stolltec.Forms.Core, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    Namespace="Stolltec.Forms.Show" TagPrefix="st" %>
<%@ Register Assembly="Stolltec.Vocatis, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    Namespace="Stolltec.Vocatis.Show" TagPrefix="voc" %>
<%--
  VocatisDemo.ascx
  
  Style for Stolltec.Forms 2.1.
  German locale
  Vocatis wait number dispencer, ticket style
  
--%>
<div class="vocatis2_ticket">
    
        <div>
            <voc:TicketNumber runat="server" ID="tn"/>
            <st:StyleElementProperty runat="server" TargetControlID="tn" PropertyName="QueueId" FieldKey="queueid" />
        </div>
        <p>
            <%= DateTime.Now.ToString("dd.MM.yyyy") %>
        </p>
        <p>
            Wird Ihre Nummer angezeigt, begeben Sie sich bitte an den entsprechenden Anmeldeplatz</p>
 
</div>
