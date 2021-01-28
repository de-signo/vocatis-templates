
(function(sitejs, $) {
    sitejs.initVocatis = function(refreshInterval)
    {
        var popupContent = $("#popup").html();

        $("#list")
            .vocatisList({
                interval: refreshInterval
            })
            .highlightNumbers({
                items: "tr:not(.spacer)",
                call: function (items) {
                    var audio = document.getElementById("notify");
                    if (audio) {
                        audio.src = $(audio).data("src").replace("~number~", items[0].number).replace("~room~", items[0].room);
                        audio.play();
                    }
                    if (popupContent) {
                        $("#popup").html(popupContent.replace("~number~", items[0].number).replace("~room~", items[0].room)).show();
                        window.setTimeout(function () { $("#popup").hide(); }, 10000);
                    }
                }
            });
    };

})(window.sitejs = window.sitejs || {}, jQuery);

$(document).ready(function () {
    sitejs.initVocatis(2500);
});