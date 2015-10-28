<%@ Control Language="c#" AutoEventWireup="false" Inherits="Stolltec.Forms.Show.StyleControlBase, Stolltec.Forms.Core, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<%@ Register Assembly="Stolltec.Forms.Core, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    Namespace="Stolltec.Forms.Show" TagPrefix="st" %>
<%@ Register Assembly="Stolltec.Vocatis, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    Namespace="Stolltec.Vocatis.Show" TagPrefix="voc" %>
<%--
  VocatisDemo.ascx
  
  Style for Info 3.0
  German locale
  Vocatis wait number dispencer, top style
  
--%>
<link href="<%= ResolveUrl("Vocatis1.css") %>" type="text/css" rel="Stylesheet" />

<st:ViewController runat="server" ID="vc" FieldKey="views" />

<st:PlayerLogControl runat="server" />
<st:ClientLogControl runat="server" />
