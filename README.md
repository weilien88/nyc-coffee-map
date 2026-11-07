# NYC coffee map

Five New York City cafés on a static Leaflet map with OpenStreetMap tiles. The page is a small demo of checked places. It is not a ranking and it is not a complete list of cafés in the city.

## Run it locally

From this folder:

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/

A local server is needed so the page can load `data/cafes.json`.

## GitHub Pages

The site is the files at the repository root. Publish the `main` branch from `/` (no build step).

Project address, once this public repository has Pages enabled for `main` at `/`:

https://weilien88.github.io/nyc-coffee-map/

That address is the planned project-site URL. Treat it as live only after the Pages deployment is actually checked. Styles, script, and café data use relative paths so they resolve under the `/nyc-coffee-map/` subpath.

## Sources

Locations were checked on 2026-11-07 and copied into `data/cafes.json`. The browser does not geocode, and the page does not draw a route. Each “Directions” link opens OpenStreetMap.

| Café | Address | Website | Coordinate source |
| --- | --- | --- | --- |
| SEY Coffee | 18 Grattan Street, Brooklyn, NY 11206 | https://www.seycoffee.com/pages/cafe | https://www.openstreetmap.org/node/2838596351 |
| Devoción — Williamsburg | 148 Grand Street, Brooklyn, NY 11249 | https://www.devocion.com/pages/cafes | https://www.spota.cafe/cafe/devocion-0q7irs/ |
| La Cabra — SoHo | 284 Lafayette Street, New York, NY 10012 | https://lacabra.com/pages/locations | https://exa.ai/library/place/pynv30w6sxt |
| Everyman Espresso | 136 East 13th Street, New York, NY 10003 | http://www.everymanespresso.com/ | https://exa.ai/library/place/lb1wwv5k6wj |
| Devoción — Flatiron | 25 East 20th Street, New York, NY 10003 | https://www.devocion.com/pages/devocion-cafe-flatiron-district-new-york-ny | https://www.openstreetmap.org/node/9270151458 |

SEY Coffee coordinates are also noted at https://every.coffee/cafe/ny/brooklyn/f-4388/sey-coffee. Devoción — Flatiron coordinates are also noted at https://every.coffee/cafe/ny/new-york/f-7741/devocion.

## Tiles

Tiles are requested from `https://tile.openstreetmap.org/{z}/{x}/{y}.png` as the map is viewed. The page does not prefetch tiles or ship an offline tile pack. OpenStreetMap attribution stays visible on the map and in the footer. Use follows the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
