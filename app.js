(function () {
  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("cafe-list");
  const mapEl = document.getElementById("map");
  let map = null;
  let tileLoads = 0;

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function directionsUrl(cafe) {
    return (
      "https://www.openstreetmap.org/directions?to=" +
      encodeURIComponent(cafe.lat + "," + cafe.lng)
    );
  }

  function markSelected(id) {
    listEl.querySelectorAll(".cafe-select").forEach((button) => {
      const selected = button.dataset.id === id;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.closest(".cafe").classList.toggle("is-selected", selected);
    });
  }

  function renderList(cafes, onSelect) {
    const fragment = document.createDocumentFragment();
    cafes.forEach((cafe) => {
      const item = document.createElement("li");
      item.className = "cafe";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "cafe-select";
      button.dataset.id = cafe.id;
      button.setAttribute("aria-pressed", "false");

      const name = document.createElement("span");
      name.className = "cafe-name";
      name.textContent = cafe.name;

      const place = document.createElement("span");
      place.className = "cafe-place";
      place.textContent = cafe.neighborhood + " · " + cafe.borough;

      button.append(name, place);
      button.addEventListener("click", () => onSelect(cafe.id));

      const address = document.createElement("p");
      address.className = "cafe-address";
      address.textContent = cafe.address;

      const note = document.createElement("p");
      note.className = "cafe-note";
      note.textContent = cafe.note;

      const links = document.createElement("p");
      links.className = "cafe-links";

      const site = document.createElement("a");
      site.href = cafe.website;
      site.target = "_blank";
      site.rel = "noopener noreferrer";
      site.textContent = "Café site";
      site.setAttribute("aria-label", cafe.name + " website");

      const directions = document.createElement("a");
      directions.href = directionsUrl(cafe);
      directions.target = "_blank";
      directions.rel = "noopener noreferrer";
      directions.textContent = "Directions";
      directions.setAttribute("aria-label", "OpenStreetMap directions to " + cafe.name);

      links.append(site, directions);
      item.append(button, address, note, links);
      fragment.append(item);
    });
    listEl.replaceChildren(fragment);
  }

  function selectCafe(id, entries) {
    const entry = entries.get(id);
    if (!entry) return;
    markSelected(id);
    if (!map || !entry.marker) {
      setStatus(
        "The map is unavailable. " +
          entry.cafe.name +
          " is still listed with its address and links.",
        true
      );
      return;
    }
    map.panTo(entry.marker.getLatLng());
    entry.marker.openPopup();
    setStatus(entry.cafe.name + " selected.");
  }

  function popupHtml(cafe) {
    return (
      '<article class="popup">' +
      "<h3>" + escapeHtml(cafe.name) + "</h3>" +
      "<p>" + escapeHtml(cafe.neighborhood) + ", " + escapeHtml(cafe.borough) + "</p>" +
      "<p>" + escapeHtml(cafe.address) + "</p>" +
      "<p>" + escapeHtml(cafe.note) + "</p>" +
      '<p class="popup-links"><a href="' +
      escapeHtml(cafe.website) +
      '" target="_blank" rel="noopener noreferrer">Café site</a><a href="' +
      escapeHtml(directionsUrl(cafe)) +
      '" target="_blank" rel="noopener noreferrer">Directions</a></p></article>'
    );
  }

  function showTileProblem() {
    if (tileLoads > 0 || mapEl.dataset.tiles === "error") return;
    mapEl.dataset.tiles = "error";
    setStatus(
      "Map tiles did not load. The café list still has addresses, sites, and OpenStreetMap directions.",
      true
    );
  }

  function startMap(cafes, entries) {
    if (typeof L === "undefined" || typeof L.maplibreGL !== "function") {
      mapEl.dataset.mapState = "failed";
      setStatus(
        "The map library did not load. Addresses, café sites, and directions are in the list.",
        true
      );
      return;
    }

    const cafeIcon = L.divIcon({
      className: "cafe-pin",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -14]
    });

    try {
      map = L.map(mapEl);
      cafes.forEach((cafe) => {
        if (!Number.isFinite(Number(cafe.lat)) || !Number.isFinite(Number(cafe.lng))) return;
        const marker = L.marker([cafe.lat, cafe.lng], {
          icon: cafeIcon,
          title: cafe.name,
          keyboard: true,
          alt: cafe.name + ", " + cafe.neighborhood
        });
        marker.bindPopup(popupHtml(cafe), { maxWidth: 280 });
        marker.on("click", () => {
          markSelected(cafe.id);
          setStatus(cafe.name + " selected.");
        });
        marker.addTo(map);
        entries.get(cafe.id).marker = marker;
      });

      const placed = cafes.filter((cafe) => entries.get(cafe.id).marker);
      if (placed.length === 0) {
        mapEl.dataset.mapState = "failed";
        setStatus(
          "None of the cafés had coordinates, so the map has no markers. The list still has addresses and links.",
          true
        );
        return;
      }

      map.fitBounds(
        L.latLngBounds(placed.map((cafe) => [cafe.lat, cafe.lng])).pad(0.25)
      );

      const base = L.maplibreGL({
        style: "https://tiles.openfreemap.org/styles/positron"
      }).addTo(map);
      const gl = base.getMaplibreMap();
      gl.on("load", () => {
        tileLoads += 1;
        mapEl.dataset.tiles = "ok";
        if (statusEl.classList.contains("is-error")) {
          setStatus(cafes.length + " cafés. Choose one from the list or the map.");
        }
      });
      gl.on("error", () => {
        if (tileLoads === 0) showTileProblem();
      });
      window.setTimeout(showTileProblem, 8000);

      mapEl.dataset.mapState = "ready";
      setStatus(cafes.length + " cafés. Choose one from the list or the map.");
      window.addEventListener("resize", () => map.invalidateSize());
      window.requestAnimationFrame(() => map.invalidateSize());
    } catch (error) {
      map = null;
      mapEl.dataset.mapState = "failed";
      setStatus(
        "The map could not be started. Addresses, café sites, and directions are still in the list.",
        true
      );
    }
  }

  async function main() {
    let data;
    try {
      const response = await fetch("data/cafes.json");
      if (!response.ok) throw new Error("Café data request failed (" + response.status + ").");
      data = await response.json();
      if (!data || !Array.isArray(data.cafes)) throw new Error("Café data is missing a list.");
    } catch (error) {
      setStatus(error.message + " Refresh the page and try again.", true);
      return;
    }

    if (data.cafes.length === 0) {
      setStatus("No cafés were found in the local data file.", true);
      return;
    }

    const entries = new Map(data.cafes.map((cafe) => [cafe.id, { cafe, marker: null }]));
    renderList(data.cafes, (id) => selectCafe(id, entries));
    startMap(data.cafes, entries);
  }

  main();
})();
