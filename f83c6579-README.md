# 🎤 Live Sprach-Übersetzer (Web-Version)

Ein Live-Übersetzer, der auf **jedem Gerät** funktioniert - besonders iPhone!

## ✨ Features

- 🎤 **Live Spracherkennung** über Mikrofon
- 🌍 **Echtzeit-Übersetzung** in 7 Sprachen
- 📱 **iPhone-optimiert** (funktioniert in Safari)
- 🆓 **Komplett kostenlos** - keine API-Keys nötig
- 🚀 **Einfach zu hosten** auf Netlify oder GitHub Pages

## 🚀 So bringst du es online

### Option 1: Netlify Drop (Super schnell - 1 Minute)

1. Gehe zu [app.netlify.com/drop](https://app.netlify.com/drop)
2. Ziehe alle 4 Dateien ins Browser-Fenster
3. Fertig! Du bekommst sofort eine URL

### Option 2: GitHub + Netlify (Empfohlen)

1. **GitHub Repository erstellen:**
   - Gehe zu [github.com/new](https://github.com/new)
   - Name: `live-translator` (oder was du willst)
   - Klicke "Create repository"
   - Lade die 4 Dateien hoch (Upload files)

2. **Mit Netlify verbinden:**
   - Gehe zu [netlify.com](https://www.netlify.com/)
   - Klicke "Add new site" → "Import from Git"
   - Wähle dein GitHub Repository
   - Klicke "Deploy site"
   - Fertig! Du bekommst eine URL wie `https://dein-name.netlify.app`

### Option 3: Lokal testen

1. Öffne `index.html` direkt im Browser
2. Oder starte einen lokalen Server:
   ```bash
   python -m http.server 8000
   ```
3. Öffne `http://localhost:8000`

## 📱 Am iPhone nutzen

1. **Website öffnen:** Öffne deine Netlify-URL in Safari
2. **Mikrofon erlauben:** Beim ersten Mal auf "Erlauben" tippen
3. **Sprachen wählen:** Quell- und Zielsprache auswählen
4. **Start:** Auf "🎤 Start" tippen und sprechen
5. **Als App speichern (optional):**
   - Teilen-Button → "Zum Home-Bildschirm"
   - Jetzt wie eine echte App!

## 🌍 Unterstützte Sprachen

- 🇩🇪 Deutsch
- 🇬🇧 English
- 🇪🇸 Español
- 🇫🇷 Français
- 🇮🇹 Italiano
- 🇹🇷 Türkçe
- 🇸🇦 العربية

## 🔧 Technische Details

- **Spracherkennung:** Web Speech API (in Safari integriert)
- **Übersetzung:** MyMemory API (kostenlos, kein Key nötig)
- **Browser:** Safari (iPhone), Chrome, Edge, Firefox
- **Keine Installation nötig** - läuft komplett im Browser

## 💡 Tipps

- Sprich **deutlich** und nicht zu schnell
- Vermeide **laute Hintergrundgeräusche**
- In Safari die **Mikrofon-Berechtigung** erlauben
- Für beste Ergebnisse: Kopfhörer mit Mikrofon nutzen

## 🐛 Probleme?

**Mikrofon funktioniert nicht:**
- Einstellungen → Safari → Mikrofon → "Erlauben"

**Keine Übersetzung:**
- Internetverbindung prüfen
- Andere Sprache probieren

**Funktioniert nicht im Browser:**
- Safari oder Chrome verwenden (Firefox kann Probleme haben)

## 📄 Dateien

- `index.html` - Hauptseite
- `style.css` - Design
- `app.js` - Logik (Spracherkennung + Übersetzung)
- `README.md` - Diese Anleitung

## 🎉 Viel Spaß!

Jetzt kannst du Live-Übersetzungen auf deinem iPhone nutzen!
