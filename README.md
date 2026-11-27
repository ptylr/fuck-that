# Fuck That!

A very sweary seven-day golf forecast. Serious weather data, deeply unserious verdicts.

Open `index.html` directly in a modern browser, or visit https://ptylr.github.io/fuck-that/. No installation, Node service, backend or API credentials. JavaScript requests live forecasts on load and Refresh.

Five courses: Stratford-on-Avon, Western Gailes, Kilmarnock Barassie, Gailes Links and Dundonald Links. Click any day for the weather measurements, individual forecast models, course ranking evidence and score calculation.

UK Met Office, ECMWF IFS, NOAA GFS and DWD ICON model families are supplied through [Open-Meteo](https://open-meteo.com/). Available complete model forecasts are averaged equally; BBC Weather RSS supplements the first three days. Models can share inputs and some fields can be derived. Missing forecasts are excluded and model disagreement is flagged. Apple Weather and Metcheck are comparison links, not numeric inputs.

Weather quality is 0–100, with wind and rain weighted 35% each and temperature and feels-like weighted 15% each. The final score is `0.08 × (100 − weather) + 0.02 × (100 − course)`, capped at ten, with a minimum 9.5 when any model forecasts severe conditions. Course quality is an editorial calibration informed by linked published rankings, not a publisher’s score. The full method is explained on the page.

Scores 0–3: get the clubs in. Scores 3–6: Creedy might play, but the rest of us aren’t so sure. Scores 6–10: fuck that. This does not establish whether a course is open or replace official weather warnings.

## Attribution

Open-Meteo data is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), with [UK Met Office data](https://open-meteo.com/en/docs/ukmo-api) and the derived forecast blend/scores under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). BBC Weather RSS is used for this non-commercial project. Course photographs are loaded from credited third-party source sites and remain copyright of their respective owners; the data licences do not apply to those photographs.

## Hosting

GitHub Pages serves `index.html` directly from the root of `main`. Only this standalone app is published here.
