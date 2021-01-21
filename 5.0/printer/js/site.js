
// P1_Appointment.cshtml
(function (site, $) {

function hookupSite() {
  // Qr code
  // make absolute
  var a = document.createElement("a");
  a.href = $(".qrcode").data("url");
  $(".qrcode").qrcode({
    text: a.href,
    fill: '#706f6f',
    background: '#dadada'
  });

  // Printing
  var printOptions = {
    legacy: false,
    printErrorTimeout: 60000,
    stripBody: false,

    beginPrint: function() {
      if ($(".print-now").length == 0)
      {
        $("#waitPopup").show();
      }
    },
    endPrint: function() {
      $("#waitPopup").hide();
      $("#takePopup").show();
    },
    failPrint: function() {
      $("#waitPopup").hide();
    }
  };
  $(".print-button").unbind().printTicket(printOptions);
  $(".print-now").each(function() {
    var pt = new vocatis.printTicket(printOptions);
    pt.startPrint(this.href);
  });
};

site.loadStage2 = function(text) {
  $("#stages").html($("#loading").html());
  var url = site._stage2Url.replace("--text--", encodeURI(text));
  $.ajax({
    url: url,
    cache: false
  }).done(function (result) {
    $("#stages").html($(result).html());
    hookupSite();
  });
};

site._stage2Url = null;
site._timeoutHandle = null;
site.init = function(stage2Url) {
  site._stage2Url = stage2Url;
  $('#scan').on("keydown", function() {
    if (site._timeoutHandle) {
      window.clearTimeout(site._timeoutHandle);
    }
    site._timeoutHandle = window.setTimeout(function() {
      site.loadStage2($("#scan").val());
    }, 100);
  }).blur(function() {
    window.setTimeout(function () { $("#scan").focus(); }, 20);
  }).focus();
  hookupSite();
};

})(window.appointment = window.appointment || {}, jQuery);