# Display

Dies ist eine iSign Vorlage auf Basis von Angular (http://angular.io)

## Development server

Die Vorlage unterstützt die eigenständige Entwicklung, ohne iSign. Dabei wird die datei 'testdata.json' als Datenquelle verwendet.
Zum Starten des Entwicklungsservers den Befehl `ng serve printer` ausführen. Die App befindet sich in einem zweiten Projekt und wird mit `ng serve app` gestartet

## Test mit iSign

Um eine iSign Vorlage zu erzeugen muss das Projekt mit der Konfiguration "production" ausgeführt weren. Zum Test mit iSign bietet sich der Befehl `ng build --watch printer` bzw `ng build --watch app` an.
In iSign muss dann die Styles.xml aus dem Ordner "dist" importiert werden. Änderungen im src Verzeichnis werden durch die "--watch" Option automatisch übersetzt und in "dist" übernommen.

## Übersetzung

Die Übersetzungen sind in assets/i18n zu finden. Diese können mit https://www.npmjs.com/package/ngx-translate-extract-csv von oder zu CSV konvertiert werden.

## Test Urls

Nur Warteschlagen:
http://localhost:4200/select-queue?s=vocatic_multi_2019
http://localhost:4200/select-queue?s=vocatic_multi_2019&s/mode=print

Nur Termin:
http://localhost:4200/?s=vocm19aponly
http://localhost:4200/?s=vocm19aponly&s/mode=print&s/at=8&s/it=8
http://localhost:4200/?s=vocm19aponly&s/mode=print&s/at=0

http://localhost:4200/?s=vocm19aponly&s/apm=5 // mit QR-Code vergessen
http://localhost:4200/?s=vocm19aponly&s/ap_pn1=1&s/ap_qi1=xxx&s/apm=5 // mit QR-Code vergessen

Mit Auswahl:
http://localhost:4200/?s=vocm19ap&s/ap_pn1=1&s/ap_qi1=xxx&s/mode=print&s/qr=3&s/text1=Warteschlange&s/queueid1=1234
http://localhost:4200/?s=vocm19ap&s/ap_pn1=1&s/ap_qi1=xxx
http://localhost:4200/?s=vocm19ap&s/wt=3 (mit Wartezeit)
http://localhost:4200/?s=vocm19ap&s/ar=d // Pfeil nach unten
http://localhost:4200/?s=vocm19ap&s/apm=2 (nur Terminnummer)
http://localhost:4200/?s=vocm19ap&s/apm=3 (QR und Terminnummer)
http://localhost:4200/?s=vocm19ap&s/apm=5 (mit QR-Code vergessen)
http://localhost:4200/?s=vocm19ap&s/ap_pn1=1&s/ap_qi1=xxx&s/apm=7&s/lt=0&s/mode=print (mit allen Möglichkeiten)
UID:1234

Gruppen:
http://localhost:4200/?s=vocatis_multi_2019_groupconfig
http://localhost:4200/?s=vocatis_multi_2019_groupconfig&s/entry=s (mit Auswahl)

Ticket:
http://localhost:4200/(print:ticket)?view=print
http://localhost:4200/(print:ticket)?view=print&s/qr=3 (mit QR-Code)
http://localhost:4200/?s=vocatis_ticket_default&s/ticketnumber=B12

App:
http://localhost:4201/?q=test (neue Nummer ziehen)
http://localhost:4201/?i=12345 (bestehende Nummer abrufen)

Nur Ansichten ohne Funktion:
Druckstatus:
http://localhost:4200/print-status/ticket/wait
http://localhost:4200/print-status/ticket/print
http://localhost:4200/print-status/ticket/show
http://localhost:4200/print-status/appointment/wait
http://localhost:4200/print-status/appointment/print
http://localhost:4200/print-status/appointment/show
