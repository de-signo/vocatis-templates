<%@ Control Language="c#" AutoEventWireup="false" Inherits="Stolltec.Forms.Show.StyleControlBase, Stolltec.Forms.Core, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<%@ Register Assembly="Stolltec.Forms.Core, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    Namespace="Stolltec.Forms.Show" TagPrefix="st" %>
<%@ Register Assembly="Stolltec.Vocatis, Version=3.0.0.0, Culture=neutral, PublicKeyToken=9b480668faf77978"
    Namespace="Stolltec.Vocatis.Show" TagPrefix="voc" %>
<%--
  VocatisDemo.ascx
  
  Style for Forms 3.0.
  German locale
  Vocatis wait queue list
  
  optimized for Width 1080
--%>
<link href="<%= ResolveUrl("Vocatis1.css") %>" type="text/css" rel="Stylesheet" />
<ajax:toolkitscriptmanager runat="server" combinescripts="false" enablescriptglobalization="true"
    enablescriptlocalization="true" />
<st:StyleDataSource FieldKey="source" runat="server" ID="dsSource" />
<st:ClientDataSource datasourceid="dsSource" runat="server" id="cdsSource" EnableCallback="true" UpdateInterval="2500" />
<%-- visible content --%>
<div class="vocatis1">
    <div class="header">
        Bitte warten Sie bis Ihre Nummer erscheint:
    </div>
    <div runat="server" id="content" class="content">
        <script runat="server" type="text/C#">
            protected override void OnPreRender(EventArgs e)
            {
                base.OnPreRender(e);
                dataView.Data = "{binding data, source=$" + cdsSource.ClientID + "}";
                
                te.Field = StyleInstance["number"].Value as string;
            }
        </script>
        <iss:dataview runat="server" id="dataView" autofetch="true">
    <LayoutTemplate>
    <table><tbody><tr runat="server" id="itemPlaceholder"/>
    </tbody></table>
    </LayoutTemplate>
    <ItemTemplate>
    <table>
    <tbody runat="server" id="itemTemplate">
                <tr>
                    <td class="room">
                    {{<%= StyleInstance["room"].Value %>}}
                    </td>
                    <td class="number">
                    {{<%= StyleInstance["number"].Value %>}}
                    </td>
                </tr>
                 <tr class="spacer">
                    <td colspan="2">
                    </td>
                </tr>
                </tbody>
    </table>
    </ItemTemplate>
    </iss:dataview>
    <voc:HighlightExtender runat="server" ID="te" DataViewID="dataView" Tone="tone.wav" />
    </div>
    <iss:FillBoxExtender runat="server" TargetControlID="content" HideScrollbars="false" />
    
    <st:PlayerLogControl runat="server" />
    <st:ClientLogControl runat="server" />
</div>

