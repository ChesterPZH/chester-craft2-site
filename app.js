function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

function applyPublicationDualFilter() {
  const shell = document.querySelector(".filter-shell");
  if (!shell || !shell.querySelector("#pub-contrib-all")) return;
  const categoryRadios = shell.querySelectorAll('input[name="pub-category"]');
  const contributorRadios = shell.querySelectorAll('input[name="pub-contributor"]');
  const items = shell.querySelectorAll(".filter-panels .pub-item");
  const categoryMap = { "pub-all": null, "pub-xr": "xr", "pub-cv": "cv", "pub-robot": "robot", "pub-ai": "ai", "pub-haptics": "haptics", "pub-access": "access" };
  const contribMap = {
    "pub-contrib-all": null,
    "pub-contrib-craft2": "craft2",
    "pub-contrib-personal": "personal",
  };
  const getChecked = (radios) => Array.from(radios).find((r) => r.checked);
  const categoryId = getChecked(categoryRadios)?.id;
  const contribId = getChecked(contributorRadios)?.id;
  const categoryVal = categoryMap[categoryId];
  const contribVal = contribMap[contribId];
  items.forEach((el) => {
    const cat = el.getAttribute("data-category") || "";
    const contrib = el.getAttribute("data-contributor") || "";
    const categoryMatch = categoryVal == null || cat.split(/\s+/).includes(categoryVal);
    const contributorMatch = contribVal == null || contrib.split(/\s+/).includes(contribVal);
    el.style.display = categoryMatch && contributorMatch ? "grid" : "none";
  });
}

function applyMiscDualFilter() {
  const shell = document.querySelector(".filter-shell");
  if (!shell || !shell.querySelector("#misc-contrib-all")) return;
  const categoryRadios = shell.querySelectorAll('input[name="misc-category"]');
  const contributorRadios = shell.querySelectorAll('input[name="misc-contributor"]');
  const items = shell.querySelectorAll(".filter-panels .misc-card");
  const categoryMap = { "misc-all": null, "misc-research": "research", "misc-course": "course", "misc-advising": "advising" };
  const contribMap = { "misc-contrib-all": null, "misc-contrib-craft2": "craft2", "misc-contrib-personal": "personal" };
  const getChecked = (radios) => Array.from(radios).find((r) => r.checked);
  const categoryId = getChecked(categoryRadios)?.id;
  const contribId = getChecked(contributorRadios)?.id;
  const categoryVal = categoryMap[categoryId];
  const contribVal = contribMap[contribId];
  items.forEach((el) => {
    const cat = el.getAttribute("data-category") || "";
    const contrib = el.getAttribute("data-contributor") || "";
    const categoryMatch = categoryVal == null || cat.split(/\s+/).includes(categoryVal);
    const contributorMatch = contribVal == null || contrib.split(/\s+/).includes(contribVal);
    el.style.display = categoryMatch && contributorMatch ? "block" : "none";
  });
}

function applyGalleryDualFilter() {
  const shell = document.querySelector(".filter-shell");
  if (!shell || !shell.querySelector("#gal-contrib-all")) return;
  const categoryRadios = shell.querySelectorAll('input[name="gal-category"]');
  const contributorRadios = shell.querySelectorAll('input[name="gal-contributor"]');
  const items = shell.querySelectorAll(".filter-panels .gallery-item");
  const categoryMap = {
    "gal-all": null,
    "gal-visual": "visual",
    "gal-events": "events",
    "gal-photo": "photo",
  };
  const contribMap = { "gal-contrib-all": null, "gal-contrib-craft2": "craft2", "gal-contrib-personal": "personal" };
  const getChecked = (radios) => Array.from(radios).find((r) => r.checked);
  const categoryId = getChecked(categoryRadios)?.id;
  const contribId = getChecked(contributorRadios)?.id;
  const categoryVal = categoryMap[categoryId];
  const contribVal = contribMap[contribId];
  items.forEach((el) => {
    const cat = el.getAttribute("data-category") || "";
    const contrib = el.getAttribute("data-contributor") || "";
    const categoryMatch = categoryVal == null || cat.split(/\s+/).includes(categoryVal);
    const contributorMatch = contribVal == null || contrib.split(/\s+/).includes(contribVal);
    const show = categoryMatch && contributorMatch;
    el.style.display = show ? "block" : "none";
  });
  requestAnimationFrame(layoutGalleryMasonry);
}

function layoutGalleryMasonry() {
  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;

  const style = window.getComputedStyle(grid);
  const gap = parseFloat(style.getPropertyValue("--gallery-gap")) || 0;
  const containerWidth = grid.clientWidth;
  if (containerWidth <= 0) return;
  const minRowHeight = parseFloat(style.getPropertyValue("--gallery-row-min-height")) || 120;
  const maxRowHeight = parseFloat(style.getPropertyValue("--gallery-row-max-height")) || 210;
  const rowMin = Math.min(minRowHeight, maxRowHeight);
  const rowMax = Math.max(minRowHeight, maxRowHeight);
  const randomRowHeight = () => rowMin + Math.random() * (rowMax - rowMin);

  const oldRows = Array.from(grid.querySelectorAll(".gallery-row"));
  oldRows.forEach((row) => {
    Array.from(row.querySelectorAll(".gallery-item")).forEach((item) => grid.appendChild(item));
    row.remove();
  });

  const items = Array.from(grid.querySelectorAll(".gallery-item"));
  items.forEach((item) => {
    item.style.width = "";
    item.style.height = "";
    const img = item.querySelector(".gallery-image");
    if (img) img.style.height = "";
    if (!item.dataset.rand) item.dataset.rand = Math.random().toFixed(6);
  });

  const visibleItems = items
    .filter((item) => window.getComputedStyle(item).display !== "none")
    .sort((a, b) => parseFloat(a.dataset.rand) - parseFloat(b.dataset.rand));
  if (!visibleItems.length) return;

  const rows = [];
  let currentRow = [];
  let sumRatios = 0;
  let currentTargetHeight = randomRowHeight();
  const targetFill = containerWidth;

  const pushRow = (isLast = false) => {
    if (!currentRow.length) return;
    const rowGapTotal = gap * Math.max(0, currentRow.length - 1);
    const rowHeight = isLast
      ? currentTargetHeight
      : (containerWidth - rowGapTotal) / Math.max(sumRatios, 0.01);
    rows.push({ items: currentRow, rowHeight, isLast });
    currentRow = [];
    sumRatios = 0;
    currentTargetHeight = randomRowHeight();
  };

  visibleItems.forEach((item) => {
    const img = item.querySelector("img");
    const ratio = img && img.naturalWidth > 0 && img.naturalHeight > 0
      ? img.naturalWidth / img.naturalHeight
      : 1.25;
    const nextRatioSum = sumRatios + ratio;
    const estimatedWidth = nextRatioSum * currentTargetHeight + gap * currentRow.length;

    if (currentRow.length > 0 && estimatedWidth >= targetFill) {
      pushRow(false);
    }
    currentRow.push({ item, ratio });
    sumRatios += ratio;
  });
  pushRow(true);

  const fragment = document.createDocumentFragment();
  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "gallery-row";

    const totalWidth = containerWidth - gap * Math.max(0, row.items.length - 1);
    let usedWidth = 0;
    row.items.forEach(({ item, ratio }, index) => {
      const width = row.isLast
        ? row.rowHeight * ratio
        : index === row.items.length - 1
        ? totalWidth - usedWidth
        : row.rowHeight * ratio;
      usedWidth += width;
      item.style.width = `${Math.max(1, width)}px`;
      const img = item.querySelector(".gallery-image");
      if (img) img.style.height = `${row.rowHeight}px`;
      item.style.display = "block";
      rowEl.appendChild(item);
    });
    fragment.appendChild(rowEl);
  });

  const hiddenItems = items.filter((item) => window.getComputedStyle(item).display === "none");
  grid.innerHTML = "";
  grid.appendChild(fragment);
  hiddenItems.forEach((item) => {
    item.style.display = "none";
    grid.appendChild(item);
  });
}

// Fold each filter row into a single-select dropdown: only the active tab shows,
// a chevron toggle reveals the rest; picking one collapses the row again.
function initFoldableFilterTabs(shell) {
  const rows = Array.from(shell.querySelectorAll(".filter-tabs"));
  const closeAll = () => rows.forEach((row) => row.foldClose && row.foldClose());

  rows.forEach((row) => {
    const labels = Array.from(row.querySelectorAll("label[for]"));
    const radios = labels.map((l) => document.getElementById(l.htmlFor)).filter(Boolean);
    if (!radios.length) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "filter-fold-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Show options");
    toggle.innerHTML = '<ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>';

    // Active tab sits next to the toggle; the rest wait in a pool on the row below.
    const slot = document.createElement("div");
    slot.className = "filter-fold-slot";
    const pool = document.createElement("div");
    pool.className = "filter-fold-pool";
    row.prepend(toggle, slot);
    row.append(pool);
    row.classList.add("filter-tabs--fold");

    const setOpen = (open) => {
      row.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    const syncActive = () => {
      labels.forEach((l) => {
        const r = document.getElementById(l.htmlFor);
        (r && r.checked ? slot : pool).appendChild(l);
      });
    };
    row.foldClose = () => setOpen(false);

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !row.classList.contains("is-open");
      closeAll();
      setOpen(open);
    });
    // Clicking the static tab when it isn't the first ("All") option resets the row to "All".
    slot.addEventListener("click", (e) => {
      const first = radios[0];
      if (!e.target.closest("label") || first.checked) return;
      e.preventDefault();
      first.checked = true;
      first.dispatchEvent(new Event("change", { bubbles: true }));
    });
    radios.forEach((r) =>
      r.addEventListener("change", () => {
        syncActive();
        setOpen(false);
      })
    );
    syncActive();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-tabs--fold")) closeAll();
  });
}

function initDualFilters() {
  const shell = document.querySelector(".filter-shell");
  if (!shell) return;
  initFoldableFilterTabs(shell);
  if (shell.querySelector("#pub-contrib-all")) {
    applyPublicationDualFilter();
    shell.querySelectorAll('input[name="pub-category"], input[name="pub-contributor"]').forEach((r) => {
      r.addEventListener("change", applyPublicationDualFilter);
    });
  }
  if (shell.querySelector("#misc-contrib-all")) {
    applyMiscDualFilter();
    shell.querySelectorAll('input[name="misc-category"], input[name="misc-contributor"]').forEach((r) => {
      r.addEventListener("change", applyMiscDualFilter);
    });
  }
  if (shell.querySelector("#gal-contrib-all")) {
    applyGalleryDualFilter();
    shell.querySelectorAll('input[name="gal-category"], input[name="gal-contributor"]').forEach((r) => {
      r.addEventListener("change", applyGalleryDualFilter);
    });
  }
}

function initTimelinePopupCards() {
  const timelines = document.querySelectorAll(".timeline");
  if (!timelines.length) return;

  timelines.forEach((timeline) => {
    const popupZone = timeline.querySelector(".timeline-popups");
    if (!popupZone) return;

    const triggers = Array.from(
      timeline.querySelectorAll(".timeline-card[data-popup-target]")
    );
    const cards = Array.from(popupZone.querySelectorAll(".pop-up-card[id]"));
    if (!triggers.length || !cards.length) return;

    let activeTrigger = null;

    const getCardByTrigger = (trigger) => {
      const targetId = trigger.getAttribute("data-popup-target");
      if (!targetId) return null;
      return document.getElementById(targetId);
    };

    const closeAll = () => {
      cards.forEach((card) => card.classList.remove("is-open"));
      triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
      // 关闭所有已高亮的 dot
      timeline
        .querySelectorAll(".timeline-dot--popup-open")
        .forEach((dot) => dot.classList.remove("timeline-dot--popup-open"));
      activeTrigger = null;
    };

    const placeCard = (trigger, card) => {
      if (window.innerWidth <= 1100) return;
      const anchor = trigger.closest(".timeline-item") || trigger;
      const zoneRect = popupZone.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const centerY = anchorRect.top + anchorRect.height / 2 - zoneRect.top;

      // 将卡片限制在 popup zone 的纵向范围内：
      // card 的 CSS 用 transform: translateY(-50%)，所以 top 指向卡片中心。
      // 确保卡片上边不超出 zone 顶部，下边不超出 zone 底部。
      const halfCard = card.offsetHeight / 2;
      const zoneHeight = popupZone.offsetHeight;
      const clampedTop = Math.max(halfCard, Math.min(centerY, zoneHeight - halfCard));
      card.style.top = `${clampedTop}px`;
    };

    // 窄屏：卡片直接盖在被点的那一行上（同 roadmap 卡片）；宽屏：放回右侧的 popup 区
    const isNarrow = () => window.innerWidth <= 1100;
    const mountCard = (trigger, card) => {
      if (isNarrow()) {
        if (card.parentElement !== timeline) timeline.appendChild(card);
        card.classList.add("pop-up-card--overlay");
        const box = timeline.getBoundingClientRect();
        const row = trigger.getBoundingClientRect();
        const width = Math.min(480, box.width);
        card.style.width = `${width}px`;
        card.style.left = `${Math.max(0, Math.min(row.left - box.left, box.width - width))}px`;
        card.style.top = `${row.top - box.top}px`;
      } else {
        if (card.parentElement !== popupZone) popupZone.appendChild(card);
        card.classList.remove("pop-up-card--overlay");
        card.style.width = "";
        card.style.left = "";
      }
    };

    // 点击打开（卡片保留 hover 动画）；再点同一个关闭，点另一个直接切换，点其他任意位置关闭
    const open = (trigger) => {
      const card = getCardByTrigger(trigger);
      if (!card) return;
      closeAll();
      mountCard(trigger, card);
      placeCard(trigger, card);
      card.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      activeTrigger = trigger;
      trigger.closest(".timeline-item")?.querySelector(".timeline-dot")?.classList.add("timeline-dot--popup-open");
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (activeTrigger === trigger) closeAll();
        else open(trigger);
      });
    });

    document.addEventListener("click", (e) => {
      if (activeTrigger && !triggers.some((t) => t.contains(e.target))) closeAll();
    });

    window.addEventListener("resize", () => {
      if (!activeTrigger) return;
      const activeCard = getCardByTrigger(activeTrigger);
      if (!activeCard || !activeCard.classList.contains("is-open")) return;
      mountCard(activeTrigger, activeCard);
      placeCard(activeTrigger, activeCard);
    });
  });
}

// hgraph: turn the authored markup (hgraph-title + <p data-lane="a">…) into the graph nodes.
// Lane order comes from the Research column's buttons; a lane a paper doesn't mention becomes an empty cell.
function buildHGraph() {
  document.querySelectorAll(".hgraph").forEach((graph) => {
    const fixed = graph.querySelector(".hgraph-col--fixed");
    if (!fixed) return;
    const laneKeys = Array.from(fixed.querySelectorAll("[data-lane]")).map((el) => el.dataset.lane);
    const laneNames = Array.from(fixed.querySelectorAll("[data-lane]")).map((el) => el.textContent.trim());

    const makeNode = (termEl, main, tagText) => {
      const node = document.createElement("div");
      node.className = "hgraph-node" + (main ? " hgraph-node--main" : "");
      if (!termEl) {
        node.classList.add("is-empty");
        return node;
      }
      const dot = document.createElement("span");
      dot.className = "hgraph-dot";
      dot.setAttribute("aria-hidden", "true");
      termEl.classList.remove("hgraph-title");
      termEl.classList.add("hgraph-term");
      if (termEl.dataset.popupImage) node.classList.add("has-popup");
      if (main && termEl.querySelector("a[href]")) node.classList.add("has-link"); // linked title → solid dot
      node.append(dot, termEl);
      if (tagText) {
        // lane name above the text; only shown in the phone (vertical) layout
        const tag = document.createElement("span");
        tag.className = "hgraph-lane-tag";
        tag.textContent = tagText;
        node.appendChild(tag);
      }
      return node;
    };

    graph.querySelectorAll(".hgraph-col").forEach((col) => {
      const title = col.querySelector(".hgraph-title");
      const byLane = {};
      col.querySelectorAll("[data-lane]").forEach((el) => (byLane[el.dataset.lane] = el));
      // card text written separately as <p data-popup-for="x">; falls back to the lane text
      col.querySelectorAll("[data-popup-for]").forEach((el) => {
        const lane = byLane[el.dataset.popupFor];
        if (lane) lane.popupHTML = el.innerHTML.trim();
      });
      if (col === fixed) {
        Object.values(byLane).forEach((btn) => {
          btn.classList.add("hgraph-filter");
          btn.setAttribute("aria-pressed", "false");
        });
      }
      const nodes = [
        makeNode(title, true),
        ...laneKeys.map((k, i) => makeNode(byLane[k] || null, false, col === fixed ? null : laneNames[i])),
      ];
      col.replaceChildren(...nodes);
    });

    // all Research tabs share one width: the widest label on a single line
    const tabs = Array.from(fixed.querySelectorAll(".hgraph-filter"));
    const fitTabs = () => {
      tabs.forEach((t) => (t.style.width = "max-content"));
      const widest = Math.max(...tabs.map((t) => t.getBoundingClientRect().width));
      tabs.forEach((t) => (t.style.width = ""));
      if (widest > 0) graph.style.setProperty("--hgraph-tab-width", `${Math.ceil(widest)}px`);
    };
    fitTabs();
    document.fonts?.ready.then(fitTabs); // re-measure once web fonts have loaded
  });
}

// hgraph: within each column, connect the lane dots vertically (timeline style).
// A single lane dot stays a lone dot; with several, the line runs from the first to the last,
// passing through any empty lanes in between.
function initHGraphLanes() {
  document.querySelectorAll(".hgraph-col").forEach((col) => {
    const lanes = Array.from(col.querySelectorAll(".hgraph-node:not(.hgraph-node--main)"));
    const filled = lanes.map((n, i) => (n.classList.contains("is-empty") ? -1 : i)).filter((i) => i >= 0);
    if (filled.length) {
      // phone layout: the lane line starts at the first lane dot and ends at the last one
      lanes[filled[0]].classList.add("is-head");
      lanes[filled[filled.length - 1]].classList.add("is-tail");
    }
    if (filled.length < 2) return;
    const first = filled[0];
    const last = filled[filled.length - 1];
    lanes.forEach((n, i) => {
      n.classList.toggle("has-up", i > first && i <= last);
      n.classList.toggle("has-down", i >= first && i < last);
    });
  });
}

// hgraph: the Research lane buttons filter paper columns (multi-select toggles, intersection; none = show all).
// Also keeps the year labels and the end of the main axis in sync with the visible columns.
function initHGraphFilter() {
  document.querySelectorAll(".hgraph").forEach((graph) => {
    const fixed = graph.querySelector(".hgraph-col--fixed");
    const papers = Array.from(graph.querySelectorAll(".hgraph-col")).filter((c) => c !== fixed);
    const buttons = Array.from(graph.querySelectorAll(".hgraph-filter"));
    const filledLanes = (col) =>
      Array.from(col.querySelectorAll(".hgraph-node:not(.hgraph-node--main)"))
        .map((n, i) => (n.classList.contains("is-empty") ? -1 : i))
        .filter((i) => i >= 0);

    const apply = () => {
      const selected = buttons.map((b, i) => (b.getAttribute("aria-pressed") === "true" ? i : -1)).filter((i) => i >= 0);
      const visible = papers.filter((col) => !selected.length || selected.every((i) => filledLanes(col).includes(i)));
      papers.forEach((col) => {
        col.classList.toggle("is-hidden", !visible.includes(col));
        col.classList.remove("is-last", "is-first");
        col.querySelector(".hgraph-year")?.remove();
      });
      fixed.classList.remove("is-last");
      (visible[visible.length - 1] || fixed).classList.add("is-last");
      visible[0]?.classList.add("is-first");

      visible.forEach((col) => {
        const year = col.dataset.year;
        if (year) {
          const label = document.createElement("span");
          label.className = "hgraph-year";
          label.textContent = year;
          col.querySelector(".hgraph-node--main .hgraph-term")?.appendChild(label);
        }
      });

      // Fade the lanes that aren't selected. A vertical segment stays solid only when
      // nothing is selected or both lanes it connects are selected.
      const sel = new Set(selected);
      graph.querySelectorAll(".hgraph-col").forEach((col) => {
        const lanes = Array.from(col.querySelectorAll(".hgraph-node:not(.hgraph-node--main)"));
        lanes.forEach((n, i) => {
          n.classList.toggle("is-dim", sel.size > 0 && !sel.has(i));
          n.classList.remove("up-dim", "down-dim");
        });
        const filled = filledLanes(col);
        for (let k = 0; k < filled.length - 1; k++) {
          const a = filled[k];
          const b = filled[k + 1];
          if (!sel.size || (sel.has(a) && sel.has(b))) continue;
          for (let i = a; i <= b; i++) {
            if (i > a) lanes[i].classList.add("up-dim");
            if (i < b) lanes[i].classList.add("down-dim");
          }
        }
      });
    };

    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
        apply();
      })
    );
    apply();
  });
}

// hgraph: lanes with data-popup-image open a card (teaser + the lane text) over their own position.
// Click to open; click the same item or anywhere else to close; click another item to switch.
function initHGraphPopups() {
  document.querySelectorAll(".hgraph").forEach((graph) => {
    const triggers = Array.from(graph.querySelectorAll(".hgraph-node.has-popup > .hgraph-term"));
    if (!triggers.length) return;

    const card = document.createElement("div");
    card.className = "hgraph-popup";
    const img = document.createElement("img");
    img.className = "hgraph-popup-image";
    img.alt = "";
    const text = document.createElement("p");
    text.className = "hgraph-popup-text";
    card.append(img, text);
    document.body.appendChild(card);

    let active = null;
    const close = () => {
      card.classList.remove("is-open");
      active?.closest(".hgraph-node")?.classList.remove("is-open");
      active = null;
    };
    const open = (term) => {
      close();
      img.src = term.dataset.popupImage;
      text.innerHTML = term.popupHTML || term.innerHTML.trim();
      const r = term.getBoundingClientRect();
      const width = Math.min(500, document.documentElement.clientWidth - 32);
      const left = Math.min(r.left, document.documentElement.clientWidth - width - 16);
      card.style.width = `${width}px`;
      card.style.left = `${left + window.scrollX}px`;
      card.style.top = `${r.top + window.scrollY}px`;
      card.classList.add("is-open");
      term.closest(".hgraph-node").classList.add("is-open");
      active = term;
    };

    triggers.forEach((term) =>
      term.addEventListener("click", () => {
        if (active === term) close();
        else open(term);
      })
    );
    document.addEventListener("click", (e) => {
      if (active && !triggers.some((t) => t.contains(e.target))) close();
    });
    graph.addEventListener("scroll", close);
    window.addEventListener("resize", close);
  });
}

// Homepage hero: loop the pub animated webps one by one.
// Each slide plays once in full (length read from the webp's frame durations), then the next one starts.
function webpDurationMs(buf) {
  const v = new DataView(buf);
  let total = 0;
  for (let p = 12; p + 8 <= v.byteLength; ) {
    const tag = String.fromCharCode(v.getUint8(p), v.getUint8(p + 1), v.getUint8(p + 2), v.getUint8(p + 3));
    const size = v.getUint32(p + 4, true);
    if (tag === "ANMF") total += v.getUint8(p + 20) | (v.getUint8(p + 21) << 8) | (v.getUint8(p + 22) << 16);
    p += 8 + size + (size & 1);
  }
  return total;
}

function initHeroSlides() {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  if (!slides.length) return;

  // crossfade length comes from CSS (--hero-fade), centered on the boundary between two clips
  const fadeMs = () => {
    const v = getComputedStyle(slides[0]).getPropertyValue("--hero-fade").trim();
    return v.endsWith("ms") ? parseFloat(v) : (parseFloat(v) || 0) * 1000;
  };

  const cache = new Map();
  // fetch once; each show gets a fresh object URL so the animation restarts from frame 1
  const load = (src) => {
    if (!cache.has(src)) {
      cache.set(src, fetch(src)
        .then((r) => r.blob())
        .then(async (blob) => ({ blob, ms: webpDurationMs(await blob.arrayBuffer()) })));
    }
    return cache.get(src);
  };

  const show = async (i) => {
    const img = slides[i];
    let url = img.dataset.src;
    let ms = 0;
    try {
      const data = await load(img.dataset.src);
      url = URL.createObjectURL(data.blob);
      ms = data.ms;
    } catch (e) {
      // file:// or fetch failure: plain src, fallback length
    }
    const old = img.src;
    img.src = url;
    if (old.startsWith("blob:")) URL.revokeObjectURL(old);
    // wait until the first frame is decoded, so the clock starts when the clip actually starts
    // (capped: decode() can stall in a background tab)
    try { await Promise.race([img.decode(), new Promise((r) => setTimeout(r, 1000))]); } catch (e) {}
    slides.forEach((s) => s.classList.toggle("is-active", s === img));

    const next = (i + 1) % slides.length;
    load(slides[next].dataset.src).catch(() => {}); // preload
    // start the next clip half a fade early: each clip gives up half of the crossfade
    setTimeout(() => show(next), Math.max((ms || 6000) - fadeMs() / 2, 0));
  };

  show(0);
}

// Header: when the brand and the tabs don't fit on one row, collapse to the current tab with the
// chevron on its left; the chevron opens a dropdown of the other pages. Header height stays the same.
function initNavFit() {
  const header = document.querySelector(".site-header");
  const shell = header?.querySelector(".nav-shell");
  const brand = header?.querySelector(".brand");
  const list = header?.querySelector(".nav-list");
  if (!shell || !brand || !list) return;
  const nav = list.parentElement;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "nav-fold-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Show pages");
  toggle.innerHTML = '<ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>';
  nav.prepend(toggle);

  const current = list.querySelector('a[aria-current="page"]');
  let label = null;
  if (!current) {
    // pages without a current tab (project subpages) show a plain label next to the chevron
    label = document.createElement("span");
    label.className = "nav-fold-label";
    label.textContent = "Menu";
    toggle.after(label);
  }

  const dropdown = document.createElement("div");
  dropdown.className = "nav-dropdown";
  list.querySelectorAll("a").forEach((a) => {
    if (a !== current) dropdown.appendChild(a.cloneNode(true));
  });
  header.appendChild(dropdown);

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  [toggle, label].forEach((el) =>
    el?.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!header.classList.contains("is-open"));
    })
  );
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const fit = () => {
    const wasCompact = header.classList.contains("is-compact");
    header.classList.remove("is-compact");
    const cs = getComputedStyle(shell);
    const available = shell.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const gap = parseFloat(cs.columnGap) || 0;
    const needed = brand.getBoundingClientRect().width + gap + list.scrollWidth;
    const compact = needed > available + 1;
    header.classList.toggle("is-compact", compact);
    if (!compact && wasCompact) setOpen(false);
  };
  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener("resize", () => requestAnimationFrame(fit));
}

onReady(() => {
  initNavFit();
  initHeroSlides();
  buildHGraph();
  initHGraphLanes();
  initHGraphFilter();
  initHGraphPopups();
  initDualFilters();
  initTimelinePopupCards();
  layoutGalleryMasonry();

  document.querySelectorAll(".gallery-grid img").forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", layoutGalleryMasonry, { once: true });
    img.addEventListener("error", layoutGalleryMasonry, { once: true });
  });

  // 分类切换（radio）后重排
  document.querySelectorAll('input[name="gal-category"], input[name="gal-contributor"]').forEach((radio) => {
    radio.addEventListener("change", () => requestAnimationFrame(layoutGalleryMasonry));
  });

  // 窗口尺寸变化重排
  window.addEventListener("resize", () => {
    requestAnimationFrame(layoutGalleryMasonry);
  });
});
