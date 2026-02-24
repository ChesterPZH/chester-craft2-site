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

  // 图片加载会改变卡片高度：逐张监听并重排
  document.querySelectorAll(".misc-cards-grid img").forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", layoutMiscMasonry, { once: true });
    img.addEventListener("error", layoutMiscMasonry, { once: true });
  });

  // 分类切换（radio）后重排
  document.querySelectorAll('input[name="misc-category"]').forEach((radio) => {
    radio.addEventListener("change", () => requestAnimationFrame(layoutMiscMasonry));
  });

  // 窗口尺寸变化重排
  window.addEventListener("resize", () => requestAnimationFrame(layoutMiscMasonry));
});
