# Zelda Rando Race Hub - GitHub Bilder

Diese Version erlaubt Profilbilder direkt aus deinem GitHub Repository.

## So nutzt du Profilbilder

1. Erstelle in deinem GitHub Repository einen Ordner:

```text
images
```

2. Lade dort Bilder hoch, z.B.:

```text
wolle_91.png
tantalus.jpg
mrgravy.webp
```

3. Gehe auf deiner Seite in:

```text
Admin -> Racer-Profil bearbeiten
```

4. Trage bei Profilbild ein:

```text
images/wolle_91.png
```

Wichtig:
Der Racer-Name muss genau so heißen wie in den Race-Ergebnissen.

## Unterstützte Bildpfade

Erlaubt sind:

```text
images/name.png
./images/name.png
https://...
http://...
```

## Wichtig beim Update

Wenn du die Version mit Links/Profile schon nutzt:

- GitHub Dateien ersetzen
- `config.js` wieder mit deiner SCRIPT_URL und deinem Passwort ausfüllen
- Apps Script nur ersetzen, wenn deine Version Links/Profile noch nicht hatte

Wenn deine Seite schon Links und Profile speichern kann, reicht meistens:
- `admin.html`
- `data.js`
- `style.css`

trotzdem ist es am einfachsten, alle Dateien aus dieser ZIP hochzuladen.
