"use strict";

const crabs = [
  { id: "shore-crab", name: "岩岸蟹", rarity: "常见", sell: 6, weight: 62, color: "#bd7055", light: "#edab78", hint: "四季都能在潮线边的石缝里找到。" },
  { id: "jade-crab", name: "青钳蟹", rarity: "少见", sell: 10, weight: 30, seasons: ["spring", "summer"], color: "#4d8479", light: "#8fc3a0", hint: "春夏常在浅水里活动，双钳带一点青绿。" },
  { id: "sand-crab", name: "沙纹蟹", rarity: "少见", sell: 10, weight: 30, seasons: ["autumn", "winter"], color: "#ad8958", light: "#e1c990", hint: "秋冬会躲进湿沙，背甲上有细条纹。" },
  { id: "star-crab", name: "星纹蟹", rarity: "稀有", sell: 19, weight: 8, color: "#746b9b", light: "#c6a2d2", hint: "四季低概率入笼，背上有一对星形斑。" }
];

const surveyProjects = [
  { id: "tuna", name: "近岸蓝鳍鱼样本", species: ["fish"], count: 2, reward: { coin: 16, compost: 1 }, note: "观察近岸鱼群的年龄和体长。" },
  { id: "shore", name: "礁石带的岩岸蟹", species: ["shore-crab"], count: 1, reward: { coin: 15, timber: 1 }, note: "比较背甲上被海浪磨过的痕迹。" },
  { id: "seasonal", name: "季节蟹类记录", species: ["jade-crab", "sand-crab"], count: 1, reward: { coin: 22, shell: 1 }, note: "提交任一当季蟹样，记录它的活动季节。" },
  { id: "rare-fish", name: "少见鱼群观察", species: ["snapper", "flower-bass", "parrotfish", "maple-grouper", "frost-flounder"],
    count: 1, reward: { coin: 24, timber: 2 }, note: "任一所列鱼种都可以用于研究。" },
  { id: "star", name: "星纹蟹斑纹调查", species: ["star-crab"], count: 1, reward: { coin: 35, shell: 2 }, note: "用背甲斑纹绘制一页标本图。" }
];

function readSurvey(source, life, day) {
  const orders = {};
  for (const project of surveyProjects) {
    const prior = source?.orders?.[project.id];
    if (!prior || !["active", "done"].includes(prior.state)) continue;
    orders[project.id] = {
      state: prior.state,
      caught: Object.fromEntries(project.species.map(id => [id, Math.min(project.count, nonnegative(prior.caught?.[id]))]))
    };
  }
  const archived = Number(life.commissions.headland?.done === true) + Number(life.residentOffers.headland?.state === "done");
  return {
    fisherTasks: Math.max(archived, nonnegative(source?.fisherTasks)),
    trapDay: Number.isSafeInteger(source?.trapDay) && source.trapDay >= 0 && source.trapDay <= day ? source.trapDay : null,
    catches: Object.fromEntries(crabs.map(({ id }) => [id, nonnegative(source?.catches?.[id])])),
    orders
  };
}

function recordFisherDelivery() {
  const survey = saved.life.survey;
  survey.fisherTasks++;
  if (survey.fisherTasks === 5) {
    addAlert("老纪送来了一只蟹笼", "到自家南岸放笼，隔天收取。老纪鱼摊开始买卖螃蟹，餐厅也开放海藻蒸蟹和椰香蟹汤。");
  }
  if (survey.fisherTasks === 10 && !hasRoute("research")) {
    saved.progress.routes.push("research");
    addAlert("老纪标出了洄湾研究岛", "林澜正在收集水产样本。回自家码头，在船家的航图上选择洄湾研究岛。");
  }
}

const hasCrabTrap = () => saved.life.survey.fisherTasks >= 5;

function fillFisherMilestones(offers) {
  const count = saved.life.survey.fisherTasks;
  const message = count < 5 ? `交付 5 项委托后，老纪会送你一只蟹笼。` :
    count < 10 ? "蟹笼已领取。交付 10 项委托后，老纪会告诉你研究岛的位置。" : "已获得蟹笼和洄湾研究岛的航线。";
  venturePanel(offers, `老纪的委托 · 已交付 ${count} 项`, message);
}

function tideCrab(survey) {
  const season = seasonAt((survey.trapDay + 1) * 1440);
  const islandSeed = Number.parseInt(saved.islandId.slice(0, 8), 16);
  const rng = Island.art.random((islandSeed ^ (survey.trapDay * 6319)) >>> 0);
  if (rng() >= .68) return null;
  const available = crabs.filter(crab => availableThisSeason(crab, season));
  let roll = rng() * available.reduce((sum, crab) => sum + crab.weight, 0);
  return available.find(crab => (roll -= crab.weight) < 0);
}

function useCrabTrap() {
  const survey = saved.life.survey;
  if (saved.area !== "island" || !hasCrabTrap()) return;
  if (survey.trapDay === null) {
    survey.trapDay = dayIndex();
    notify("把蟹笼放进了浅水。明天再来看看。");
  } else if (survey.trapDay === dayIndex()) {
    notify("蟹笼还泡在水里。第二天可以收笼。");
    return;
  } else {
    const crab = tideCrab(survey);
    survey.trapDay = null;
    if (crab) {
      const first = !survey.catches[crab.id];
      survey.catches[crab.id]++;
      saved.inventory[crab.id]++;
      trackSurveySample(crab.id);
      notify(`收笼捉到${crab.name}${first ? " · 蟹类图鉴已更新" : ""}`);
      chime(550);
    } else {
      notify("今天蟹笼是空的。可以再放一次。");
    }
  }
  uiDirty = true;
  save();
}

function crabIcon(crab, known = true) {
  const ns = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(ns, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  for (const [shape, color] of [
    ["M1 5h3v4h2V6h2v5h2V8h4v3h2V6h2v3h2V5h3v7h-2v2h-3v2h4v2h-5v2H7v-2H2v-2h4v-2H3v-2H1z", known ? crab.color : "#7b8d87"],
    ["M7 12h10v4h-2v2H9v-2H7z", known ? crab.light : "#9baa9d"],
    ["M8 9h2v2H8zm6 0h2v2h-2z", "#3c4246"]
  ]) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", shape);
    path.setAttribute("fill", color);
    icon.append(path);
  }
  return icon;
}

function fillCrabCatalog() {
  const list = get("catalog-list");
  list.replaceChildren();
  const { catches, fisherTasks } = saved.life.survey;
  get("catalog-summary").textContent = `已发现 ${Object.values(catches).filter(Boolean).length} / ${crabs.length} 种 · ${fisherTasks >= 5 ?
    "在自家南岸放蟹笼，隔天收笼。" : "完成老纪的 5 项委托可得到蟹笼。"}`;
  for (const crab of crabs) {
    const count = catches[crab.id];
    const row = document.createElement("li");
    const detail = document.createElement("div");
    const name = document.createElement("strong");
    const note = document.createElement("p");
    name.textContent = `${count ? crab.name : "未发现"} · ${crab.rarity}`;
    note.textContent = `${crab.hint}${count ? ` 已捕获 ${count} 只，背包还有 ${saved.inventory[crab.id]} 只。` : ""}`;
    detail.append(name, note);
    row.append(crabIcon(crab, Boolean(count)), detail);
    list.append(row);
  }
}

function trackSurveySample(id) {
  const { orders } = saved.life.survey;
  for (const project of surveyProjects) {
    const order = orders[project.id];
    if (order?.state === "active" && project.species.includes(id)) {
      order.caught[id] = Math.min(project.count, (order.caught[id] ?? 0) + 1);
    }
  }
}

function availableSamples(project, order) {
  return project.species.flatMap(id =>
    Array(Math.min(order.caught[id] ?? 0, saved.inventory[id], project.count)).fill(id));
}

function researchReadyCount() {
  const { orders } = saved.life.survey;
  return surveyProjects.filter(project => {
    const order = orders[project.id];
    return order?.state === "active" && availableSamples(project, order).length >= project.count;
  }).length;
}

function openResearch() {
  if (saved.area !== "research" || activity || fishing || dialogOpen()) return;
  keys.clear();
  get("research-note").textContent = "";
  fillResearch();
  get("research-dialog").showModal();
}

function fillResearch() {
  const { orders } = saved.life.survey;
  const content = get("research-content");
  content.replaceChildren();
  for (const project of surveyProjects) {
    const order = orders[project.id];
    const choice = project.species.map(id => items[id].name).join("、");
    const panel = venturePanel(content, project.name, `${project.note} 接下后捕获 ${project.count} 份样本。可用 ${choice}。`);
    panel.append(itemAmounts(project.reward));
    if (order?.state === "done") {
      panel.append(lifeStatus("研究已完成"));
    } else if (!order) {
      panel.append(lifeButton("接受研究委托", () => handleResearch(project, "accept")));
    } else {
      const count = availableSamples(project, order).length;
      panel.append(lifeStatus(`可用新样本 ${Math.min(count, project.count)}/${project.count}`),
        lifeButton("提交样本", () => handleResearch(project, "submit"), count < project.count));
    }
  }
}

function handleResearch(project, action) {
  if (saved.area !== "research" || !get("research-dialog").open) return;
  const { orders } = saved.life.survey;
  const order = orders[project.id];
  if (action === "accept" && !order) {
    orders[project.id] = { state: "active", caught: {} };
    get("research-note").textContent = "已接取。之后新捕获的样本会记在委托里。";
  } else if (action === "submit" && order?.state === "active") {
    const samples = availableSamples(project, order);
    if (samples.length < project.count) return;
    for (const id of samples.slice(0, project.count)) saved.inventory[id]--;
    for (const [id, count] of Object.entries(project.reward)) saved.inventory[id] += count;
    order.state = "done";
    get("research-note").textContent = `「${project.name}」已提交。收到研究报酬和 ${project.reward.coin} 贝币。`;
    chime(720);
  } else return;
  uiDirty = true;
  save();
  fillResearch();
}

function setupSurvey() {
  get("close-research").addEventListener("click", () => get("research-dialog").close());
  get("walk-crab-trap").addEventListener("click", () => goToIslandSpot(Island.spots.find(spot => spot.type === "crab-trap")));
  for (const tab of get("catalog-tabs").children) {
    tab.addEventListener("click", () => {
      for (const choice of get("catalog-tabs").children) choice.setAttribute("aria-pressed", String(tab === choice));
      if (tab.dataset.catalog === "crab") fillCrabCatalog();
      else fillCatalog();
    });
  }
}
