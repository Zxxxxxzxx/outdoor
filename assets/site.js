const WEEKLY_LEADER_ROLES = [
  { key: "front", role: "前队" },
  { key: "middle", role: "中队" },
  { key: "rear", role: "后队" },
];

const DEPLOY_SITE_DEFAULTS = {
  site: {
    title: "大松湾古道",
    kicker: "Huadong Outdoor Library",
    note: "首页只放要项，细节收进线路库和编辑页",
    featured_route_id: "",
  },
  weekly: {
    date: "",
    summary: "",
    difficulty: "",
    difficulty_label: "",
    mileage: "",
    mileage_label: "",
    elevation: "",
    elevation_label: "",
    status: "",
    status_label: "",
    meeting_place: "",
    meeting_time: "",
    leaders: WEEKLY_LEADER_ROLES.map(item => ({ ...item, name: "", phone: "" })),
    plate_number: "",
    drive_time: "",
    service_area: "",
    weather_rule: "",
    route_brief: "",
    itinerary: "",
    route_map_url: "",
    retreat_map_url: "",
    backup_map_url: "",
    route_items: [],
  },
  routeLibrary: {
    intro: "",
    routes: [],
  },
  gear: {
    intro: "",
    pills: [],
    notes: [],
  },
  sceneryTab: {
    intro: "把线路实景、路感和关键路段照片留在这里，队员出发前先建立直觉。",
  },
  about: {
    intro: "",
    notes: [],
    risk_cards: [],
  },
};

function deployClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeTextList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => String(item || "").trim())
    .filter(Boolean);
}

function normalizePanelList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => ({
      title: String((item && item.title) || "").trim(),
      text: String((item && item.text) || "").trim(),
    }))
    .filter(item => item.title || item.text);
}

function normalizeLeaderList(value) {
  const items = Array.isArray(value) ? value : [];
  return WEEKLY_LEADER_ROLES.map((role, index) => {
    const source = items.find(item => {
      const key = String((item && item.key) || "").trim();
      const label = String((item && (item.role || item.label)) || "").trim();
      return key === role.key || label === role.role;
    }) || items[index] || {};
    return {
      key: role.key,
      role: role.role,
      name: String((source && source.name) || "").trim(),
      phone: String((source && source.phone) || "").trim(),
    };
  });
}

function normalizeBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const text = String(value || "").trim().toLowerCase();
  return ["1", "true", "yes", "y", "on"].includes(text);
}

function orderPinnedFirst(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => ({ ...(item || {}), __order: index }))
    .sort((left, right) => {
      const pinDiff = Number(Boolean(right && right.pinned)) - Number(Boolean(left && left.pinned));
      if (pinDiff !== 0) return pinDiff;
      return (left && left.__order || 0) - (right && right.__order || 0);
    })
    .map(({ __order, ...item }) => item);
}

function normalizeRiskCardList(value) {
  if (!Array.isArray(value)) return [];
  return orderPinnedFirst(value
    .map((item, index) => ({
      id: String((item && item.id) || `risk_${index + 1}`).trim(),
      title: String((item && (item.title || item.name)) || "").trim(),
      risk_type: String((item && (item.risk_type || item.riskType || item.category)) || "").trim(),
      scene_trigger: String((item && (item.scene_trigger || item.sceneTrigger || item.scenes || item.scene || item.trigger)) || "").trim(),
      prevention: String((item && (item.prevention || item.preventive_measures)) || "").trim(),
      response: String((item && (item.response || item.self_help || item.treatment || item.handling)) || "").trim(),
      image: String((item && (item.image || item.src || item.photo)) || "").trim(),
      pinned: normalizeBooleanFlag(item && (item.pinned || item.is_pinned || item.isPinned || item.top)),
    }))
    .filter(item => item.title || item.risk_type || item.scene_trigger || item.prevention || item.response || item.image));
}

function normalizeGallery(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => ({
      id: String((item && item.id) || `gallery_${index}`),
      src: String((item && (item.src || item.url)) || "").trim(),
      caption: String((item && (item.caption || item.title)) || "").trim(),
    }))
    .filter(item => item.src);
}

function normalizeRoute(route) {
  const source = route && typeof route === "object" ? route : {};
  const review = source.review && typeof source.review === "object" ? source.review : {};
  return {
    id: String(source.id || "").trim(),
    name: String(source.name || "").trim(),
    region: String(source.region || "").trim(),
    difficulty: String(source.difficulty || "").trim(),
    season: String(source.season || "").trim(),
    drive_time: String(source.drive_time || "").trim(),
    estimated_time: String(source.estimated_time || source.duration || "").trim(),
    distance: String(source.distance || "").trim(),
    elevation: String(source.elevation || "").trim(),
    duration: String(source.estimated_time || source.duration || "").trim(),
    suitable: String(source.suitable || "").trim(),
    road_condition: String(
      source.road_condition ||
      source.roadCondition ||
      source.route_condition ||
      source.routeCondition ||
      source.trail_condition ||
      ""
    ).trim(),
    weather_rule: String(source.weather_rule || "").trim(),
    prep: normalizeTextList(source.prep),
    risks: normalizeTextList(source.risks),
    animals: normalizeTextList(source.animals),
    review: {
      summary: String(review.summary || "").trim(),
      notes: normalizeTextList(review.notes),
    },
    gallery: normalizeGallery(source.gallery),
  };
}

function normalizeRoutes(value, fallbackRoutes) {
  const sourceRoutes = (Array.isArray(value) && value.length ? value : fallbackRoutes) || [];
  const usedIds = new Set();
  return sourceRoutes.map((route, index) => {
    const source = route && typeof route === "object" ? { ...route } : {};
    let id = String(source.id || "").trim();
    if (!id) id = `route_${index + 1}`;
    if (usedIds.has(id)) {
      const baseId = id;
      let suffix = 2;
      while (usedIds.has(`${baseId}_${suffix}`)) suffix += 1;
      id = `${baseId}_${suffix}`;
    }
    usedIds.add(id);
    return normalizeRoute({ ...source, id });
  });
}

function normalizeSiteData(raw) {
  const defaults = deployClone(DEPLOY_SITE_DEFAULTS);
  const source = raw && typeof raw === "object" ? raw : {};
  const weekly = source.weekly && typeof source.weekly === "object" ? source.weekly : {};
  const routeLibrary = source.routeLibrary && typeof source.routeLibrary === "object" ? source.routeLibrary : {};
  const gear = source.gear && typeof source.gear === "object" ? source.gear : {};
  const about = source.about && typeof source.about === "object" ? source.about : {};
  const aboutRiskCards = about.risk_cards || about.riskCards || about.risks || [];
  const sceneryTab = (source.sceneryTab && typeof source.sceneryTab === "object")
    ? source.sceneryTab
    : ((source.notesTab && typeof source.notesTab === "object") ? source.notesTab : {});

  const normalized = {
    ...defaults,
    ...source,
    site: {
      ...defaults.site,
      ...(source.site || {}),
    },
    weekly: {
      ...defaults.weekly,
      ...weekly,
      leaders: normalizeLeaderList(weekly.leaders || weekly.contacts || weekly.meeting_leaders || defaults.weekly.leaders),
      route_items: normalizePanelList(weekly.route_items || defaults.weekly.route_items),
    },
    routeLibrary: {
      ...defaults.routeLibrary,
      ...routeLibrary,
      routes: [],
    },
    gear: {
      ...defaults.gear,
      ...gear,
      pills: normalizeTextList(gear.pills || defaults.gear.pills),
      notes: normalizePanelList(gear.notes || defaults.gear.notes),
    },
    sceneryTab: {
      ...defaults.sceneryTab,
      ...sceneryTab,
    },
    about: {
      ...defaults.about,
      ...about,
      notes: normalizePanelList(about.notes || defaults.about.notes),
      risk_cards: normalizeRiskCardList(aboutRiskCards),
    },
  };

  normalized.routeLibrary.routes = normalizeRoutes(routeLibrary.routes, defaults.routeLibrary.routes);
  normalized.site.featured_route_id = String(
    normalized.site.featured_route_id ||
    normalized.site.featuredRouteId ||
    ""
  ).trim();
  normalized.weekly.date = String(normalized.weekly.date || "").trim();
  normalized.weekly.summary = String(normalized.weekly.summary || "").trim();
  normalized.weekly.difficulty = String(normalized.weekly.difficulty || "").trim();
  normalized.weekly.difficulty_label = String(normalized.weekly.difficulty_label || "").trim();
  normalized.weekly.mileage = String(normalized.weekly.mileage || "").trim();
  normalized.weekly.mileage_label = String(normalized.weekly.mileage_label || "").trim();
  normalized.weekly.elevation = String(normalized.weekly.elevation || "").trim();
  normalized.weekly.elevation_label = String(normalized.weekly.elevation_label || "").trim();
  normalized.weekly.status = String(normalized.weekly.status || "").trim();
  normalized.weekly.status_label = String(normalized.weekly.status_label || "").trim();
  normalized.weekly.meeting_place = String(normalized.weekly.meeting_place || "").trim();
  normalized.weekly.meeting_time = String(normalized.weekly.meeting_time || "").trim();
  normalized.weekly.plate_number = String(normalized.weekly.plate_number || "").trim();
  normalized.weekly.drive_time = String(normalized.weekly.drive_time || "").trim();
  normalized.weekly.service_area = String(normalized.weekly.service_area || "").trim();
  normalized.weekly.weather_rule = String(normalized.weekly.weather_rule || "").trim();
  normalized.weekly.route_brief = String(normalized.weekly.route_brief || "").trim();
  normalized.weekly.itinerary = String(normalized.weekly.itinerary || "").trim();
  normalized.weekly.route_map_url = String(normalized.weekly.route_map_url || "").trim();
  normalized.weekly.retreat_map_url = String(normalized.weekly.retreat_map_url || "").trim();
  normalized.weekly.backup_map_url = String(normalized.weekly.backup_map_url || "").trim();
  normalized.routeLibrary.intro = String(normalized.routeLibrary.intro || "").trim();
  normalized.gear.intro = String(normalized.gear.intro || "").trim();
  normalized.sceneryTab.intro = String(normalized.sceneryTab.intro || "").trim();
  normalized.about.intro = String(normalized.about.intro || "").trim();
  normalized.notesTab = normalized.sceneryTab;

  return normalized;
}

async function loadSiteData() {
  const resp = await fetch("./data/site.json");
  if (!resp.ok) throw new Error("读取站点数据失败");
  return normalizeSiteData(await resp.json());
}

function renderPanelList(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = (items || []).map(item => `
    <div class="panel-item">
      <strong>${item.title}</strong>
      <span>${item.text}</span>
    </div>
  `).join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRiskValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) {
    return `<span class="risk-row-text">${escapeHtml(text)}</span>`;
  }
  return `
    <ul class="risk-line-list">
      ${lines.map(line => `<li>${escapeHtml(line)}</li>`).join("")}
    </ul>
  `;
}

function renderRiskCards(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = orderPinnedFirst(items || []).map(item => `
    <article class="risk-card ${item.image ? "" : "no-media"}">
      ${item.image ? `<img class="risk-card-media" src="${item.image}" alt="${item.title || "常见风险"}">` : ""}
      <div class="risk-card-body">
        <div class="risk-card-head">
          <strong class="risk-card-title">${item.title || "未命名风险"}</strong>
          <div class="risk-card-tags">
            ${item.pinned ? `<span class="risk-card-tag risk-card-tag-pin">置顶</span>` : ""}
            ${item.risk_type ? `<span class="risk-card-tag">${item.risk_type}</span>` : ""}
          </div>
        </div>
        <div class="risk-card-copy">
          ${item.scene_trigger ? `<div class="risk-row"><strong>常见场景 / 诱因</strong><div class="risk-row-value">${renderRiskValue(item.scene_trigger)}</div></div>` : ""}
          ${item.prevention ? `<div class="risk-row"><strong>预防措施</strong><div class="risk-row-value">${renderRiskValue(item.prevention)}</div></div>` : ""}
          ${item.response ? `<div class="risk-row"><strong>自救及处理</strong><div class="risk-row-value">${renderRiskValue(item.response)}</div></div>` : ""}
        </div>
      </div>
    </article>
  `).join("");
}

function renderPills(containerId, items, pillClass = "panel-pill") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = (items || []).map(item => `<span class="${pillClass}">${item}</span>`).join("");
}

function routeRegions(routes) {
  return ["全部"].concat([...new Set((routes || []).map(route => route.region.split("·")[0].trim()))]);
}
