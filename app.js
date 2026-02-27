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

    const triggers = Array.from(
      timeline.querySelectorAll(".pop-up-card-link[data-popup-target]")
    );
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
      card.style.top = `${centerY}px`;
    };

    // 改为 hover 展示：hover 区域是整张 timeline-card（logo + 文本）
    triggers.forEach((trigger) => {
      const hoverTarget = trigger.closest(".timeline-card") || trigger;

      // 标记为“有 pop-up 的卡片”，用于样式上的 hover 放大效果
      hoverTarget.classList.add("timeline-card--with-popup");

      // 关联的 dot：用于样式上区分“有 pop-up 的节点”
      const item = trigger.closest(".timeline-item");
      const dot = item ? item.querySelector(".timeline-dot") : null;
      if (dot) {
        dot.classList.add("timeline-dot--has-popup");
      }

      hoverTarget.addEventListener("mouseenter", () => {
        const card = getCardByTrigger(trigger);
        if (!card) return;
        closeAll();
        placeCard(trigger, card);
        card.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        activeTrigger = trigger;

        // 当前激活的节点 dot 高亮
        const currentItem = trigger.closest(".timeline-item");
        const currentDot = currentItem
          ? currentItem.querySelector(".timeline-dot--has-popup")
          : null;
        if (currentDot) {
          currentDot.classList.add("timeline-dot--popup-open");
        }
      });

      // 鼠标离开 hoverTarget 时立即关闭
      hoverTarget.addEventListener("mouseleave", () => {
        closeAll();
      });
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
