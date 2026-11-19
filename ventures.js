"use strict";

const coastalProjects = [
  { id: "east-bay", name: "第二片 · 东岬湾", description: "沿东岸填出船坞，准备接待垂钓客人。", costs: { coin: 70, timber: 5 } },
  { id: "fishing-club", name: "垂钓俱乐部", description: "经营带客出海服务，参加每周三的钓鱼比赛。", costs: { coin: 45, timber: 3 } },
  { id: "tidal-terrace", name: "第三片 · 潮汐露台", description: "修出一片临海露台，为餐厅留出位置。", costs: { coin: 120, timber: 6, shell: 2 } },
  { id: "restaurant", name: "餐厅计划", description: "在潮汐露台建一间可以营业的海边餐厅。", costs: { coin: 55, timber: 4 } }
];
const landProjects = ["expansion", "east-bay", "tidal-terrace"];
const offshoreWaters = {
  reef: { name: "近礁浅湾", description: "波浪较小，常见鱼活动频繁。", weights: { 常见: 1.35, 少见: 1, 稀有: .60, 传说: .65 } },
  deep: { name: "外海深水", description: "深水区更容易钓到当季稀有鱼。", weights: { 常见: .70, 少见: 1.4, 稀有: 2.5, 传说: 1.5 } }
};
const racePoints = { 常见: 2, 少见: 4, 稀有: 6, 传说: 8 };
const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const tripCost = 5;
const ticketPrice = 8;
const lunchStart = 11 * 60 + 30;
const lunchEnd = 15 * 60;
const maxPreparationPortions = 4;
const diningPrepQuantities = new Map();

function nonnegative(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function readVentures(source, built, currentDay, inventory, coop) {
  const priorPermits = Array.isArray(source?.permits) ? source.permits : [];
  const permits = coastalProjects.filter(project => project.id !== "restaurant" &&
    (built.includes(project.id) || priorPermits.includes(project.id))).map(project => project.id);
  const rawTrip = source?.trip;
  const fishIds = list => Array.isArray(list) ? list.filter(id => species.some(fish => fish.id === id)) : [];
  const trip = built.includes("fishing-club") && rawTrip && rawTrip.day === nonnegative(rawTrip.day) &&
    rawTrip.day <= currentDay && Object.hasOwn(offshoreWaters, rawTrip.water) && [0, 1, 2].includes(rawTrip.guests) &&
    ["booked", "sailing"].includes(rawTrip.state) ? {
      day: rawTrip.day, water: rawTrip.water, guests: rawTrip.guests, state: rawTrip.state,
      casts: Math.min(3, nonnegative(rawTrip.casts)), fish: fishIds(rawTrip.fish).slice(0, 3)
    } : null;
  const rawRace = source?.race;
  const race = built.includes("fishing-club") && rawRace && Number.isSafeInteger(rawRace.week) && rawRace.week >= 0 &&
    rawRace.week <= Math.floor(currentDay / 7) && ["registered", "active", "done"].includes(rawRace.state) ? {
      week: rawRace.week, state: rawRace.state, start: nonnegative(rawRace.start), casts: Math.min(4, nonnegative(rawRace.casts)),
      fish: fishIds(rawRace.fish).slice(0, 4), place: Math.min(3, nonnegative(rawRace.place))
    } : null;
  const rawDining = built.includes("restaurant") ? source?.dining : null;
  const menu = Array.isArray(rawDining?.menu) ? Array.from(new Set(rawDining.menu.filter(id => recipes.some(recipe => recipe.id === id)))).slice(0, 3) : [];
  const stock = Object.fromEntries(recipes.map(({ id }) => [id, nonnegative(rawDining?.stock?.[id])]));
  const shift = rawDining?.shift;
  const dining = {
    name: typeof rawDining?.name === "string" ? rawDining.name.trim().slice(0, 18) : "",
    menu, stock, opened: rawDining?.opened === true,
    shift: shift && shift.day === nonnegative(shift.day) && shift.day <= currentDay ? {
      day: shift.day, served: Math.min(4, nonnegative(shift.served)), open: shift.open === true,
      dish: menu.includes(shift.dish) ? shift.dish : null
    } : null,
    letter: ["queued", "sent"].includes(rawDining?.letter) ? rawDining.letter : ""
  };
  const ledger = Object.fromEntries(["tripFees", "tickets", "trips", "tables", "meals", "sales", "races", "champions", "medals", "raceIncome"].map(id =>
    [id, nonnegative(source?.ledger?.[id])]));
  const oldHarvest = !source && built.includes("expansion") &&
    (inventory.egg > 0 || inventory["duck-egg"] > 0 || coop.animals.some(animal => animal.laid >= 0 && !animal.eggs));
  const order = source?.construction;
  const construction = order && landProjects.includes(order.project) && !built.includes(order.project) &&
    Number.isSafeInteger(order.finishDay) && order.finishDay > 0 && order.finishDay <= currentDay + 1 ? {
      project: order.project, finishDay: order.finishDay,
      debt: Math.min(expansionLoanLimit + Math.ceil(expansionLoanLimit * expansionLoanRate), nonnegative(order.debt))
    } : null;
  return { permits, trip, race, dining, ledger, construction, hadWestHarvest: source?.hadWestHarvest === true || oldHarvest,
    guestTrips: nonnegative(source?.guestTrips), deliveries: nonnegative(source?.deliveries),
    tripDay: Number.isSafeInteger(source?.tripDay) && source.tripDay <= currentDay ? source.tripDay : -1,
    raceNotice: Number.isSafeInteger(source?.raceNotice) ? source.raceNotice : -1,
    loanCleared: source?.loanCleared === true, lastRacePlace: Math.min(3, nonnegative(source?.lastRacePlace || race?.place))
  };
}

function coastalRequirement(id) {
  const { permits, hadWestHarvest, guestTrips, deliveries } = saved.life.ventures;
  if (id === "east-bay") {
    if (!built("expansion")) return "先完成第一片西岸沙洲。";
    if (!hadWestHarvest) return "先从西岸田地收获一次，或在畜舍收一次蛋。";
  } else if (id === "fishing-club" || id === "tidal-terrace") {
    if (!built("east-bay")) return "先完成第二片东岬湾。";
    if (id === "tidal-terrace" && guestTrips < 2 && deliveries < 2) return "东岬湾完工后，完成 2 次带客出海或交付 2 项居民委托。";
  } else if (id === "restaurant") {
    return built("tidal-terrace") ? "" : "先完成第三片潮汐露台。";
  }
  return permits.includes(id) ? "" : "去歧石岛找阿岩领取图纸。";
}

function fillCoastalPlans(offers) {
  const ventures = saved.life.ventures;
  for (const project of coastalProjects.slice(0, 3)) {
    if (ventures.permits.includes(project.id)) continue;
    if (coastalRequirement(project.id) !== "去歧石岛找阿岩领取图纸。") continue;
    const panel = document.createElement("section");
    panel.className = "life-offer";
    const title = document.createElement("h3");
    title.textContent = project.name;
    panel.append(title, itemAmounts(project.costs), lifeButton(`领取${project.name}图纸`, () => {
      if (saved.area !== "qishi" || !residentDialog.open || coastalRequirement(project.id) !== "去歧石岛找阿岩领取图纸。") return;
      ventures.permits.push(project.id);
      addAlert("阿岩交付了图纸", `${project.name}已标在岛建计划。回自己的岛即可施工。`);
      save();
      fillResidentOffers();
    }));
    offers.append(panel);
  }
}

function makeOffshore() {
  const { avatar, box, daylight, fishingLine, skyAndSea, weatherAir } = Island.art;
  const arrival = { x: 214, y: 177, facing: "down" };
  const spots = [{ id: "offshore-fish", x: 216, y: 179, left: 196, right: 237, top: 170, markY: 155,
    reach: 26, type: "club-fish", label: "在船上抛竿" }];
  function draw(ctx, scene) {
    const { hour, weather, season, elapsed, player, fishing, tugging } = scene;
    const session = activeFishingSession();
    const water = session?.water ?? "reef";
    const palette = daylight(hour, weather, season);
    if (water === "deep") palette.deep = Island.art.tint(palette.deep, [23, 38, 84], .65);
    else palette.deep = Island.art.tint(palette.deep, [37, 170, 147], .38);
    skyAndSea(ctx, palette, hour, weather, elapsed);
    if (session && !session.water && raceShelter(session)) {
      Island.art.stone(ctx, 80, 123, 2);
      Island.art.stone(ctx, 113, 120, 2.4);
      Island.art.stone(ctx, 347, 160, 1.8);
      Island.art.stone(ctx, 375, 155, 2.6);
    }
    Archipelago.boat(ctx, 219, 181, 1.48);
    const guests = activeFishingSession()?.guests ?? 0;
    for (let i = 0; i < guests; i++) Archipelago.resident(ctx, 197 + i * 35, 175, "#5d7590", "#efbf7b");
    avatar(ctx, player, elapsed);
    box(ctx, 188, 186, 60, 1, "#fbd29b77");
    if (fishing) fishingLine(ctx, player, elapsed, fishing, tugging, 28);
    weatherAir(ctx, season, weather, elapsed);
  }
  return { arrival, spots, draw, walkable: (x, y) => x >= 198 && x <= 239 && y >= 171 && y <= 183 };
}

function activeFishingSession() {
  const { trip, race } = saved.life.ventures;
  if (trip?.state === "sailing") return trip;
  return race?.state === "active" ? race : null;
}

function waterFish(minutes, water, roll) {
  const weights = offshoreWaters[water].weights;
  const pool = species.filter(fish => availableThisSeason(fish, seasonAt(minutes)));
  const weight = fish => (fish.weight ?? .027) * weights[fish.rarity];
  let mark = roll * pool.reduce((total, fish) => total + weight(fish), 0);
  return pool.find(fish => (mark -= weight(fish)) < 0) ?? pool.at(-1);
}

function offshoreFish() {
  const session = activeFishingSession();
  if (!session || saved.area !== "offshore") return null;
  if (session.water) return waterFish(saved.minutes, session.water, Math.random());
  const rng = Island.art.random(session.week * 5827 + session.casts * 711 + 802);
  return waterFish(session.start, "reef", rng());
}

function castFromBoat() {
  const session = activeFishingSession();
  const limit = session?.water ? 3 : 4;
  if (saved.area !== "offshore" || !session || fishing || activity || session.casts >= limit) return;
  if (visitFishingSpot(area().spots[0])) {
    session.casts++;
    save();
  }
}

function recordOffshoreCatch(id) {
  const session = saved.area === "offshore" ? activeFishingSession() : null;
  if (!session) return false;
  session.fish.push(id);
  return Boolean(session.water);
}

const catchHabitats = ["自家栈桥", "北岬岛", "洄湾研究岛", "东岬湾赛场", ...Object.values(offshoreWaters).map(water => water.name)];

function readCatchPlaces(source) {
  return Object.fromEntries(species.filter(fish => Array.isArray(source?.[fish.id])).map(fish =>
    [fish.id, catchHabitats.filter(place => source[fish.id].includes(place))]));
}

function storeLandedFish(id, habitat) {
  saved.inventory[id]++;
  saved.catches[id] = (saved.catches[id] ?? 0) + 1;
  saved.fishCaught = true;
  const places = saved.catchPlaces[id] ??= [];
  if (!places.includes(habitat)) places.push(habitat);
  trackSurveySample(id);
  recordPlay("fish");
  recordQuest("fish", 1, id);
}

function raceWindow(day = dayIndex()) {
  const start = day * 1440;
  const storm = weatherAtTime(start + 12 * 60) === "storm";
  const minute = saved.minutes % 1440;
  const isDay = day % 7 === 2;
  return { isDay, storm, canStart: isDay && minute >= 480 && minute < (storm ? 1260 : 1020) &&
    weatherAtTime() !== "storm" && weatherAtTime(saved.minutes + 30) !== "storm" };
}

function raceShelter(race) {
  return race.start % 1440 >= 18 * 60 && raceWindow(Math.floor(race.start / 1440)).storm;
}

function scoreFish(fish) {
  const scores = fish.map(id => racePoints[species.find(entry => entry.id === id).rarity]);
  return { points: scores.reduce((sum, score) => sum + score, 0) + new Set(fish).size, best: Math.max(0, ...scores) };
}

function raceStandings(race) {
  const entries = [{ name: "你", ...scoreFish(race.fish) }];
  for (const [index, name] of ["老纪", "阿澄"].entries()) {
    const rng = Island.art.random(race.week * 3817 + index * 7681 + 641);
    const fish = Array.from({ length: 4 }, () => rng() < (index ? .48 : .57) ? waterFish(race.start, "reef", rng()).id : null).filter(Boolean);
    entries.push({ name, ...scoreFish(fish) });
  }
  entries.sort((a, b) => b.points - a.points || b.best - a.best);
  return entries.map((entry, index) => ({
    ...entry, place: index && entry.points === entries[index - 1].points && entry.best === entries[index - 1].best ?
      entries.findIndex(other => other.points === entry.points && other.best === entry.best) + 1 : index + 1
  }));
}

function updateVentures() {
  const { ventures } = saved.life;
  const day = dayIndex();
  if (ventures.construction && day >= ventures.construction.finishDay) finishLandConstruction();
  const week = Math.floor(day / 7);
  if (built("fishing-club") && day % 7 === 1 && ventures.raceNotice !== week) {
    ventures.raceNotice = week;
    addAlert("明天是钓鱼比赛", "东岬湾已经开放报名。周三早上八点可以开赛。");
    save();
  }
  if (ventures.dining.shift?.open && (day !== ventures.dining.shift.day || saved.minutes % 1440 >= lunchEnd)) {
    closeLunch();
  }
}

function venturePanel(container, title, message) {
  const panel = document.createElement("section");
  panel.className = "life-offer";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const detail = document.createElement("p");
  detail.textContent = message;
  panel.append(heading, detail);
  container.append(panel);
  return panel;
}

function openClub() {
  if (!built("fishing-club") || fishing || activity || dialogOpen()) return;
  keys.clear();
  fillClub();
  get("club-dialog").showModal();
}

function fillClub() {
  const { trip, race, tripDay } = saved.life.ventures;
  const { canStart } = raceWindow();
  const day = dayIndex();
  const week = Math.floor(day / 7);
  const eventDay = day + (9 - day % 7) % 7;
  const storm = raceWindow(eventDay).storm;
  const content = get("club-content");
  content.replaceChildren();
  if (saved.area === "offshore") {
    const session = activeFishingSession();
    const result = session.water ? `已抛 ${session.casts}/3 竿 · 船上渔获 ${session.fish.length} 尾` :
      `已抛 ${session.casts}/4 竿 · 当前 ${scoreFish(session.fish).points} 分`;
    const panel = venturePanel(content, session.water ? offshoreWaters[session.water].name :
      raceShelter(session) ? "周三钓鱼比赛 · 避风港" : "周三钓鱼比赛", result);
    panel.append(lifeButton(session.water ? "返航并结算" : "结算比赛", () => {
      if (!isClubOpen(true) || fishing || (!session.water && session.casts < 4)) return;
      get("club-dialog").close();
      if (session.water) runClubSailing("return");
      else settleRace();
    }, !session.water && session.casts < 4));
    if (!session.water) {
      panel.append(lifeButton("暂离比赛", () => {
        if (!isClubOpen(true)) return;
        get("club-dialog").close();
        changeArea("island", eastBayLanding());
      }));
    }
    return;
  }
  if (trip?.state === "booked") {
    const guests = ["自己出海", "小满同行", "小满和老纪同行"][trip.guests];
    const panel = venturePanel(content, "已预约航次", `${offshoreWaters[trip.water].name} · ${guests} · 已付船务费 5 贝币`);
    panel.append(
      lifeButton("解缆出海", () => {
        if (!isClubOpen(false) || weatherAtTime() === "storm" || saved.life.ventures.trip !== trip) return;
        get("club-dialog").close();
        runClubSailing("depart");
      }, weatherAtTime() === "storm"),
      lifeButton("取消预约并退款", () => {
        if (!isClubOpen(false) || saved.life.ventures.trip !== trip) return;
        saved.inventory.coin += tripCost;
        saved.life.ventures.trip = null;
        save();
        fillClub();
      })
    );
    if (weatherAtTime() === "storm") panel.append(lifeStatus("飓风停航，风停后可出发。"));
  } else if (race?.week === week && race.state === "active") {
    venturePanel(content, "比赛进行中", "先完成本周比赛，再安排常规航次。");
  } else if (tripDay === day) {
    venturePanel(content, "今日航次已结束", "明天可以再预约一趟。");
  } else {
    for (const [water, details] of Object.entries(offshoreWaters)) {
      const season = seasonAt(saved.minutes);
      const catches = species.filter(fish => fish.rarity !== "传说" && availableThisSeason(fish, season));
      const examples = (water === "deep" ? [...catches].reverse() : catches).slice(0, 3);
      const panel = venturePanel(content, details.name, `${details.description} 当季可遇到${examples.map(fish => fish.name).join("、")}。`);
      const actions = document.createElement("div");
      actions.className = "life-actions";
      for (const [guests, label] of [[0, "自己出海"], [1, "带 1 位客人"], [2, "带 2 位客人"]]) {
        actions.append(lifeButton(label, () => bookVoyage(water, guests), saved.inventory.coin < tripCost));
      }
      panel.append(actions);
    }
    venturePanel(content, "船务费 5 贝币", "每趟最多抛 3 竿。带客时每位客人返航后支付 8 贝币。飓风期间可预约，风停后出发。");
  }
  const racePanel = venturePanel(content, "每周三钓鱼比赛", storm ?
    "本周三海况有变。08:00 起可开赛，飓风过后转用避风港，最晚 21:00。" :
    "周二或周三可报名，周三 08:00–17:00 开赛。4 次抛竿，按鱼种和稀有度计分。");
  const scoring = document.createElement("p");
  scoring.textContent = "常见 2 分、少见 4 分、稀有 6 分、传说 8 分。每钓到一种不同的鱼另加 1 分。";
  racePanel.append(scoring);
  if (race?.week === week && race.state === "done") {
    racePanel.append(lifeStatus(`本周第 ${race.place} 名`), standingsList(race));
  } else if (race?.week === week && race.state === "active") {
    racePanel.append(lifeButton("继续本周比赛", () => goToRace(false), !canStart || Boolean(trip)));
  } else if (race?.week === week && race.state === "registered") {
    racePanel.append(lifeStatus("已报名"),
      lifeButton("开始比赛", () => goToRace(true), !canStart || Boolean(trip)));
  } else if ([1, 2].includes(day % 7)) {
    racePanel.append(lifeButton("报名周三比赛", () => {
      if (!isClubOpen(false)) return;
      saved.life.ventures.race = { week, state: "registered", start: 0, casts: 0, fish: [], place: 0 };
      save();
      fillClub();
    }));
  }
}

function isClubOpen(onBoat) {
  return get("club-dialog").open && saved.area === (onBoat ? "offshore" : "island") && built("fishing-club");
}

function bookVoyage(water, guests) {
  const ventures = saved.life.ventures;
  if (!isClubOpen(false) || ventures.trip || ventures.tripDay === dayIndex() || saved.inventory.coin < tripCost ||
      (ventures.race?.week === Math.floor(dayIndex() / 7) && ventures.race.state === "active")) return;
  saved.inventory.coin -= tripCost;
  ventures.trip = { day: dayIndex(), water, guests, state: "booked", casts: 0, fish: [] };
  save();
  fillClub();
}

function eastBayLanding() {
  return { x: 370, y: 237, facing: "down" };
}

function runClubSailing(phase) {
  beginActivity("club-sail", useReducedMotion() ? .35 : 2.25, phase === "depart" ? "从东岬湾解缆…" : "驶回东岬船坞…");
  activity.phase = phase;
}

function finishClubSailing(phase) {
  const ventures = saved.life.ventures;
  const { trip, ledger } = ventures;
  if (!trip) return;
  if (phase === "depart") {
    trip.state = "sailing";
    changeArea("offshore", areaOffshore.arrival);
    return;
  }
  const guests = trip.casts ? trip.guests : 0;
  const revenue = guests * ticketPrice;
  for (const id of trip.fish) {
    storeLandedFish(id, offshoreWaters[trip.water].name);
  }
  saved.inventory.coin += revenue;
  ledger.trips++;
  ledger.tripFees += tripCost;
  ledger.tickets += revenue;
  ventures.tripDay = dayIndex();
  ventures.trip = null;
  if (guests) {
    ventures.guestTrips++;
    trackResidentProgress("guest-voyage", 1);
    if (ventures.guestTrips === 1) addAlert("老纪的赛前邀约", "带客顺利返航了。下个周三来东岬湾比赛，我和阿澄也来。");
  }
  changeArea("island", eastBayLanding());
  notify(`安全返航 · 渔获 ${trip.fish.length} 尾 · 船票收入 ${revenue} 贝币`);
}

function goToRace(first) {
  const { trip, race } = saved.life.ventures;
  if (!isClubOpen(false) || trip || race?.week !== Math.floor(dayIndex() / 7)) return;
  if (first) {
    if (race.state !== "registered" || !raceWindow().canStart) return;
    race.state = "active";
    race.start = Math.floor(saved.minutes);
  } else if (race.state !== "active" || !raceWindow().canStart) return;
  get("club-dialog").close();
  changeArea("offshore", areaOffshore.arrival);
}

function standingsList(race) {
  const list = document.createElement("ol");
  list.className = "race-results";
  for (const entry of raceStandings(race)) {
    const line = document.createElement("li");
    line.textContent = `第 ${entry.place} 名 · ${entry.name} · ${entry.points} 分（最高单尾 ${entry.best}）`;
    list.append(line);
  }
  return list;
}

function settleRace() {
  const { race, ledger } = saved.life.ventures;
  if (saved.area !== "offshore" || race?.state !== "active" || race.casts !== 4 || fishing) return;
  race.place = raceStandings(race).find(entry => entry.name === "你").place;
  const reward = [0, 22, 12, 6][race.place];
  race.state = "done";
  saved.life.ventures.lastRacePlace = race.place;
  saved.inventory.coin += reward;
  ledger.races++;
  ledger.raceIncome += reward;
  if (race.place === 1) { ledger.champions++; ledger.medals++; }
  saved.minutes += 30;
  addAlert("周三钓鱼比赛结算", `本周第 ${race.place} 名，获得 ${reward} 贝币${race.place === 1 ? "和一枚冠军奖牌" : ""}。`);
  changeArea("island", eastBayLanding());
  openClub();
}

function updateOffshoreAccess() {
  const session = activeFishingSession();
  const offshore = saved.area === "offshore";
  get("offshore-controls").hidden = !offshore;
  if (!offshore || !session) return;
  const limit = session.water ? 3 : 4;
  get("boat-cast").disabled = Boolean(fishing || activity || session.casts >= limit || weatherAtTime() === "storm");
  get("boat-menu").disabled = Boolean(fishing || activity);
  const place = session.water ? offshoreWaters[session.water].name : raceShelter(session) ? "避风港赛场" : "东岬湾赛场";
  get("boat-progress").textContent = `${place} · 已抛 ${session.casts}/${limit} 竿`;
}

const lunchGuests = [
  { name: "小满", portrait: 3, likes: ["fruit-bowl", "coconut-egg", "fruit-roast", "melon-ice"], greeting: "闻到椰子的香气了，想试试你这里的拿手菜。" },
  { name: "老纪", portrait: 1, likes: ["crab-soup", "soup", "fruit-roast", "pumpkin-stew"], greeting: "在外面吹了一早上海风，正想吃点热的。" },
  { name: "阿澄", portrait: 0, likes: ["steamed-crab", "seaweed-fish", "seaweed-egg", "radish-soup"], greeting: "从灯塔能看见露台的屋顶。今天有什么海味？" },
  { name: "船家", portrait: 7, likes: ["soup", "sweet-potato"], greeting: "最后一趟靠岸了。让我看看今天的菜单。" }
];

function mealPrice(id) {
  return { soup: 18, "fruit-bowl": 13, "coconut-egg": 18, "seaweed-egg": 15, "fruit-roast": 16 }[id] ?? items[id].sell + 6;
}

function lunchRequirement(dining) {
  if (dining.shift?.day === dayIndex()) return "今天已打烊。下一个岛上日 11:30 可再开门。";
  if (!dining.name) return "先保存餐厅名称。";
  if (dining.menu.length < 2) return "先在菜单里选 2 至 3 道菜。";
  const missing = dining.menu.filter(id => !dining.stock[id]);
  if (missing.length) return `开门前请各备 1 份${missing.map(id => items[id].name).join("、")}。`;
  const minute = saved.minutes % 1440;
  return minute < lunchStart || minute >= lunchEnd ? "备菜已齐。营业时间为 11:30–15:00。" : "";
}

function openRestaurant() {
  if (saved.area !== "island" || !built("restaurant") || activity || fishing || dialogOpen()) return;
  keys.clear();
  get("dining-feedback").textContent = "";
  fillRestaurant();
  get("restaurant-dialog").showModal();
}

function diningChanged(message = "") {
  uiDirty = true;
  save();
  fillRestaurant();
  get("dining-feedback").textContent = message;
}

function fillRestaurant() {
  const { dining } = saved.life.ventures;
  const { shift, stock, menu } = dining;
  const open = shift?.open === true;
  get("restaurant-title").textContent = dining.name || "海边餐厅";
  get("restaurant-name").value = dining.name;
  get("restaurant-name-form").hidden = open;
  get("dining-cookbook").hidden = !saved.progress.cooking;
  get("dining-status").textContent = open ? `午餐营业中 · 已接待 ${shift.served}/4 桌${!dining.letter && shift.served < 2 ? " · 首轮目标 2 桌" : ""}` :
    shift?.day === dayIndex() ? `今天已打烊 · 接待 ${shift.served} 桌` : "11:30–15:00 开午餐。选 2 至 3 道菜，每道先备 1 份。";
  const list = get("dining-menu");
  list.replaceChildren();
  const available = recipes.filter(recipeKnown);
  const ordered = [...available.filter(recipe => menu.includes(recipe.id)),
    ...available.filter(recipe => !menu.includes(recipe.id))];
  for (const recipe of ordered) {
    const { id, ingredients } = recipe;
    const row = venturePanel(list, `${items[id].name} · ${mealPrice(id)} 贝币`, `备菜 ${stock[id]} 份 · 背包 ${saved.inventory[id]} 份`);
    row.dataset.dish = id;
    if (!open) {
      const source = document.createElement("p");
      const sources = Object.keys(ingredients).map(item => `${items[item].name}（${ingredientSource(item)}）`);
      if (recipe.crab) sources.push("任选一种螃蟹（南岸蟹笼或老纪鱼摊）");
      source.textContent = `食材 ${sources.join("、")}`;
      row.append(source);
    }
    const actions = document.createElement("div");
    actions.className = "life-actions";
    const chosen = menu.includes(id);
    row.hidden = open && !chosen;
    if (!open) actions.append(lifeButton(chosen ? "移出菜单" : "加入菜单", () => toggleDish(id), !chosen && menu.length >= 3));
    if (open && !stock[id]) actions.append(lifeStatus("售罄"));
    if (!open && !chosen && stock[id]) actions.append(lifeButton("取回全部", () => transferDish(id, -stock[id])));
    if (actions.childElementCount) row.append(actions);
    if (chosen) appendPreparation(row, recipe, open);
  }
  const counter = get("dining-counter");
  counter.replaceChildren();
  if (!open) {
    const requirement = lunchRequirement(dining);
    if (requirement) {
      const note = document.createElement("p");
      note.className = "dining-opening-note";
      note.textContent = requirement;
      counter.append(note);
    }
    counter.append(lifeButton("开门营业", () => {
      if (!get("restaurant-dialog").open || lunchRequirement(dining)) return;
      dining.opened = true;
      dining.shift = { day: dayIndex(), served: 0, open: true, dish: null };
      diningChanged("餐厅开门了。先接待第一桌客人。");
    }, Boolean(requirement)));
    return;
  }
  const guest = lunchGuests[shift.served];
  const table = venturePanel(counter, guest ? `第 ${shift.served + 1} 桌 · ${guest.name}` : "四桌已上齐", guest?.greeting ?? "可以结算打烊了。");
  if (guest) {
    const portrait = document.createElement("img");
    portrait.className = "dining-portrait";
    portrait.alt = "";
    portrait.src = Archipelago.portrait(guest.portrait);
    table.prepend(portrait);
    if (shift.dish) {
      const ordered = shift.dish;
      const order = shift.served;
      table.append(lifeStatus(`点单 · ${items[ordered].name}`),
        lifeButton("上菜并收款", () => serveDish(shift, order, ordered), !stock[ordered]));
      const others = menu.filter(id => id !== ordered && stock[id]);
      if (others.length) table.append(lifeButton(`换点${items[others[0]].name}`, () => {
        if (dining.shift !== shift || !shift.open || shift.served !== order || shift.dish !== ordered) return;
        shift.dish = others[0];
        diningChanged("客人换了一道菜。");
      }));
    } else {
      table.append(lifeButton("接单", () => {
        if (!get("restaurant-dialog").open || dining.shift !== shift || !shift.open || shift.dish) return;
        const dish = [...guest.likes, ...menu].find(id => menu.includes(id) && stock[id]);
        if (!dish) return;
        shift.dish = dish;
        diningChanged();
      }, !menu.some(id => stock[id])));
    }
  }
  counter.append(lifeButton("结算打烊", closeLunch));
}

function appendPreparation(row, recipe, open) {
  const { id } = recipe;
  const stock = saved.life.ventures.dining.stock[id];
  const box = document.createElement("div");
  box.className = "dining-prep";
  const control = document.createElement("label");
  control.className = "prep-quantity";
  control.textContent = "备菜份数";
  const select = document.createElement("select");
  select.setAttribute("aria-label", `${items[id].name}的备菜份数`);
  for (let quantity = 1; quantity <= maxPreparationPortions; quantity++) {
    const option = document.createElement("option");
    option.value = String(quantity);
    option.textContent = `${quantity} 份`;
    select.append(option);
  }
  select.value = String(diningPrepQuantities.get(id) ?? 1);
  control.append(select);
  const requirement = document.createElement("p");
  requirement.className = "prep-requirement";
  requirement.setAttribute("aria-live", "polite");
  const actions = document.createElement("div");
  actions.className = "life-actions";
  const transfer = lifeButton("", () => transferDish(id, Number(select.value)));
  const cook = lifeButton("", () => startRestaurantPrep(recipe, Number(select.value)));
  actions.append(transfer, cook);
  let withdraw;
  if (!open && stock) {
    withdraw = lifeButton("", () => transferDish(id, -Number(select.value)));
    actions.append(withdraw, lifeButton("取回全部", () => transferDish(id, -stock)));
  }
  const refresh = () => {
    const quantity = Number(select.value);
    const { ingredients, unfilledCrabs, energy, missing } = cookingPlan(recipe, quantity);
    const recipeText = Object.entries(ingredients).map(([item, count]) => `${items[item].name} × ${count}`);
    if (unfilledCrabs) recipeText.push(`任选螃蟹 × ${unfilledCrabs}`);
    requirement.textContent = `现做需 ${recipeText.join("、")}、体力 ${energy} 点${missing.length ? `。还差 ${missing.join("、")}` : ""}。`;
    transfer.textContent = `从背包备 ${quantity} 份`;
    transfer.disabled = saved.inventory[id] < quantity;
    cook.textContent = `现做 ${quantity} 份`;
    cook.disabled = Boolean(missing.length);
    if (withdraw) {
      withdraw.textContent = `取回 ${quantity} 份`;
      withdraw.hidden = quantity >= stock;
    }
  };
  select.addEventListener("change", () => {
    diningPrepQuantities.set(id, Number(select.value));
    refresh();
  });
  refresh();
  box.append(control, requirement, actions);
  row.append(box);
}

function ingredientSource(id) {
  if (id === "egg") return "西岸畜舍";
  if (id === "seaweed") return "潮生岛潮池";
  if (id === "fish") return "栈桥或出海钓鱼";
  return Object.hasOwn(cultivars, id) ? "田地收获" : "岛上采集";
}

function toggleDish(id) {
  const { dining } = saved.life.ventures;
  if (!get("restaurant-dialog").open || dining.shift?.open || !recipeKnown(recipes.find(recipe => recipe.id === id))) return;
  if (dining.menu.includes(id)) dining.menu = dining.menu.filter(item => item !== id);
  else if (dining.menu.length < 3) dining.menu.push(id);
  diningChanged();
}

function transferDish(id, quantity) {
  const { dining } = saved.life.ventures;
  if (!get("restaurant-dialog").open || !Object.hasOwn(dining.stock, id) ||
      !Number.isSafeInteger(quantity) || !quantity || saved.inventory[id] < quantity || dining.stock[id] + quantity < 0) return;
  if (quantity > 0 && (!dining.menu.includes(id) || quantity > maxPreparationPortions)) return;
  if (quantity < 0 && dining.shift?.open) return;
  saved.inventory[id] -= quantity;
  dining.stock[id] += quantity;
  diningChanged(`已${quantity > 0 ? "备好" : "取回"} ${Math.abs(quantity)} 份${items[id].name}。`);
}

function startRestaurantPrep(recipe, quantity) {
  const { dining } = saved.life.ventures;
  if (!get("restaurant-dialog").open || activity || !dining.menu.includes(recipe.id) || !recipeKnown(recipe) ||
      !Number.isSafeInteger(quantity) || quantity < 1 || quantity > maxPreparationPortions ||
      cookingPlan(recipe, quantity).missing.length) return;
  get("restaurant-dialog").close();
  player.facing = "up";
  beginActivity("restaurant-prep", useReducedMotion() ? .55 : 2 + quantity * .45,
    `正在准备 ${quantity} 份${items[recipe.id].name}…`);
  Object.assign(activity, { recipe, quantity });
}

function serveDish(shift, order, id) {
  const { dining, ledger } = saved.life.ventures;
  if (!get("restaurant-dialog").open || dining.shift !== shift || !shift.open || shift.served !== order ||
      shift.dish !== id || !dining.stock[id] || order >= 4) return;
  const price = mealPrice(id);
  dining.stock[id]--;
  saved.inventory.coin += price;
  shift.served++;
  shift.dish = null;
  ledger.tables++;
  ledger.meals++;
  ledger.sales += price;
  chime(650);
  diningChanged(`上了${items[id].name} · 贝币 +${price}`);
}

function closeLunch() {
  const { dining } = saved.life.ventures;
  const shift = dining.shift;
  if (!shift?.open) return;
  shift.open = false;
  shift.dish = null;
  if (!dining.letter) dining.letter = "queued";
  uiDirty = true;
  addAlert("餐厅午餐已结算", `今天招待了 ${shift.served} 桌。剩菜可以取回背包。`);
  save();
  if (get("restaurant-dialog").open) fillRestaurant();
}

function updateCoastalHud(minute) {
  const day = Math.floor(minute / 1440);
  get("island-weekday").textContent = `周${weekdays[day % 7]}`;
  const calendar = get("island-calendar");
  calendar.hidden = !saved.progress.building;
  if (!calendar.hidden) {
    const untilWednesday = (9 - day % 7) % 7;
    const { race, trip } = saved.life.ventures;
    const week = Math.floor(day / 7);
    const contest = !built("fishing-club") ? "" : race?.week === week && race.state === "done" ?
      " · 本周比赛已结算" : untilWednesday ? ` · 比赛第 ${day + untilWednesday + 1} 天` : " · 今天有钓鱼比赛";
    get("calendar-line").textContent = `行商第 ${day + (6 - day % 7) + 1} 天${contest}${trip ? ` · ${trip.state === "booked" ? "已预约" : "航行中"} · ${offshoreWaters[trip.water].name}` : ""}`;
  }
  get("walk-club").hidden = !built("fishing-club") || saved.area === "offshore";
  get("walk-restaurant").hidden = !built("restaurant") || saved.area === "offshore";
  updateOffshoreAccess();
}

function openCoastalLedger() {
  if (!saved.progress.building || activity || fishing || dialogOpen()) return;
  const { ledger, dining, loanCleared, guestTrips, deliveries, lastRacePlace } = saved.life.ventures;
  const costs = [...islandProjects].filter(project => built(project.id)).reduce((sum, project) => sum + project.costs.coin, 0);
  const content = get("ledger-content");
  content.replaceChildren();
  venturePanel(content, "餐厅", `接待 ${ledger.tables} 桌 · 售出 ${ledger.meals} 道菜 · 收入 ${ledger.sales} 贝币${dining.opened ? " · 已开业" : ""}`);
  venturePanel(content, "出海航次", `${ledger.trips} 趟 · 带客 ${guestTrips} 趟 · 船务费 ${ledger.tripFees} · 船票收入 ${ledger.tickets} 贝币`);
  venturePanel(content, "周三赛事", `完赛 ${ledger.races} 场 · 奖金 ${ledger.raceIncome} 贝币 · 周冠军 ${ledger.champions} 次 · 冠军奖牌 ${ledger.medals} 枚${lastRacePlace ? ` · 最近第 ${lastRacePlace} 名` : ""}`);
  venturePanel(content, "岛建与贷款", `已施工工程标价合计 ${costs} 贝币 · 剩余贷款 ${saved.life.expansion.debt} 贝币${loanCleared ? " · 已结清扩岛贷款" : ""}`);
  if (built("east-bay")) venturePanel(content, "潮汐露台进度", `东岬湾完工后带客 ${guestTrips}/2 趟 · 交付居民委托 ${deliveries}/2 项`);
  get("ledger-dialog").showModal();
}

function setupVentures() {
  for (const id of ["club", "restaurant", "ledger"]) {
    get(`close-${id}`).addEventListener("click", () => get(`${id}-dialog`).close());
  }
  get("walk-club").addEventListener("click", () => goToIslandSpot(Island.spots.find(spot => spot.type === "club")));
  get("walk-restaurant").addEventListener("click", () => goToIslandSpot(Island.spots.find(spot => spot.type === "restaurant")));
  get("boat-cast").addEventListener("click", castFromBoat);
  get("boat-menu").addEventListener("click", openClub);
  get("open-ledger").addEventListener("click", openCoastalLedger);
  get("restaurant-name-form").addEventListener("submit", event => {
    event.preventDefault();
    const { dining } = saved.life.ventures;
    const name = get("restaurant-name").value.trim().slice(0, 18);
    if (!get("restaurant-dialog").open || dining.shift?.open || !name) return;
    dining.name = name;
    diningChanged("餐厅名字已保存。");
  });
  get("dining-cookbook").addEventListener("click", () => {
    get("restaurant-dialog").close();
    if (saved.progress.cooking) goToIslandSpot(Island.spots.find(spot => spot.type === "enter"), Cabin.spots.find(spot => spot.type === "cook"));
  });
  get("dining-backpack").addEventListener("click", () => {
    get("restaurant-dialog").close();
    get("inventory-slots").scrollIntoView({ block: "center" });
  });
}
