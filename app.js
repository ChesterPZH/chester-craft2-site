function layoutMiscMasonry() {
  const grid = document.querySelector(".misc-cards-grid");
  if (!grid) return;

  const style = window.getComputedStyle(grid);
  const rowHeight = parseFloat(style.getPropertyValue("grid-auto-rows")) || 10;
  const rowGap = parseFloat(style.getPropertyValue("row-gap")) || 0;
  const numColumns = 3; // 固定 3 列

  // 重置所有卡片的 grid 位置
  const items = Array.from(grid.querySelectorAll(".misc-card"));
  items.forEach((item) => {
    item.style.gridColumn = "";
    item.style.gridRow = "";
    item.style.gridRowEnd = "";
  });

  // 只获取可见的卡片（筛选后的结果）
  const visibleItems = items.filter((item) => {
    const itemStyle = window.getComputedStyle(item);
    return itemStyle.display !== "none";
  });

  // 追踪每列的当前底部位置（以 row 单位）
  const columnHeights = new Array(numColumns).fill(0);

  // 按 DOM 顺序（从上到下）遍历可见卡片，每张卡片按可见索引计算列位置
  visibleItems.forEach((item, visibleIndex) => {
    // 计算应该放在第几列：0, 1, 2, 0, 1, 2...
    const col = visibleIndex % numColumns;

    // 获取卡片实际高度
    const h = item.getBoundingClientRect().height;
    const span = Math.max(1, Math.ceil((h + rowGap) / (rowHeight + rowGap)));

    // 设置列位置
    item.style.gridColumn = col + 1;

    // 设置行位置：从该列的当前底部开始
    const startRow = columnHeights[col] + 1;
    item.style.gridRow = `${startRow} / span ${span}`;

    // 更新该列的底部位置
    columnHeights[col] = startRow + span - 1;
  });
}

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
  const categoryMap = { "pub-all": null, "pub-xr": "xr", "pub-haptics": "haptics", "pub-access": "access" };
  const contribMap = { "pub-contrib-all": null, "pub-contrib-craft2": "craft2", "pub-contrib-personal": "personal" };
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
  const categoryMap = { "misc-all": null, "misc-projects": "projects", "misc-resources": "resources" };
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
  requestAnimationFrame(layoutMiscMasonry);
}

function applyGalleryDualFilter() {
  const shell = document.querySelector(".filter-shell");
  if (!shell || !shell.querySelector("#gal-contrib-all")) return;
  const categoryRadios = shell.querySelectorAll('input[name="gal-category"]');
  const contributorRadios = shell.querySelectorAll('input[name="gal-contributor"]');
  const items = shell.querySelectorAll(".filter-panels .gallery-item");
  const categoryMap = { "gal-all": null, "gal-events": "events", "gal-people": "people", "gal-making": "making" };
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
    el.style.display = categoryMatch && contributorMatch ? "block" : "none";
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

function initDualFilters() {
  const shell = document.querySelector(".filter-shell");
  if (!shell) return;
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
    const popupZone = timeline.querySelector(".timeline-popup-zone");
    if (!popupZone) return;

    const triggers = Array.from(timeline.querySelectorAll(".pop-up-card-link[data-popup-target]"));
    const cards = Array.from(popupZone.querySelectorAll(".pop-up-card[id]"));
    if (!triggers.length || !cards.length) return;

    let activeTrigger = null;

    const getCardByTrigger = (trigger) => {
      const targetId = trigger.getAttribute("data-popup-target");
      if (!targetId) return null;
      return popupZone.querySelector(`#${targetId}`);
    };

    const closeAll = () => {
      cards.forEach((card) => card.classList.remove("is-open"));
      triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
      activeTrigger = null;
    };

    const placeCard = (trigger, card) => {
      if (window.innerWidth <= 1100) return;
      const anchor = trigger.closest(".timeline-item") || trigger;
      const zoneRect = popupZone.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const centerY = anchorRect.top + anchorRect.height / 2 - zoneRect.top;
      card.style.top = `${centerY}px`;
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const card = getCardByTrigger(trigger);
        if (!card) return;
        const isActive = activeTrigger === trigger && card.classList.contains("is-open");
        closeAll();
        if (isActive) return;
        placeCard(trigger, card);
        card.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        activeTrigger = trigger;
      });
    });

    document.addEventListener("click", (event) => {
      if (!timeline.contains(event.target)) closeAll();
    });

    window.addEventListener("resize", () => {
      if (!activeTrigger) return;
      const activeCard = getCardByTrigger(activeTrigger);
      if (!activeCard || !activeCard.classList.contains("is-open")) return;
      placeCard(activeTrigger, activeCard);
    });
  });
}

onReady(() => {
  initDualFilters();
  initTimelinePopupCards();
  layoutMiscMasonry();
  layoutGalleryMasonry();

  // 图片加载会改变卡片高度：逐张监听并重排
  document.querySelectorAll(".misc-cards-grid img").forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", layoutMiscMasonry, { once: true });
    img.addEventListener("error", layoutMiscMasonry, { once: true });
  });
  document.querySelectorAll(".gallery-grid img").forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", layoutGalleryMasonry, { once: true });
    img.addEventListener("error", layoutGalleryMasonry, { once: true });
  });

  // 分类切换（radio）后重排
  document.querySelectorAll('input[name="misc-category"]').forEach((radio) => {
    radio.addEventListener("change", () => requestAnimationFrame(layoutMiscMasonry));
  });
  document.querySelectorAll('input[name="gal-category"], input[name="gal-contributor"]').forEach((radio) => {
    radio.addEventListener("change", () => requestAnimationFrame(layoutGalleryMasonry));
  });

  // 窗口尺寸变化重排
  window.addEventListener("resize", () => {
    requestAnimationFrame(layoutMiscMasonry);
    requestAnimationFrame(layoutGalleryMasonry);
  });
});
