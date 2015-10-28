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
  Vocatis wait number dispencer
  
--%>

<!-- view -->
<div runat="server" id="vocatis2" class="vocatis2">
    <h1>
        Bitte drucken Sie eine Wartenummer für die Anmeldung aus.
    </h1>
    <img src="arrow_down.png" runat="server" alt="arrow" />
    <div runat="server" id="button" class="button">
        <p>S&nbsp;T&nbsp;A&nbsp;R&nbsp;T</p>
    </div>
    <ajax:RoundedCornersExtender TargetControlID="button" runat="server" Corners="All" Radius="10" />
    <div runat="server" id="printPopup" style="display: none;" class="popup1">
        <h1>Einen Moment ...</h1>
        <img src="printer.gif" runat="server" alt="printer" />
    </div>
    <div runat="server" id="takePopup" style="display: none;" class="popup2">
        <h1>Bitte entnehmen Sie<br />Ihre Wartenummer.</h1>
        <img src="arrow_right.png" runat="server" alt="arrow" />
    </div>
</div>

<!-- behavior -->
<st:PrinterStatusReporter runat="server" />
<voc:TokenButtonExtender runat="server" ID="tbe" TargetControlID="button" PrintPopupControlID="printPopup" TakePopupControlID="takePopup" />
<st:DisableSelectExtender runat="server" TargetControlID="vocatis2" />
<script runat="server">
    protected override void OnPreRender(EventArgs e)
    {
        var vc = FormsHelper.FindParentViewController(this);
        tbe.PrintUrl = Stolltec.Forms.Show.FormsHelper.GenerateViewUrl(vc, "printer").OriginalString;
        base.OnPreRender(e);
    }
</script>
