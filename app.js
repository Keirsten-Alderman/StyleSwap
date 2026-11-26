(function () {
  "use strict";

  const STORAGE_KEY = "styleswap-demo-v1";
  const demoCommunitySize = 128;
  const colors = ["rose", "lilac", "butter", "sky", "peach", "sage"];
  const fallbackEmojis = {
    Outerwear: "🧥", Tops: "👚", Dresses: "👗", Bottoms: "👖", Shoes: "👟", Accessories: "👜"
  };
  let state = loadState();
  let storageAvailable = true;
  let activeListing = null;
  let activeRequestType = "Rental";
  let toastTimer;

  const byId = function (id) { return document.getElementById(id); };
  const grid = byId("listing-grid");
  const searchBox = byId("search-box");
  const categoryFilter = byId("category-filter");
  const typeFilter = byId("type-filter");
  const sizeFilter = byId("size-filter");
  const dialog = byId("request-dialog");

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        addedListings: Array.isArray(saved.addedListings) ? saved.addedListings : [],
        requests: Array.isArray(saved.requests) ? saved.requests : []
      };
    } catch (error) {
      return { addedListings: [], requests: [] };
    }
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
      announce("Browser storage is unavailable. Your demo activity will last only for this visit.");
    }
  }

  function announce(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 3400);
  }

  function getListings() {
    return state.addedListings.concat(LISTINGS);
  }

  function renderView() {
    const requested = (window.location.hash || "#home").slice(1);
    const views = Array.from(document.querySelectorAll("[data-view]"));
    const current = views.some(function (view) { return view.id === requested; }) ? requested : "home";

    views.forEach(function (view) { view.hidden = view.id !== current; });
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (window.location.hash && current === "home" && requested !== "home") window.history.replaceState(null, "", "#home");
    window.scrollTo(0, 0);
    if (current === "community") renderCommunity();
    if (current === "list-item") updateListingCount();
  }

  function createListingCard(item, index) {
    const card = document.createElement("article");
    card.className = "listing-card";
    const art = document.createElement("div");
    art.className = "listing-art art-" + (item.art || colors[index % colors.length]);
    art.setAttribute("aria-hidden", "true");
    const illustration = document.createElement("span");
    illustration.textContent = item.emoji || fallbackEmojis[item.category] || "♡";
    const type = document.createElement("span");
    type.className = "listing-type";
    type.textContent = item.type;
    art.append(illustration, type);

    const body = document.createElement("div");
    body.className = "listing-body";
    const topline = document.createElement("div");
    topline.className = "listing-topline";
    const category = document.createElement("span");
    category.textContent = item.category;
    const size = document.createElement("span");
    size.className = "listing-size";
    size.textContent = item.size;
    topline.append(category, size);

    const title = document.createElement("h2");
    title.textContent = item.name;
    const description = document.createElement("p");
    description.className = "listing-description";
    description.textContent = item.description;
    const footer = document.createElement("div");
    footer.className = "listing-footer";
    const owner = document.createElement("span");
    owner.className = "listing-owner";
    owner.append(document.createTextNode("shared by "));
    const ownerName = document.createElement("strong");
    ownerName.textContent = item.owner;
    owner.append(ownerName);
    const price = document.createElement("span");
    price.className = "listing-price";
    price.textContent = item.price === null || item.price === undefined ? "Swap only" : "$" + item.price + " ";
    if (item.price !== null && item.price !== undefined) {
      const perDay = document.createElement("small");
      perDay.textContent = "/ day";
      price.append(perDay);
    }
    footer.append(owner, price);
    const button = document.createElement("button");
    button.className = "request-button";
    button.type = "button";
    button.textContent = item.type === "Rental" ? "Request to borrow →" : item.type === "Swap" ? "Propose a swap →" : "Request or swap →";
    button.addEventListener("click", function () { openRequest(item); });
    body.append(topline, title, description, footer, button);
    card.append(art, body);
    return card;
  }

  function renderListings() {
    const query = searchBox.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const type = typeFilter.value;
    const size = sizeFilter.value;
    const matches = getListings().filter(function (item) {
      const searchable = [item.name, item.category, item.description, item.owner, item.size].join(" ").toLowerCase();
      const supportsType = type === "all" || item.type === type || item.type === "Rental or swap";
      return searchable.includes(query)
        && (category === "all" || item.category === category)
        && supportsType
        && (size === "all" || item.size === size);
    });
    grid.replaceChildren.apply(grid, matches.map(createListingCard));
    byId("results-count").textContent = matches.length + (matches.length === 1 ? " piece to discover" : " pieces to discover");
    byId("empty-message").hidden = matches.length > 0;
  }

  function openRequest(item) {
    activeListing = item;
    activeRequestType = item.type === "Swap" ? "Swap" : "Rental";
    byId("dialog-title").textContent = activeRequestType === "Rental" ? "Ask to borrow" : "Propose a swap";
    byId("dialog-item").textContent = item.name + " · shared by " + item.owner;
    byId("rental-options").hidden = activeRequestType !== "Rental";
    byId("swap-options").hidden = activeRequestType !== "Swap";
    byId("request-message").textContent = "";
    byId("send-request").textContent = activeRequestType === "Rental" ? "Send borrow request ↗" : "Send swap request ↗";
    byId("swap-offer").value = "";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else announce("Your browser does not support the request dialog.");
  }

  function renderCommunity() {
    const students = demoCommunitySize;
    const connections = Math.round(students * (students - 1) / 2);
    byId("hero-member-count").textContent = demoCommunitySize;
    const intro = byId("community-intro");
    intro.replaceChildren(document.createTextNode(demoCommunitySize + " students."));
    intro.append(document.createElement("br"), document.createTextNode("So many second looks."));
    byId("stat-listings").textContent = getListings().length.toLocaleString();
    byId("stat-connections").textContent = connections.toLocaleString();
    byId("stat-requests").textContent = state.requests.length.toLocaleString();
    byId("chart-connections").textContent = connections.toLocaleString();
    renderActivity();
    updateListingCount();
  }

  function renderActivity() {
    const container = byId("activity-list");
    if (state.requests.length === 0) {
      const empty = document.createElement("p");
      empty.className = "activity-empty";
      empty.textContent = "No requests yet. Find a piece you love and send a pretend request.";
      container.replaceChildren(empty);
      return;
    }
    const items = state.requests.slice().reverse().map(function (request) {
      const row = document.createElement("article");
      row.className = "activity-item";
      const details = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = request.type + " request · " + request.name;
      const meta = document.createElement("span");
      meta.textContent = request.type === "Rental" ? "Asked to borrow for " + request.duration : "Swap offer: " + request.offer;
      details.append(title, meta);
      const status = document.createElement("span");
      status.textContent = "Demo sent";
      row.append(details, status);
      return row;
    });
    container.replaceChildren.apply(container, items);
  }

  function updateListingCount() {
    byId("aside-listing-count").textContent = getListings().length;
  }

  window.addEventListener("hashchange", renderView);
  [searchBox, categoryFilter, typeFilter, sizeFilter].forEach(function (control) {
    control.addEventListener(control === searchBox ? "input" : "change", renderListings);
  });
  byId("clear-filters").addEventListener("click", function () {
    searchBox.value = "";
    categoryFilter.value = "all";
    typeFilter.value = "all";
    sizeFilter.value = "all";
    renderListings();
  });

  byId("listing-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const priceValue = fields.get("price");
    state.addedListings.push({
      id: Date.now(),
      name: fields.get("name").trim(),
      category: fields.get("category"),
      size: fields.get("size"),
      type: fields.get("type"),
      price: priceValue === "" ? null : Number(priceValue),
      description: fields.get("description").trim(),
      owner: fields.get("owner").trim(),
      emoji: fallbackEmojis[fields.get("category")] || "♡",
      art: colors[(state.addedListings.length + LISTINGS.length) % colors.length]
    });
    persistState();
    form.reset();
    byId("listing-message").textContent = "Your fictional listing is now in the campus closet.";
    renderListings();
    updateListingCount();
    announce(storageAvailable ? "Listing added to your demo closet." : "Listing added for this visit; browser storage is unavailable.");
  });

  byId("request-form").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!activeListing) return;
    const offer = byId("swap-offer").value.trim();
    if (activeRequestType === "Swap" && !offer) {
      byId("swap-offer").setCustomValidity("Add a short description of the item you would offer.");
      byId("swap-offer").reportValidity();
      return;
    }
    byId("swap-offer").setCustomValidity("");
    state.requests.push({
      id: Date.now(),
      name: activeListing.name,
      type: activeRequestType,
      duration: byId("rental-duration").value,
      offer: offer,
      createdAt: new Date().toISOString()
    });
    persistState();
    dialog.close();
    renderCommunity();
    announce("Demo request sent. Find it in your community activity.");
  });
  byId("swap-offer").addEventListener("input", function () { this.setCustomValidity(""); });
  byId("dialog-close").addEventListener("click", function () { dialog.close(); });
  byId("clear-activity").addEventListener("click", function () {
    state.requests = [];
    persistState();
    renderCommunity();
    announce("Your demo requests have been cleared.");
  });
  byId("listing-form").addEventListener("input", function () { byId("listing-message").textContent = ""; });
  if (!storageAvailable) announce("Browser storage is unavailable. Your demo activity will last only for this visit.");

  renderListings();
  renderView();
})();
