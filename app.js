(function () {
  "use strict";

  const STORAGE_KEY = "styleswap-demo-v1";
  const demoCommunitySize = 128;
  const colors = ["rose", "lilac", "butter", "sky", "peach", "sage"];
  const promoCaptions = {
    instagram: "A fresh look, already loved. Find your next campus closet favorite with StyleSwap at StFX. Share what you found, swap something you love, and keep good style in circulation.\n\n#StyleSwap #StFXStyle #CampusStyle #WearItAgain",
    tiktok: "POV: your next campus outfit was already in someone's closet. Find, rent, or swap your next favorite with StyleSwap at StFX.\n\n#StyleSwap #StFXStyle #CampusOutfits #OutfitRepeat"
  };
  const suggestedHashtags = "#StyleSwap #StFXStyle #CampusStyle #WearItAgain #CampusOutfits #OutfitRepeat";
  const fallbackEmojis = {
    Outerwear: "🧥", Tops: "👚", Dresses: "👗", Bottoms: "👖", Shoes: "👟", Accessories: "👜"
  };
  const fallbackImages = {
    Outerwear: "images/listings/sunday-trench.jpg",
    Tops: "images/listings/little-wildflower-top.jpg",
    Dresses: "images/listings/after-hours-dress.jpg",
    Bottoms: "images/listings/good-day-denim.jpg",
    Shoes: "images/listings/cloud-nine-sneakers.jpg",
    Accessories: "images/listings/tiny-treasure-bag.jpg"
  };
  let state = loadState();
  let storageAvailable = true;
  let activeListing = null;
  let toastTimer;

  const byId = function (id) { return document.getElementById(id); };
  const grid = byId("listing-grid");
  const searchBox = byId("search-box");
  const categoryFilter = byId("category-filter");
  const typeFilter = byId("type-filter");
  const sizeFilter = byId("size-filter");
  const dialog = byId("request-dialog");
  const requestTypeSelect = byId("request-type");

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

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        // Fall back to the selection-based copy for browsers that reject clipboard access.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("The browser did not allow copying to the clipboard.");
  }

  async function copyPromoText(text, label) {
    try {
      await copyText(text);
      announce(label + " copied. Paste it into your post and add your own photo or video.");
    } catch (error) {
      announce("Couldn't copy automatically. Select the caption or hashtags above and copy them manually.");
    }
  }

  function getListings() {
    return state.addedListings.concat(LISTINGS);
  }

  function renderView() {
    const hashParts = (window.location.hash || "#home").slice(1).split("?", 2);
    const requested = hashParts[0];
    const views = Array.from(document.querySelectorAll("[data-view]"));
    let current = views.some(function (view) { return view.id === requested; }) ? requested : "home";

    if (current === "transaction" || current === "swap-request") {
      const listingId = new URLSearchParams(hashParts[1] || "").get("listing");
      activeListing = getListings().find(function (item) { return String(item.id) === listingId; }) || null;
      const isRental = current === "transaction";
      const validRequest = activeListing
        && (isRental ? activeListing.type !== "Swap" : activeListing.type !== "Rental");
      if (!validRequest) {
        activeListing = null;
        current = "catalogue";
        window.history.replaceState(null, "", "#catalogue");
        announce("That request is no longer available. Choose another piece from the closet.");
      } else {
        renderRequestPage(current);
      }
    }

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
    const image = document.createElement("img");
    image.className = "listing-photo";
    image.src = item.image || fallbackImages[item.category] || fallbackImages.Accessories;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", function () {
      image.remove();
      art.classList.add("listing-art-unavailable");
    });
    const type = document.createElement("span");
    type.className = "listing-type";
    type.textContent = item.type;
    art.append(image, type);

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
    if (item.type === "Swap") {
      price.textContent = "Free swap";
    } else if (item.price === null || item.price === undefined) {
      price.textContent = item.type === "Rental or swap" ? "Rental or swap" : "Free rental";
    } else {
      price.textContent = "$" + item.price + " ";
      const perDay = document.createElement("small");
      perDay.textContent = item.type === "Rental or swap" ? "/ day · free swap" : "/ day";
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
    if (item.type === "Rental or swap") {
      byId("dialog-item").textContent = item.name + " · shared by " + item.owner;
      requestTypeSelect.value = "Rental";
      if (typeof dialog.showModal === "function") dialog.showModal();
      else navigateToRequest(item, "Rental");
      return;
    }
    navigateToRequest(item, item.type);
  }

  function navigateToRequest(item, requestType) {
    const view = requestType === "Swap" ? "swap-request" : "transaction";
    window.location.hash = view + "?listing=" + encodeURIComponent(item.id);
  }

  function renderRequestPage(view) {
    const isRental = view === "transaction";
    const art = byId(isRental ? "transaction-art" : "swap-art");
    const name = byId(isRental ? "transaction-name" : "swap-name");
    const details = byId(isRental ? "transaction-details" : "swap-details");
    art.textContent = activeListing.emoji || fallbackEmojis[activeListing.category] || "♡";
    name.textContent = activeListing.name;
    details.textContent = activeListing.category + " · size " + activeListing.size + " · shared by " + activeListing.owner;
    if (isRental) {
      byId("rental-duration").value = "2";
      updateRentalBreakdown();
    } else {
      byId("swap-form").reset();
    }
  }

  function formatCurrency(amount) {
    return "$" + amount.toFixed(2);
  }

  function getRentalCost(item, days) {
    const subtotal = Math.round((Number(item.price) || 0) * days * 100) / 100;
    const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
    return { subtotal: subtotal, serviceFee: serviceFee, total: subtotal + serviceFee };
  }

  function updateRentalBreakdown() {
    if (!activeListing) return;
    const duration = byId("rental-duration");
    const days = Number(duration.value);
    const cost = getRentalCost(activeListing, days);
    byId("rental-rate-label").textContent = "$" + (Number(activeListing.price) || 0) + "/day × " + duration.selectedOptions[0].textContent.toLowerCase();
    byId("rental-subtotal").textContent = formatCurrency(cost.subtotal);
    byId("rental-service-fee").textContent = formatCurrency(cost.serviceFee);
    byId("rental-total").textContent = formatCurrency(cost.total);
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
      if (request.type === "Rental") {
        meta.textContent = request.estimatedTotal === undefined
          ? "Asked to borrow for " + request.duration
          : "Asked to borrow for " + request.duration + " · est. " + formatCurrency(request.estimatedTotal) + " incl. 10% fee";
      } else {
        meta.textContent = "Free swap · offer: " + request.offer;
      }
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
  document.querySelectorAll("[data-copy-promo]").forEach(function (button) {
    button.addEventListener("click", function () {
      const platform = button.dataset.copyPromo;
      copyPromoText(promoCaptions[platform], platform === "instagram" ? "Instagram caption" : "TikTok caption");
    });
  });
  byId("copy-hashtags").addEventListener("click", function () {
    copyPromoText(suggestedHashtags, "Suggested hashtags");
  });
  byId("share-campaign").addEventListener("click", async function () {
    const shareData = {
      title: "StyleSwap — StFX campus closet",
      text: "Find, rent, or swap your next favorite with StyleSwap at StFX. #StyleSwap #StFXStyle",
      url: window.location.origin + window.location.pathname
    };
    if (typeof navigator.share !== "function") {
      await copyPromoText(shareData.text + "\n" + shareData.url, "StyleSwap link and message");
      return;
    }
    try {
      await navigator.share(shareData);
      announce("StyleSwap share sheet opened.");
    } catch (error) {
      if (error.name !== "AbortError") {
        await copyPromoText(shareData.text + "\n" + shareData.url, "StyleSwap link and message");
      }
    }
  });

  byId("listing-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const priceValue = fields.get("price");
    const listingType = fields.get("type");
    state.addedListings.push({
      id: Date.now(),
      name: fields.get("name").trim(),
      category: fields.get("category"),
      size: fields.get("size"),
      type: fields.get("type"),
      price: listingType === "Swap" || priceValue === "" ? null : Number(priceValue),
      description: fields.get("description").trim(),
      owner: fields.get("owner").trim(),
      emoji: fallbackEmojis[fields.get("category")] || "♡",
      image: fallbackImages[fields.get("category")] || fallbackImages.Accessories,
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
    const item = activeListing;
    const requestType = requestTypeSelect.value;
    dialog.close();
    navigateToRequest(item, requestType);
  });
  byId("rental-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!activeListing || !form.reportValidity()) return;
    const duration = byId("rental-duration");
    const rentalCost = getRentalCost(activeListing, Number(duration.value));
    saveRequest({
      id: Date.now(),
      name: activeListing.name,
      type: "Rental",
      duration: duration.selectedOptions[0].textContent,
      estimatedSubtotal: rentalCost.subtotal,
      estimatedServiceFee: rentalCost.serviceFee,
      estimatedTotal: rentalCost.total,
      createdAt: new Date().toISOString()
    });
  });
  byId("swap-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!activeListing || !form.reportValidity()) return;
    const fields = new FormData(form);
    saveRequest({
      id: Date.now(),
      name: activeListing.name,
      type: "Swap",
      offer: fields.get("offer").trim(),
      description: fields.get("description").trim(),
      estimatedSubtotal: 0,
      estimatedServiceFee: 0,
      estimatedTotal: 0,
      createdAt: new Date().toISOString()
    });
  });

  function saveRequest(request) {
    state.requests.push(request);
    persistState();
    window.location.hash = "#community";
    announce(storageAvailable
      ? "Demo request submitted. Find it in your community activity."
      : "Demo request submitted for this visit. Browser storage is unavailable.");
  }

  byId("rental-duration").addEventListener("change", updateRentalBreakdown);
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
