async function loadSiteData() {
  const resp = await fetch("./data/site.json");
  if (!resp.ok) throw new Error("读取站点数据失败");
  return resp.json();
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

function renderPills(containerId, items, pillClass = "panel-pill") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = (items || []).map(item => `<span class="${pillClass}">${item}</span>`).join("");
}

function routeRegions(routes) {
  return ["全部"].concat([...new Set((routes || []).map(route => route.region.split("·")[0].trim()))]);
}
