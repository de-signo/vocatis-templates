# Display

Dies ist eine iSign Vorlage auf Basis von Angular (http://angular.io)

## Development server

Die Vorlage unterstützt die eigenständige Entwicklung, ohne iSign. Dabei wird die datei 'testdata.json' als Datenquelle verwendet.
Zum Starten des Entwicklungsservers den Befehl `ng serve` ausführen

## Test mit iSign

Um eine iSign Vorlage zu erzeugen muss das Projekt mit der Konfiguration "production" ausgeführt weren. Zum Test mit iSign bietet sich der Befehl `ng build --watch --prod` an.
In iSign muss dann die Styles.xml aus dem Ordner "dist" importiert werden. Änderungen im src Verzeichnis werden durch die "--watch" Option automatisch übersetzt und in "dist" übernommen.

## Display popup

http://localhost:4200/?s%2Fpopup=simple
