
(function(sitejs, $) {

    function setNextTrack() {
        var audio = sitejs._audio;
        if (audio.children.length > 0)
        {
            audio.load();
            audio.play();
        }
    }

    sitejs.initVocatis = function(refreshInterval, highlight)
    {
        var popupContent = $("#popup").html();
        var audio = sitejs._audio = document.getElementById("notify");

        if (audio) {
            audio.addEventListener("ended", function(e) {
                audio.removeChild(audio.children[0]);
                setNextTrack();
            }, false);

            audio.addEventListener("error", function(e) {
                console.error("Audio has error.");
            }, false);
        }

        $("#list")
            .vocatisList({
                interval: refreshInterval
            })
            .highlightNumbers({
                items: "tr:not(.spacer)",
                call: function (items) {
                    if (highlight) {
                        items.forEach(function(item) {
                            item.element.classList.add("highlight");
                        });
                    }
                    if (audio) {
                        items.forEach(function(item) {
                            var source = document.createElement("source");
                            var atSrc = document.createAttribute("src");
                            atSrc.value = $(audio).data("src").replace("~number~", item.number).replace("~room~", item.room);
                            source.attributes.setNamedItem(atSrc);
                            var atType = document.createAttribute("type");
                            atType.value = "audio/mp3";
                            source.attributes.setNamedItem(atType);
                            audio.appendChild(source);
                        });
                        if (audio.paused) {
                            setNextTrack();
                        }
                    }
                    if (popupContent) {
                        $("#popup").html(popupContent.replace("~number~", items[0].number).replace("~room~", items[0].room)).show();
                        window.setTimeout(function () { $("#popup").hide(); }, 10000);
                    }
                }
            });
    };

})(window.sitejs = window.sitejs || {}, jQuery);
