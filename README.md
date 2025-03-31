Anleitung für die Bedienung der DUALISTREAM Website mit Anbindung der Neo4j-Datenbank

1. Voraussetzung:
- Node (Version "v22.14.0") und Node-Package-Manager (Version "11.2.0")
- Docker-Desktop v4.39.0
- Bitte den Branch "Main" Nutzen, diese hat den aktuellen Stand!

2. Starten der Anwendung:
2.1 Im Root-Verzeichnis cd frontend und Eingabe von "npm i" im Terminal
2.2 Im Root-Verzeichnis cd backend und Eingabe von "npm i" im Terminal
2.3 Starten der Anwendung "Docker-Desktop"
2.4 Starten des Docker-Containers mit "docker compose up --build" im Root-Verzeichnis "FilmRecommendation"
2.5 Aufrufen des Front-End über "http://localhost:3000"
2.6 Registrieren eines User-Accounts über "Einloggen" und --> registrieren
2.7 Auf der Filmeseite in der ersten Zeile erscheinen nur Filmevorschläge wenn man bereits einen Film mit mehr als 4 Sternen bewertet haben und andere Nutzer diesen Film auch bewertet haben! Sofern also kein Film in den Filmvorschlägen erscheint, muss man - nachdem man sich registiert und angemeldet hat - mindestenes einen Film mit 4 oder 5 Sternen bewerten, den auch andere Nutzer bewertet haben.

3. User
- Es besteht die Möglichkeit sich als User oder als Admin anzumelden
- Bitte melden Sie sich mit folgenden Admin Anmeldedaten auf der Plattform ein:
    - E-Mail: admin@gmail.com
    - Passwort: admin
- Beispiel User:
    - Email: simonmohnle@gmail.com  
    - Passwort: Hallog4yh!
- Hier stehen Ihnen erweiterte Funktionialitäten wie z.B. das Admin-Panel, sowie die Einsicht der Server-Logs zur Verfügung. Außerdem beinhaltet die Admin-Rolle zudem erweiterte Berechtigung
  wie z.B. das Anlegen von Filmen, Löschen von Filmen, Einsicht aller User, sowie das Löschen von User-Konten und das vorübergehende Sperren von User-Accounts


