"use strict";

const get = id => document.getElementById(id);
const canvas = get("world");
const ctx = Island.sceneContext(canvas, { alpha: false });
const dialog = get("letter-dialog");
const cookDialog = get("cook-dialog");
const connectDialog = get("connect-dialog");
const marketDialog = get("market-dialog");
const fishDialog = get("fish-dialog");
const nameDialog = get("name-dialog");
const alertsDialog = get("alerts-dialog");
const resetDialog = get("reset-dialog");
const farmDialog = get("farm-dialog");
const contactsDialog = get("contacts-dialog");
const sailDialog = get("sail-dialog");
const settingsDialog = get("settings-dialog");
const questsDialog = get("quests-dialog");
const deskDialog = get("desk-dialog");
const diaryDialog = get("diary-dialog");
const residentDialog = get("resident-dialog");
const projectsDialog = get("projects-dialog");
const coopDialog = get("coop-dialog");
const gameDialogs = [...document.querySelectorAll("dialog")];
const dialogOpen = () => arrivalInProgress || gameDialogs.some(pane => pane.open);
const marker = get("marker");
const residentTurnIn = get("resident-turn-in");
const action = get("action");
const postButton = get("post");
const storageKey = "tidal-letters-v1";
const restartStorageKey = "tidal-letters-v2";
const islandIdPattern = /^[0-9a-f-]{36}$/i;
let activeStorageKey = storageKey;
const seasonLength = 14;
const reach = 25;
const start = { x: 179, y: 165, facing: "down" };
const keys = new Set();
const weatherNames = { clear: "晴天", cloud: "多云", rain: "阵雨", storm: "飓风", snow: "飘雪" };
const seasons = [
  { id: "spring", name: "春季", crop: "crop", dawn: 6, dusk: 18, note: "岛上的野花开了，海风里也有了暖意。" },
  { id: "summer", name: "夏季", crop: "melon", dawn: 5.5, dusk: 19.5, note: "天亮得更早了。花和树荫沿着海滩长得正盛。" },
  { id: "autumn", name: "秋季", crop: "pumpkin", dawn: 6.5, dusk: 17.5, note: "海风吹落树叶，草地换成了金黄色。" },
  { id: "winter", name: "冬季", crop: "radish", dawn: 7, dusk: 17, note: "薄霜落在草地和木屋上，天空有时会飘雪。" }
];

function calendarDay(minutes, offset = saved.seasonOffset) {
  return Math.floor(minutes / 1440) + offset;
}

function seasonSerial(minutes, offset = saved.seasonOffset) {
  return Math.floor(calendarDay(minutes, offset) / seasonLength);
}
function seasonAt(minutes) { return seasons[seasonSerial(minutes) % seasons.length]; }

function lightHour(hour, season) {
  const { dawn, dusk } = season;
  if (hour < dawn) return 6 * hour / dawn;
  if (hour < dusk) return 6 + 12 * (hour - dawn) / (dusk - dawn);
  return 18 + 6 * (hour - dusk) / (24 - dusk);
}
const cultivars = {
  crop: { name: "甜薯", seed: "seed", price: 2, sell: 5, energy: 22 },
  melon: { name: "西瓜", seed: "melon-seed", price: 3, sell: 8, energy: 30 },
  pumpkin: { name: "南瓜", seed: "pumpkin-seed", price: 3, sell: 7, energy: 27 },
  radish: { name: "萝卜", seed: "radish-seed", price: 2, sell: 6, energy: 24 }
};
const seedIds = Object.values(cultivars).map(({ seed }) => seed);
const species = [
  { id: "fish", name: "蓝鳍鱼", rarity: "常见", hint: "岛东栈桥附近最常见的鱼。", weight: .64, pull: .83, gain: .17, sell: 6, energy: 10 },
  { id: "snapper", name: "珊瑚鲷", rarity: "少见", seasons: ["spring", "summer"], hint: "常沿着亮一些的浅水边缘游过。", weight: .20, pull: .90, gain: .16, sell: 10, energy: 16 },
  { id: "glass", name: "银玻璃鱼", rarity: "稀有", seasons: ["autumn", "winter"], hint: "像玻璃一样透亮，挣扎起来却很有力。", weight: .13, pull: .98, gain: .155, sell: 17, energy: 21 },
  { id: "moonfish", name: "金鳞月鱼", rarity: "传说", hint: "日落的金光落在浮标旁时更容易出现。", pull: 1.02, gain: .15, sell: 38, energy: 35 },
  { id: "flower-bass", name: "花斑鲈", rarity: "少见", seasons: ["spring"], hint: "背上有一排像花瓣的粉斑。", weight: .21, pull: .94, gain: .16, sell: 11, energy: 17, colors: ["#984b69", "#ef9aa4", "#ffe1b4"], shape: "reef" },
  { id: "sardine", name: "银鳞沙丁", rarity: "常见", seasons: ["spring"], hint: "天暖后，能看到鱼群贴近岸边。", weight: .16, pull: .79, gain: .175, sell: 8, energy: 13, colors: ["#567288", "#afcdcc", "#e6e4cf"], shape: "shoal" },
  { id: "parrotfish", name: "碧礁鹦嘴鱼", rarity: "少见", seasons: ["summer"], hint: "明亮的绿背混在浅海礁石间。", weight: .22, pull: .93, gain: .16, sell: 13, energy: 18, colors: ["#26716b", "#63c8a6", "#e4d9a0"], shape: "reef" },
  { id: "wingfish", name: "飞翼鱼", rarity: "稀有", seasons: ["summer"], hint: "张开胸鳍时像在浪上滑翔。", weight: .085, pull: 1.01, gain: .15, sell: 21, energy: 23, colors: ["#535a9b", "#91a9d6", "#d6e8d6"], shape: "wing" },
  { id: "maple-grouper", name: "枫斑石斑", rarity: "少见", seasons: ["autumn"], hint: "身上的棕红花纹像海里漂着的枫叶。", weight: .20, pull: .94, gain: .16, sell: 12, energy: 17, colors: ["#8d5349", "#d9925c", "#f4cf88"], shape: "reef" },
  { id: "redtail", name: "赤尾鲷", rarity: "稀有", seasons: ["autumn"], hint: "转身时只看得见一道赤红的尾鳍。", weight: .085, pull: 1, gain: .152, sell: 20, energy: 22, colors: ["#a24657", "#ed857f", "#ffe5b5"], shape: "shoal" },
  { id: "frost-flounder", name: "霜纹鲽", rarity: "少见", seasons: ["winter"], hint: "浅蓝的斑纹让它很难从沙底辨认。", weight: .21, pull: .96, gain: .158, sell: 14, energy: 18, colors: ["#588292", "#a8d2d4", "#e7eddc"], shape: "flat" },
  { id: "winter-cod", name: "寒湾鳕", rarity: "稀有", seasons: ["winter"], hint: "冰冷的海水里，它的游速仍然很快。", weight: .09, pull: 1.04, gain: .15, sell: 22, energy: 24, colors: ["#5b678d", "#a7afd1", "#e8e6dc"], shape: "shoal" }
];

const cookingEnergy = 5;
const recipes = [
  { id: "soup", ingredients: { coconut: 1, fish: 1 } },
  { id: "fruit-bowl", name: "椰香果碗", energy: 36, sell: 9, ingredients: { coconut: 1, fruit: 1 } },
  { id: "seaweed-fish", name: "海藻烤鱼", energy: 42, sell: 12, ingredients: { fish: 1, seaweed: 1 } },
  { id: "sweet-potato", name: "椰汁甜薯", energy: 48, sell: 13, ingredients: { crop: 1, coconut: 1 } },
  { id: "melon-ice", name: "西瓜椰冰", energy: 52, sell: 15, ingredients: { melon: 1, coconut: 1 } },
  { id: "pumpkin-stew", name: "南瓜鱼煲", energy: 58, sell: 17, ingredients: { pumpkin: 1, fish: 1 } },
  { id: "radish-soup", name: "萝卜海藻汤", energy: 49, sell: 13, ingredients: { radish: 1, seaweed: 1 } },
  { id: "coconut-egg", name: "椰香蒸蛋", energy: 46, sell: 13, ingredients: { egg: 1, coconut: 1 }, expansionOnly: true },
  { id: "seaweed-egg", name: "海藻蛋羹", energy: 44, sell: 11, ingredients: { egg: 1, seaweed: 1 }, restaurantOnly: true },
  { id: "fruit-roast", name: "果香烤鱼", energy: 45, sell: 12, ingredients: { fish: 1, fruit: 1 }, restaurantOnly: true },
  { id: "steamed-crab", name: "海藻蒸蟹", energy: 52, sell: 15, ingredients: { seaweed: 1 }, crab: true },
  { id: "crab-soup", name: "椰香蟹汤", energy: 57, sell: 16, ingredients: { coconut: 1 }, crab: true }
];
const recipeIngredients = [...new Set(recipes.flatMap(recipe => Object.keys(recipe.ingredients)))];

const items = {
  ...Object.fromEntries(Object.values(cultivars).map(({ name, seed, price }) => [seed, { name: `${name}种子`, buy: price }])),
  compost: { name: "堆肥", buy: 4 },
  ...cultivars,
  fruit: { name: "海岛果", buy: 5, sell: 3, energy: 14 },
  coconut: { name: "椰子", buy: 6, sell: 3, energy: 18 },
  ...Object.fromEntries(species.map(fish => [fish.id, fish.id === "fish" ? { ...fish, buy: 9 } : fish])),
  ...Object.fromEntries(crabs.map(crab => [crab.id, crab])),
  soup: { name: "椰香鱼汤", sell: 12, energy: 40 },
  shell: { name: "古贝", sell: 9 },
  seaweed: { name: "海藻", sell: 3 },
  timber: { name: "浮木", sell: 2 },
  feed: { name: "饲料" },
  egg: { name: "鸡蛋", sell: 5, energy: 12 },
  "duck-egg": { name: "鸭蛋", sell: 7, energy: 16 },
  ...Object.fromEntries(recipes.slice(1).map(({ id, name, sell, energy }) => [id, { name, sell, energy }]))
};

function hookedSpecies() {
  const season = seasonAt(saved.minutes);
  const hour = saved.minutes % 1440 / 60;
  const legendChance = Math.abs(hour - season.dusk) <= 1 ? .085 : .03;
  const roll = Math.random();
  if (roll < legendChance) return species.find(fish => fish.rarity === "传说");
  const available = species.filter(fish => fish.weight && availableThisSeason(fish, season));
  const total = available.reduce((sum, fish) => sum + fish.weight, 0);
  let draw = (roll - legendChance) / (1 - legendChance) * total;
  return available.find(fish => {
    draw -= fish.weight;
    return draw < 0;
  }) ?? available[available.length - 1];
}
const replies = [
  { from: "灯塔值守员 阿澄", text: "收到你的信时，灯塔刚亮。每天傍晚我都会把灯转向你的小岛。要是看见海面上有一道慢慢扫过的光，那就是我在向你打招呼。" },
  { from: "北岬渔夫 老纪", text: "海鸥叼着信落在我晾网的架子上。岛东的水清，鱼咬钩之前，浮标会轻轻打一个转。下回寄信，告诉我你钓到了什么。" },
  { from: "灯塔值守员 阿澄", text: "今早岸边飘来几颗果子，我留了一颗在窗台上。看着它，忽然觉得我们两边的海岸离得没有那么远。" },
  { from: "岸边杂货铺 小满", text: "今天潮水退得很慢。我把你的信夹在了窗边，等风小一些就读给来买盐的人听。海鸥分到了饼干屑，正在屋檐上理羽毛。" }
];
const family = {
  mother: {
    name: "妈妈",
    letters: [
      "今天厨房的窗开了一下午，风一进来，我就想起你在海上。忙完记得吃点热的。哪天不想写长信，画条小鱼给我也行。",
      "早上蒸了甜薯，揭开锅盖时满屋子都是香气。我还是习惯多拿一个碗。你那边若也有甜薯，就替我尝一口。",
      "院子里的衣服一件一件干了，太阳下山才收完。你在岛上要是累了，就把手头的事放到明天。海还会在那里。",
      "昨天收拾旧柜子，翻到你小时候捡的一块白石头，边缘磨得圆圆的。我把它放在厨房窗台上了。"
    ]
  },
  father: {
    name: "爸爸",
    letters: [
      "院门的铰链终于不吱呀响了。我连修了两遍，第一遍装反，被你妹妹笑了。岛上起大风的时候，记得早点回屋。",
      "今天在岸边站了会儿。浪看着急，其实一阵就过去了。我年轻时钓鱼也总想快些收线，后来才知道，肯等的人更容易带鱼回家。",
      "我把小船的桨重新上了油。你小时候嫌我做得慢，总在旁边数浪。现在换我在家数，数着数着就到傍晚了。",
      "路过鱼市，看到有人提着一条尾巴比手掌还宽的鱼。我没买，想着等你回来听你讲，你钓过多大的。"
    ]
  },
  sister: {
    name: "妹妹",
    letters: [
      "我给你画了张海图，结果把海鸥画得比整座岛还大。它要是真飞到你那边，你别告诉它我画胖了。",
      "我种了两颗豆子，一颗长得很快，一颗一直装睡。我给快的叫浪花，慢的叫你。你可以抗议，但豆子不会。",
      "今晚的云像一个倒扣的茶碗。我想你那边也许看得到，就多站了一会儿。要是你也看见了，我们就算一起看过。",
      "我偷偷在爸爸的工具箱里放了一块糖，他找扳手的时候笑了。下一封信我再告诉你，他把糖藏回了哪里。"
    ]
  }
};

const contacts = [
  { id: 0, name: replies[0].from },
  { id: 1, name: replies[1].from },
  { id: 3, name: replies[3].from },
  { id: 4, name: family.mother.name, response: "看见你的字，我在桌边又坐了一会儿。厨房刚烧了水，热气扑在窗上。你那边要是忙，也记得挑个空当坐下来歇歇。" },
  { id: 5, name: family.father.name, response: "信收到了。我今天把岸边的小船栓紧了两道，才放心回家。你在岛上，有难事就慢慢分成几件做，总能做完。" },
  { id: 6, name: family.sister.name, response: "你的信我读了两遍！海鸥还想从窗台上把信叼走，我拿几粒碎饼干跟它换。下回你再写信，我会留一块最大的给它。" },
  { id: 7, name: "歧石岛建筑工 阿岩", response: "介绍信和你写的话我都收到了。我在歧石岛工坊等你，到了就过来看看海岸的图纸。" }
];

const postCoinGoal = 12;
const invitationRoutes = { 0: "beacon", 1: "headland", 3: "windbell", 7: "qishi" };
const familyReplyIds = { mother: 4, father: 5, sister: 6 };
const firstLetterOrder = [4, 3, 1, 0, 5, 6];
const firstLetterDelay = 35;
const firstLetterSpacing = 55;
const introductions = {
  0: "行商说，海那边新亮了一盏灯。我是灯塔值守员阿澄。这只海鸥认得两边的岸。你方便时，给我回封信，说说岛上是什么样吧。",
  1: "船家说你在岛上安顿下来了。我叫老纪，在北岬打鱼。如果想学沿岸下竿，就回信告诉我，我给你捎点用得上的东西。",
  3: "你好，我是风铃岛杂货铺的小满。我刚整理完当季的种子。要是想在屋旁种点什么，给我回封信，我可以给你准备一小包。",
  7: "邻岛的朋友把介绍信递给我了。我是歧石岛的阿岩。可以回信告诉我你想怎么收拾西岸，我再把到工坊的航图给你。"
};

function letterAuthor(letter) {
  return letter.kind === "family" ? familyReplyIds[letter.author] : letter.reply === 2 ? 0 : letter.reply;
}

function contactAvailable(id) {
  return saved.progress.correspondents.includes(id);
}

function letterRecipient(id) {
  const resident = replies[id];
  if (resident) return resident;
  const relative = contacts.find(contact => contact.id === id);
  return relative ? { from: relative.name, text: relative.response } : null;
}

const residents = {
  headland: { name: "老纪", portrait: 1, greeting: "风刚转小，我正准备补网。要不要过来坐会儿？",
    topic: "聊聊钓鱼", answer: "鱼用力挣扎的时候，先松手等一等。浮标稳下来，再收线。北岬岛东边就能下竿。",
    task: "两条新鲜蓝鳍鱼", request: "我答应给回港的船员留鱼。你能在接下委托后钓两条蓝鳍鱼，再带回来吗？",
    item: "fish", count: 2, fresh: true, reward: { coin: 18, timber: 2 },
    thanks: "好新鲜的鱼！贝币给你，另外这两根浮木也带上，做点岛上的家具吧。" },
  beacon: { name: "阿澄", portrait: 0, greeting: "早上擦过灯塔的玻璃，站在上面能看到很远的海。",
    topic: "聊聊灯塔", answer: "日落后我会点灯。天晴的时候，远处的船会闪一下灯，算是回了我的招呼。",
    task: "值夜的热汤", request: "今晚要在塔上值夜。潮生岛的海藻煮汤很鲜，可以帮我带两份吗？",
    item: "seaweed", count: 2, reward: { coin: 14, shell: 1 },
    thanks: "今晚有热汤喝了。古贝是我巡岸时捡到的，你拿去吧。" },
  windbell: { name: "小满", portrait: 3, greeting: "听见门口的风铃了吗？风一变，声音也会跟着变。",
    topic: "聊聊当季种子", answer: "甜薯要等春天，西瓜喜欢夏天，南瓜和萝卜就留到秋冬。每季的种子我都留了一袋。",
    task: "海风杂货的果篮", request: "我想给下一班船做一篮点心。方便的话，带三颗海岛果来吧。",
    item: "fruit", count: 3, reward: { coin: 15, compost: 2 },
    thanks: "这篮子终于装满啦。贝币和后来用得上的堆肥都给你。" }
};

const builder = {
  name: "建筑工阿岩", portrait: 7, greeting: "来得正好，我把西岸几处礁石的位置标在图上了。",
  topic: "聊聊海岸施工", answer: "搭桥前得看落潮时露出多少岩石。先把木桩立稳，等下一次涨潮再回来检查。"
};
const residentConversation = id => id === "qishi" ? builder : residents[id];

const residentTaskPools = {
  island: [
    { id: "home-fruit", task: "木屋里的果盘", request: "交 1 颗海岛果，给路过木屋的船员添一份点心。",
      item: "fruit", count: 1, reward: { coin: 3 } },
    { id: "home-coconut", task: "栈桥的椰子", request: "交 1 个椰子，给在栈桥等船的人解渴。",
      item: "coconut", count: 1, reward: { coin: 3 } },
    { id: "home-shore", task: "沿岸采集记录", request: "接单后在自家岛上采集两份物资，采到的东西可以留在背包。",
      event: "gather", area: "island", count: 2, reward: { coin: 4 } },
    { id: "home-basket", task: "给下一班船的果篮", request: "为下一班船准备 2 颗海岛果。",
      item: "fruit", count: 2, reward: { coin: 5 } },
    { id: "home-milk", task: "备两份椰汁", request: "交 2 个椰子，给轮班的船工备些饮料。",
      item: "coconut", count: 2, reward: { coin: 5 } },
    { id: "home-fruit-search", task: "找一颗熟透的果子", request: "接单后在自家岛上摘或捡 1 颗海岛果。果子留给你。",
      event: "gather", target: "fruit", area: "island", count: 1, reward: { coin: 3 } },
    { id: "home-fish-note", task: "栈桥边的鱼讯", request: "接单后在自家栈桥钓到 1 条鱼，记下今天的收获。",
      event: "fish", area: "island", count: 1, reward: { coin: 5 } },
    { id: "home-garden-note", task: "给菜地松土", request: "接单后照料田地 2 次，开垦、播种或浇水都可以。",
      event: "farm", count: 2, reward: { coin: 4, compost: 1 } }
  ],
  headland: [
    { id: "crew-coconut", task: "给渔船补水", request: "带 2 个椰子来，给出早船的人解渴。", item: "coconut", count: 2, reward: { coin: 10 } },
    { id: "net-float", task: "修一修旧浮标", request: "带两根浮木来，我打算用它们修浮标。",
      item: "timber", count: 2, reward: { coin: 12 } },
    { id: "crab-basket", task: "蟹笼里的岩岸蟹", request: "带 1 只岩岸蟹给我，我想看看浅水处的蟹最近长得怎么样。",
      item: "shore-crab", count: 1, trap: true, reward: { coin: 15, timber: 1 } },
    { id: "fresh-bluefin", task: "清早的一尾蓝鳍鱼", request: "接单后钓 1 条蓝鳍鱼，并带来北岬岛。",
      event: "fish", target: "fish", item: "fish", count: 1, reward: { coin: 12, timber: 1 } },
    { id: "home-pier-watch", task: "自家栈桥看浮标", request: "接单后在自家栈桥钓到 1 条鱼。鱼可以留在背包里。",
      event: "fish", area: "island", count: 1, reward: { coin: 10 } },
    { id: "teach-guest", task: "带新手出海", request: "完成一趟带客出海。回来和我说说第一次抛竿顺不顺利。", event: "guest-voyage", count: 1, facility: "fishing-club", reward: { coin: 13, timber: 1 } },
    { id: "cape-log", task: "北岬鱼群记录", request: "到北岬岛东岸钓两条鱼，记下这片海的鱼情。鱼留给你。",
      event: "fish", area: "headland", count: 2, reward: { coin: 11, timber: 1 } },
    { id: "shoal-report", task: "群岛浮标观察", request: "在任意岛屿钓三条鱼。钓到的鱼自己留着，回来讲讲哪一竿最难。",
      event: "fish", count: 3, reward: { coin: 14, compost: 1 } },
    { id: "tide-bait", task: "补一点海藻饵", request: "带两份潮生岛的海藻来，我想试试新的鱼饵。",
      item: "seaweed", count: 2, route: "tidal", reward: { coin: 11, fruit: 1 } },
    { id: "boat-soup", task: "出海前的一碗汤", request: "明早出海前我想喝口热的。能带一碗椰香鱼汤来吗？",
      item: "soup", count: 1, reward: { coin: 16, timber: 1 } },
    ...["flower-bass", "parrotfish", "maple-grouper", "frost-flounder"].map(id => ({
      id: `seasonal-${id}`, task: `捕一条${items[id].name}`, request: `接下委托后，亲手钓一条当季的${items[id].name}，带来让我看看。旧鱼货可留着自己用。`,
      event: "fish", target: id, item: id, count: 1, seasons: items[id].seasons, reward: { coin: 20, shell: 1 }
    }))
  ],
  beacon: [
    { id: "watch-fruit", task: "值夜时的水果", request: "带 2 颗海岛果来给夜班的看守员。", item: "fruit", count: 2, reward: { coin: 10 } },
    { id: "keeper-eggs", task: "灯塔的鸡蛋早餐", request: "送 2 枚鸡蛋来，给清晨交班的人留顿早餐。",
      item: "egg", livestock: "hen", count: 2, reward: { coin: 17, compost: 1 } },
    { id: "keeper-coconut", task: "灯塔下的椰子水", request: "带 2 个椰子来，巡塔以后可以一起喝。",
      item: "coconut", count: 2, reward: { coin: 10, fruit: 1 } },
    { id: "keeper-meal", task: "灯塔窗边的果碗", request: "带 1 份椰香果碗来，给今天的看守员尝尝。",
      item: "fruit-bowl", recipe: "fruit-bowl", feature: "cooking", count: 1, reward: { coin: 16 } },
    { id: "reef-algae", task: "潮线上的海藻", request: "接单后在潮生岛捡 1 份海藻。记好采集点，海藻可以留给自己。",
      event: "gather", area: "tidal", target: "seaweed", count: 1, route: "tidal", reward: { coin: 11, compost: 1 } },
    { id: "night-soup", task: "值夜鱼汤预订", request: "值夜之前，帮我准备 2 份椰香鱼汤。", item: "soup", count: 2, facility: "restaurant", recipe: "soup", reward: { coin: 29, shell: 1 } },
    { id: "shell-dust", task: "擦亮灯塔的古贝", request: "我在做一个灯塔展柜。请带一枚古贝来，潮生岛的礁池边能找到。",
      item: "shell", count: 1, reward: { coin: 14, compost: 1 } },
    { id: "lamp-wood", task: "修灯架的木料", request: "塔顶的小灯架松了。帮我收三根浮木，沙滩上常有。",
      item: "timber", count: 3, reward: { coin: 12, shell: 1 } },
    { id: "watch-cook", task: "试做两道热饭", request: "夜里值班时也能做点热饭。你在木屋试做两道菜，再来告诉我心得，菜就留给你吃。",
      event: "cook", count: 2, reward: { coin: 13, fruit: 1 } },
    { id: "tide-survey", task: "潮池物产笔记", request: "到潮生岛采两份物资，再来告诉我今天涨潮前都找到了什么。东西你自己留着。",
      event: "gather", area: "tidal", count: 2, reward: { coin: 14, shell: 1 } },
    { id: "watch-meal", task: "灯塔夜宵", request: "带一份海藻烤鱼来吧，我留到今晚换班时吃。",
      item: "seaweed-fish", recipe: "seaweed-fish", count: 1, reward: { coin: 16, compost: 1 } },
    { id: "watch-duck-egg", task: "灯塔的鲜鸭蛋", request: "能从你家的畜舍带一枚鸭蛋来吗？今天换班晚，想煮个夜宵。",
      item: "duck-egg", livestock: "duck", count: 1, reward: { coin: 12, compost: 1 } }
  ],
  windbell: [
    { id: "shop-fruit", task: "补几颗海岛果", request: "送 2 颗海岛果到小满的杂货铺。", item: "fruit", count: 2, reward: { coin: 10, compost: 1 } },
    { id: "shop-coconut", task: "杂货架上的椰子", request: "送 1 个椰子来给杂货铺添货。", item: "coconut", count: 1, reward: { coin: 8 } },
    { id: "market-duck", task: "烘点心用的鸭蛋", request: "送 2 枚鸭蛋给杂货铺，我要试烤一盘点心。",
      item: "duck-egg", livestock: "duck", count: 2, reward: { coin: 20, compost: 1 } },
    { id: "fruit-roast-order", task: "给来客的果香烤鱼", request: "送 1 份果香烤鱼来，今天有客人订了午饭。",
      item: "fruit-roast", recipe: "fruit-roast", feature: "cooking", facility: "restaurant", count: 1, reward: { coin: 20 } },
    { id: "soil-journal", task: "记下堆肥配比", request: "接单后从堆肥箱领 1 次堆肥，并把观察带回来。堆肥留给你。",
      event: "compost", count: 1, reward: { coin: 8, fruit: 1 } },
    { id: "egg-orders", task: "预订鸡蛋点心", request: "帮我备 2 份椰香蒸蛋，我带回铺子给客人尝。", item: "coconut-egg", count: 2, facility: "restaurant", recipe: "coconut-egg", reward: { coin: 32, compost: 1 } },
    { id: "coconut-jam", task: "风铃铺的椰子酱", request: "凑三颗椰子给我做新一锅果酱吧。",
      item: "coconut", count: 3, reward: { coin: 12, compost: 1 } },
    { id: "fruit-breakfast", task: "码头上的早餐", request: "帮我准备一份椰香果碗，送给清早到港的船家。",
      item: "fruit-bowl", recipe: "fruit-bowl", count: 1, reward: { coin: 14, compost: 1 } },
    { id: "grow-notes", task: "这一茬长得好吗", request: "从自家田里收获三份作物，再来跟我聊聊收成。作物不用交给我。",
      event: "harvest", count: 3, reward: { coin: 12, fruit: 1 } },
    { id: "water-notes", task: "田间的浇水记录", request: "给自己的作物浇两次水，记下土壤的变化，之后回来找我。",
      event: "water", count: 2, reward: { coin: 9, compost: 1 } },
    { id: "coop-eggs", task: "杂货铺的新鲜鸡蛋", request: "想给等船的客人做点心。请从畜舍带两枚鸡蛋来吧。",
      item: "egg", livestock: "hen", count: 2, reward: { coin: 16, compost: 1 } },
    ...seasons.map(({ id, crop }) => ({
      id: `market-${crop}`, task: `当季菜篮 · ${items[crop].name}`, request: `杂货铺缺两份当季的${items[crop].name}。等收获后，带两份来交给我吧。`,
      item: crop, count: 2, seasons: [id], reward: { coin: items[crop].sell * 2 + 7, compost: 1 }
    }))
  ]
};

function randomCommissionTask(id, taskId) {
  return residentTaskPools[id].find(task => task.id === taskId);
}

function readCommissionEntry(id, entry, currentDay) {
  const task = randomCommissionTask(id, entry?.task);
  if (!task || !Number.isSafeInteger(entry.day) || entry.day < 0 || entry.day > currentDay ||
      !["offered", "active", "done", "skipped"].includes(entry.state)) return null;
  return { task: task.id, day: entry.day, state: entry.state, progress: Math.min(task.count, nonnegative(entry.progress)) };
}

function readRandomCommissions(source, currentDay) {
  return Object.fromEntries(Object.keys(residentTaskPools).flatMap(id => {
    const entry = readCommissionEntry(id, source?.[id], currentDay);
    return entry ? [[id, entry]] : [];
  }));
}

function readCommissionBacklog(source, currentDay, offers) {
  return Object.fromEntries(Object.keys(residentTaskPools).map(id => {
    const raw = Array.isArray(source?.[id]) ? source[id] : [];
    const byDay = new Map();
    for (const entry of raw) {
      const order = readCommissionEntry(id, entry, currentDay - 1);
      if (order?.state === "active" && order.day !== offers[id]?.day) byDay.set(order.day, order);
    }
    return [id, [...byDay.values()]];
  }));
}
const expansionUnlockDay = 7;
const expansionLoanLimit = 120;
const expansionLoanRate = 0.10;
const livestock = {
  hen: { name: "鸡", price: 12, product: "egg", headland: 10, beacon: 11 },
  duck: { name: "鸭", price: 18, product: "duck-egg", headland: 15, beacon: 16 }
};
const coopCapacity = expanded => expanded ? 8 : 4;
const breedingFeed = 2;
const breedingDays = 2;
const feedIngredients = ["fruit", ...Object.keys(cultivars)];

const islandProjects = [
  { id: "bench", name: "观潮长椅", description: "在南岸摆一张长椅。每天坐一次，可恢复 24 点体力。",
    costs: { coin: 8, timber: 3 } },
  { id: "shed", name: "防风堆肥棚", description: "给田边的堆肥箱加盖。建好后，每天可领取 2 份堆肥。",
    costs: { coin: 12, timber: 4, compost: 1 } },
  { id: "expansion", name: "西岸扩岛计划", description: "搭起栈道，添一片西岸沙洲。新土地上有两块田和一座可养鸡鸭的畜舍。",
    costs: { coin: 160, timber: 7, shell: 2 } },
  { id: "coop-expansion", name: "西岸畜舍扩建", description: "增建围栏和幼崽活动区，将饲养位从 4 个增至 8 个，并开放鸡鸭繁殖。",
    costs: { coin: 32, timber: 4 } },
  ...coastalProjects
];

function readIslandLife(data, inventory, currentDay) {
  const source = data.life;
  const discovered = Array.isArray(source?.ingredients) ? source.ingredients : [];
  const ingredients = recipeIngredients.filter(id => inventory[id] || data.catches?.[id] > 0 || discovered.includes(id));
  if (inventory.soup) for (const id of ["coconut", "fish"]) if (!ingredients.includes(id)) ingredients.push(id);
  const diary = {};
  for (const [day, text] of Object.entries(source?.diary ?? {})) {
    if (/^(0|[1-9][0-9]*)$/.test(day) && Number(day) <= currentDay && typeof text === "string" && text.trim()) {
      diary[day] = text.slice(0, 1200);
    }
  }
  const commissions = {};
  for (const [id, resident] of Object.entries(residents)) {
    const entry = source?.commissions?.[id];
    if (entry) commissions[id] = {
      done: entry.done === true,
      progress: Number.isSafeInteger(entry.progress) ? Math.max(0, Math.min(resident.count, entry.progress)) : 0
    };
  }
  const built = islandProjects.filter(project => Array.isArray(source?.built) && source.built.includes(project.id)).map(project => project.id);
  const benchDay = source?.benchDay;
  const expanded = built.includes("expansion");
  const permitted = expanded || source?.expansion?.permitted === true;
  const debt = source?.expansion?.debt;
  const expansion = {
    referred: permitted || source?.expansion?.referred === true || data.area === "qishi",
    permitted,
    debt: expanded && Number.isSafeInteger(debt) && debt > 0 ?
      Math.min(debt, expansionLoanLimit + Math.ceil(expansionLoanLimit * expansionLoanRate)) : 0
  };
  const residentOffers = readRandomCommissions(source?.residentOffers, currentDay);
  const residentBacklog = readCommissionBacklog(source?.residentBacklog, currentDay, residentOffers);
  const helpedResident = source?.helpedResident === true || Object.values(commissions).some(entry => entry.done) ||
    Object.keys(residents).some(id => residentOffers[id]?.state === "done");
  const coop = readCoop(expanded ? source?.coop : null, currentDay, coopCapacity(built.includes("coop-expansion")));
  const ventures = readVentures(source?.ventures, built, currentDay, inventory, coop);
  const survey = readSurvey(source?.survey, { commissions, residentOffers }, currentDay);
  return {
    ingredients, diary, commissions, residentOffers, residentBacklog, helpedResident, built, expansion, coop, ventures, survey,
    benchDay: Number.isSafeInteger(benchDay) && benchDay <= currentDay ? benchDay : -1
  };
}

const starterTasks = [
  { id: "first-fruit", metric: "fruit", goal: 1, title: "岛上的第一餐", detail: "采到一份水果。", reward: { coin: 2 } },
  { id: "first-fish", metric: "fish", goal: 1, title: "浮标动了", detail: "在栈桥钓到一条鱼。", reward: { coin: 3 } },
  { id: "first-mail", metric: "mail", goal: 1, title: "寄往对岸", detail: "托海鸥寄出一封信。", reward: { coin: 2, fruit: 1 } },
  { id: "first-field", metric: "harvest", goal: 2, title: "自己的第一茬", detail: "在田里收获至少 2 份作物。", reward: { coin: 3, compost: 1 } },
  { id: "first-meal", metric: "cook", goal: 1, title: "灶上的晚饭", detail: "在木屋做出一道菜。", reward: { coin: 3, coconut: 1 } },
  { id: "first-landing", metric: "visited", goal: 1, title: "第一次离岸", detail: "坐船登上一座外岛。", reward: { coin: 3, soup: 1 } },
  { id: "first-sale", metric: "trade", goal: 1, title: "岛上的第一笔生意", detail: "向岛上的商人卖出一件物品。", reward: { coin: 2 } },
  { id: "four-fish", metric: "species", goal: 4, title: "四种鱼的名字", detail: "在鱼类图鉴里记录 4 种亲手钓到的鱼。", reward: { coin: 6, soup: 1 } },
  { id: "four-islands", metric: "visited", goal: 4, title: "走遍群岛", detail: "登上任意 4 座外岛。", reward: { coin: 8, compost: 2 } }
];
const dailyGather = { id: "daily-gather", metric: "gather", goal: 2, title: "捡一捡，摘一摘",
  detail: "采到 2 份水果、海藻或古贝。", reward: { coin: 2 } };
const dailyFish = { id: "daily-fish", metric: "fish", goal: 1, title: "今天的一竿",
  detail: "钓到 1 条鱼。", reward: { coin: 2, fruit: 1 } };
const dailyRotation = [
  { id: "daily-farm", metric: "farm", goal: 2, title: "照料田地", detail: "完成 2 次田间操作。", reward: { coin: 1, compost: 1 } },
  { id: "daily-mail", metric: "mail", goal: 1, title: "给对岸写信", detail: "寄出一封信。", reward: { coin: 2 } },
  { id: "daily-compost", metric: "compost", goal: 1, title: "给土地备肥", detail: "从堆肥箱取一份堆肥。", reward: { coin: 2 } },
  { id: "daily-meal", metric: "cook", goal: 1, title: "做点热的", detail: "做出一道菜。", reward: { coin: 3 } },
  { id: "daily-sale", metric: "trade", goal: 1, title: "卖掉富余的物品", detail: "向商人卖出一件物品。", reward: { coin: 2 } }
];
const questMetrics = ["fruit", "fish", "mail", "harvest", "cook", "trade", "farm", "gather", "compost"];

function dailyTasks(day) { return [dailyGather, dailyFish, dailyRotation[day % dailyRotation.length]]; }
function emptyDaily(day) { return { day, counts: {}, claimed: [] }; }

function readQuestBook(data, day) {
  const raw = data.quests;
  const number = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const counts = source => Object.fromEntries(questMetrics.map(id => [id, number(source?.[id])]));
  const formerSessions = Array.isArray(data.sessions) ? data.sessions : [];
  const oldCount = field => formerSessions.reduce((total, session) => total + number(session?.[field]), 0);
  const canKeepDaily = Number.isSafeInteger(raw?.daily?.day) && raw.daily.day >= 0 && raw.daily.day <= day;
  const claimed = (values, allowed) => Array.isArray(values) ? [...new Set(values.filter(id => allowed.some(task => task.id === id)))] : [];
  const visited = new Set(Array.isArray(raw?.visited) ? raw.visited.filter(id => Object.hasOwn(Archipelago.routes, id)) : []);
  if (Object.hasOwn(Archipelago.routes, data.area)) visited.add(data.area);
  const backlog = new Map();
  if (Array.isArray(raw?.backlog)) for (const entry of raw.backlog) {
    if (Number.isSafeInteger(entry?.day) && entry.day >= 0 && entry.day < day &&
        dailyTasks(entry.day).some(task => task.id === entry.id)) {
      backlog.set(`${entry.day}:${entry.id}`, { day: entry.day, id: entry.id });
    }
  }
  return {
    counts: raw ? counts(raw.counts) : { harvest: oldCount("crops"), cook: Math.max(oldCount("meals"), number(data.inventory?.soup)) },
    claimed: claimed(raw?.claimed, starterTasks),
    visited: [...visited],
    daily: canKeepDaily ? {
      day: raw.daily.day, counts: counts(raw.daily.counts), claimed: claimed(raw.daily.claimed, dailyTasks(raw.daily.day))
    } : emptyDaily(day),
    backlog: [...backlog.values()]
  };
}

const areaOffshore = makeOffshore();
const areas = { island: Island, cabin: Cabin, offshore: areaOffshore, ...Archipelago.maps };
const islandSpots = [...Island.spots, ...Object.values(Archipelago.maps).flatMap(map => map.spots)];
const compostSpot = Island.spots.find(spot => spot.type === "compost");
const postSpot = Island.spots.find(spot => spot.type === "post");
const harborSpot = Island.spots.find(spot => spot.type === "harbor");
const saved = load();
const area = () => areas[saved.area];
const player = { ...start, ...saved.position, walking: false, gender: saved.profile?.gender || "" };
let arrivalInProgress = saved.name === null;
let resetting = false;
let resetCutscene = null;
let chosenRecipient = null;
let destinationAfterExit = null;
let destinationAfterEntry = null;
let activeSession = null;
let farmPlot = 0;
let marketSpot = null;

let route = [];
let routedSpot = null;
let retriedRoute = false;
let active = null;
let readyResidentSpot = null;
let hovered = null;
let fishing = null;
let birdFlight = null;
let elapsed = 0;
let lastFrame = 0;
let lastSave = 0;
let uiDirty = true;
let previousMinute = -1;
let toastTimer;
let audio = null;
let soundOn = false;
let autoSave = true;
let activity = null;
let deepSeekReady = false;
let residentDialogueReady = false;
let mailRequest = null;
let mailboxQuietUntil = 0;
let familyRequest = null;
const publicRelease = document.documentElement.dataset.release === "public";
const serverMode = location.protocol === "http:" || location.protocol === "https:";
let postOfficeInitialized = !serverMode;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function initialIsland() {
  const initial = {
    minutes: 430, seasonOffset: 0, quests: readQuestBook({}, 0),
    inventory: { ...Object.fromEntries(Object.keys(items).map(id => [id, 0])), coin: 8 },
    name: null, islandId: crypto.randomUUID(), profile: null, sessions: [], stamina: 100, catches: {}, catchPlaces: {}, plots: Array(Island.plotCount).fill(null), lastQuake: -1, lastStorm: -1, lastMarket: -1, lastSeason: 0, alerts: [], familyNext: null, familyCount: 0, familyPending: null, picked: {},
    area: "island", fruitCollected: false, fishCaught: false, sent: 0, letters: [], pending: null, position: start
  };
  initial.life = readIslandLife({}, initial.inventory, 0);
  initial.progress = readIslandProgress(initial, initial);
  return initial;
}

function readIslandProgress(data, state) {
  const { quests, life, letters, catches, inventory, plots } = state;
  const older = data.progress;
  const authors = new Set(letters.map(letterAuthor));
  const recorded = Array.isArray(older?.correspondents) ? older.correspondents : [];
  const correspondents = contacts.filter(contact => authors.has(contact.id) || recorded.includes(contact.id)).map(contact => contact.id);
  const routes = new Set(quests.visited);
  if (life.commissions.headland) routes.add("tidal");
  if (life.survey.fisherTasks >= 10) routes.add("research");
  if (Array.isArray(older?.routes)) {
    for (const id of older.routes) if (Object.hasOwn(Archipelago.routes, id)) routes.add(id);
  } else {
    for (const letter of letters) {
      const route = invitationRoutes[letterAuthor(letter)];
      if (letter.kind !== "intro" && letter.kind !== "construction" && route) routes.add(route);
    }
    if (life.expansion.referred) routes.add("qishi");
  }
  const visitedResident = quests.visited.some(id => Object.hasOwn(residents, id) || id === "qishi");
  const fishing = older?.fishing === true || routes.has("headland") ||
    (!older && (data.fishCaught || quests.counts.fish > 0 || Object.values(catches).some(Boolean) || species.some(fish => inventory[fish.id] > 0)));
  const farming = older?.farming === true || routes.has("windbell") || life.built.includes("shed") || life.built.includes("expansion") ||
    (!older && (plots.some(Boolean) || quests.counts.farm > 0 || quests.counts.harvest > 0 ||
      Object.keys(cultivars).some(id => inventory[id] > 0)));
  const cooking = older?.cooking === true || authors.has(4) ||
    (!older && (quests.counts.cook > 0 || recipes.some(recipe => inventory[recipe.id] > 0)));
  const building = older?.building === true || visitedResident || life.built.length > 0 || life.helpedResident || life.expansion.referred;
  const firstSale = older?.firstSale === true || (!older && quests.counts.trade > 0);
  const post = older?.post === true || Number(data.sent) > 0 || Boolean(state.pending || state.familyPending) ||
    letters.length > 0 || routes.size > 0 || fishing || farming || cooking || building;
  const firstLetterAt = Number.isFinite(older?.firstLetterAt) && older.firstLetterAt >= 0 ? older.firstLetterAt : null;
  return { post, firstSale, fishing: Boolean(fishing), farming: Boolean(farming), cooking, building, routes: [...routes], correspondents, firstLetterAt };
}

function load() {
  const initial = initialIsland();
  try {
    const restarted = localStorage.getItem(restartStorageKey);
    if (restarted !== null) activeStorageKey = restartStorageKey;
    const data = JSON.parse(restarted ?? localStorage.getItem(storageKey));
    if (!data || !Number.isFinite(data.minutes) || data.minutes < 0) return initial;
    const number = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
    // Keep the old season and its day number when moving from 7-day seasons to 14.
    const seasonOffset = Number.isSafeInteger(data.seasonOffset) && data.seasonOffset >= 0
      ? data.seasonOffset
      : Math.floor(data.minutes / (1440 * 7)) * (seasonLength - 7);
    const inventory = Object.fromEntries(Object.entries(initial.inventory).map(([id, value]) => [
      id, data.inventory?.[id] === undefined ? value : number(data.inventory[id])
    ]));
    const hasCatchLog = data.catches && typeof data.catches === "object";
    const catches = Object.fromEntries(species.map(({ id }) => [id, hasCatchLog
      ? number(data.catches[id])
      : id === "fish" && (data.fishCaught || inventory.fish || inventory.soup) ? Math.max(1, inventory.fish) : 0
    ]));
    const plots = initial.plots.map((_, index) => {
      const plot = data.plots?.[index];
      if (!plot) return null;
      const planted = Number.isSafeInteger(plot.planted) ? plot.planted : null;
      if (planted === null && !plot.tilled) return null;
      const watered = Number.isSafeInteger(plot.watered) ? plot.watered : null;
      return {
        tilled: true, planted, watered, crop: Object.hasOwn(cultivars, plot.crop) ? plot.crop : "crop", fertilized: Boolean(plot.fertilized), pest: Boolean(plot.pest),
        pestChecked: Boolean(plot.pestChecked),
        growth: Number.isSafeInteger(plot.growth) ? Math.max(0, Math.min(2, plot.growth)) : Number(watered !== null),
        lastDay: Number.isSafeInteger(plot.lastDay) ? plot.lastDay : watered ?? planted ?? Math.floor(data.minutes / 1440)
      };
    });
    const life = readIslandLife(data, inventory, Math.floor(data.minutes / 1440));
    const canResume = life.ventures.trip?.state === "sailing" || life.ventures.race?.state === "active";
    const map = Object.hasOwn(areas, data.area) && (data.area !== "offshore" || canResume) ? data.area : "island";
    const position = data.position;
    const validPosition = position && areas[map].walkable(position.x, position.y, life.built) && ["up", "down", "left", "right"].includes(position.facing);
    const validLetter = item => item && typeof item.message === "string" && Number.isSafeInteger(item.reply) && letterRecipient(item.reply);
    const validFamily = item => item?.kind === "family" && Object.hasOwn(family, item.author) &&
      Number.isFinite(item.arrives) && typeof item.text === "string";
    const validIntroduction = item => item?.kind === "intro" && Number.isInteger(item.reply) &&
      Object.hasOwn(introductions, item.reply) && Number.isFinite(item.arrives) && typeof item.text === "string";
    const validConstruction = item => item?.kind === "construction" && item.reply === 7 &&
      Number.isFinite(item.arrives) && typeof item.text === "string";
    const state = {
      minutes: data.minutes, seasonOffset, inventory, area: map, plots, life,
      quests: readQuestBook(data, Math.floor(data.minutes / 1440)),
      familyCount: number(data.familyCount),
      familyPending: validFamily(data.familyPending) ? data.familyPending : null,
      familyNext: Number.isFinite(data.familyNext) ? data.familyNext : null,
      islandId: typeof data.islandId === "string" && islandIdPattern.test(data.islandId) ? data.islandId : initial.islandId,
      profile: data.profile && typeof data.profile.name === "string" && isFlatDate(data.profile.birthday) ? {
        name: data.profile.name.slice(0, 16), birthday: data.profile.birthday,
        gender: ["female", "male", "other"].includes(data.profile.gender) ? data.profile.gender : ""
      } : null,
      sessions: Array.isArray(data.sessions) ? data.sessions.filter(record => record && Number.isFinite(record.started) &&
        Number.isFinite(record.seconds) && typeof record.device === "string") : [],
      name: data.name === null ? null : (typeof data.name === "string" && data.name.trim().slice(0, 14)) || "无名岛",
      catches, catchPlaces: readCatchPlaces(data.catchPlaces),
      stamina: Number.isFinite(data.stamina) ? Math.max(0, Math.min(100, data.stamina)) : 100,
      lastQuake: Number.isSafeInteger(data.lastQuake) ? data.lastQuake : -1,
      lastStorm: Number.isSafeInteger(data.lastStorm) ? data.lastStorm : -1,
      lastMarket: Number.isSafeInteger(data.lastMarket) ? data.lastMarket : -1,
      lastSeason: Number.isSafeInteger(data.lastSeason) ? data.lastSeason : seasonSerial(data.minutes, seasonOffset),
      alerts: Array.isArray(data.alerts) ? data.alerts.filter(alert => alert && typeof alert.title === "string" &&
        typeof alert.message === "string" && Number.isFinite(alert.at)).slice(0, 24) : [],
      fruitCollected: Boolean(data.fruitCollected || inventory.coconut || inventory.fruit || inventory.soup),
      fishCaught: Boolean(data.fishCaught || Object.values(catches).some(Boolean)),
      picked: Object.fromEntries(islandSpots.filter(spot => Number.isSafeInteger(data.picked?.[spot.id]))
        .map(spot => [spot.id, data.picked[spot.id]])),
      position: validPosition ? position : map === "cabin" ? Cabin.entrance : areas[map].arrival ?? start, sent: number(data.sent),
      letters: Array.isArray(data.letters) ? data.letters.filter(item =>
        validLetter(item) || validFamily(item) || validIntroduction(item) || validConstruction(item)).slice(0, 24) : [],
      pending: validLetter(data.pending) && Number.isFinite(data.pending.arrives) ? data.pending : null
    };
    state.progress = readIslandProgress(data, state);
    return state;
  } catch {
    return initial;
  }
}

function islandChangedInStorage() {
  const restarted = localStorage.getItem(restartStorageKey);
  if (activeStorageKey === storageKey && restarted !== null) return true;
  try {
    const other = JSON.parse(activeStorageKey === restartStorageKey ? restarted : localStorage.getItem(storageKey));
    return Number.isFinite(other?.minutes) && other.minutes >= 0 && typeof other.islandId === "string" &&
      islandIdPattern.test(other.islandId) && other.islandId !== saved.islandId;
  } catch {
    return false;
  }
}

function reloadIsland() {
  resetting = true;
  location.reload();
}

function save() {
  if (resetting) return;
  openPostAfterTrading();
  discoverIngredients();
  if (!autoSave) return;
  try {
    if (islandChangedInStorage()) {
      reloadIsland();
      return;
    }
    if (activeSession) {
      activeSession.updated = Date.now();
      activeSession.day = dayIndex() + 1;
    }
    saved.position = { x: player.x, y: player.y, facing: player.facing };
    localStorage.setItem(activeStorageKey, JSON.stringify(saved));
  } catch {
    autoSave = false;
    get("save-status").textContent = "当前浏览器无法保存进度";
  }
}

window.addEventListener("storage", event => {
  if (!resetting && (event.key === storageKey || event.key === restartStorageKey) && islandChangedInStorage()) reloadIsland();
});

function dayIndex() { return Math.floor(saved.minutes / 1440); }
function harvested(id) { return saved.picked[id] === dayIndex(); }
function compostReady() { return !harvested(compostSpot.id); }

function collectCompost() {
  if (!compostReady()) {
    notify("今天的堆肥已经领完了，明天会补上。");
    return;
  }
  saved.picked[compostSpot.id] = dayIndex();
  const collected = built("shed") ? 2 : 1;
  saved.inventory.compost += collected;
  recordQuest("compost");
  notify(`在田边取到 ${collected} 份堆肥。`);
  chime(620);
  uiDirty = true;
  save();
}

function weatherAtTime(minutes = saved.minutes) {
  const day = Math.floor(minutes / 1440);
  const hour = (minutes % 1440) / 60;
  if (day % 8 === 3 && hour >= 12 && hour < 18) return "storm";
  const pattern = ["clear", "clear", "rain", "cloud", "cloud", "rain", "clear", "cloud"];
  const weather = pattern[(day * 3 + Math.floor(hour / 6)) % pattern.length];
  return seasonAt(minutes).id === "winter" && weather === "rain" ? "snow" : weather;
}

const marketDay = () => (dayIndex() + 1) % 7 === 0;
const quakeBeach = () => dayIndex() % 9 === 4 && saved.minutes % 1440 >= 720;
const daysToMarket = () => 7 - (dayIndex() + 1) % 7;
const hasRoute = id => saved.progress.routes.includes(id);

function openPostAfterTrading() {
  const { progress } = saved;
  if (progress.post || !progress.firstSale || saved.inventory.coin < postCoinGoal) return;
  progress.post = true;
  progress.firstLetterAt = saved.minutes + firstLetterDelay;
  addAlert("海鸟邮局启用", "行商把邮袋留在栈桥。收到谁的来信，就能给谁回信。");
}

function spotVisible(spot) {
  const { progress } = saved;
  if ((spot.type === "post" || spot.type === "desk") && !progress.post) return false;
  if (spot.type === "fish" && !progress.fishing) return false;
  if ((spot.type === "farm" || spot.type === "compost") && !progress.farming) return false;
  if (spot.type === "cook" && !progress.cooking) return false;
  if ((spot.type === "shell" || spot.type === "timber") && saved.area === "island" && !progress.building) return false;
  if (spot.type === "harbor" && !Archipelago.routes[saved.area] && !progress.routes.length) return false;
  if (spot.project && !built(spot.project)) return false;
  if (spot.type === "trade") return marketDay();
  if (spot.type === "shell") return quakeBeach() && !harvested(spot.id);
  if (spot.type === "compost") return true;
  if (spot.type === "crab-trap") return hasCrabTrap();
  return !harvested(spot.id);
}

function cropStage(index) {
  const plot = saved.plots[index];
  if (!plot) return "empty";
  if (plot.planted === null) return "tilled";
  if (plot.growth >= 2) return "ripe";
  if (plot.pest) return "pest";
  if (plot.growth === 1) return plot.watered === dayIndex() ? "leafy-wet" : "leafy";
  return plot.watered === dayIndex() ? "watered" : "dry";
}

function cropForPlot(index) {
  const plot = saved.plots[index];
  return plot?.planted != null ? plot.crop : seasonAt(saved.minutes).crop;
}

function spotLabel(spot) {
  if (spot.type === "farm") {
    const name = cultivars[cropForPlot(spot.plot)].name;
    return { empty: "开垦田地", tilled: `播种${name}`, dry: `照料${name}`, watered: "查看幼苗",
      leafy: "照料作物", "leafy-wet": "查看作物", pest: "给作物捉虫", ripe: `收获${name}` }[cropStage(spot.plot)];
  }
  if (spot.type === "fish" && weatherAtTime() === "storm") return "飓风停钓";
  if (spot.type === "compost" && compostReady()) return "领取堆肥";
  if (spot.type === "crab-trap") {
    const day = saved.life.survey.trapDay;
    return day === null ? "放下蟹笼" : day < dayIndex() ? "收蟹笼" : "查看蟹笼";
  }
  if (spot === readyResidentSpot) return `交付委托 · ${residentTaskContact()}`;
  return spot.label;
}

function spend(cost) {
  if (saved.stamina < cost) {
    notify("体力不足。吃点东西，或回木屋睡一觉。");
    return false;
  }
  saved.stamina -= cost;
  uiDirty = true;
  return true;
}

const fieldActions = {
  till: { label: "开垦", cost: 4 },
  plant: { label: "播种", cost: 3 },
  water: { label: "浇水", cost: 4 },
  feed: { label: "施肥", cost: 2 },
  pest: { label: "捉虫", cost: 3 },
  harvest: { label: "收获", cost: 3 }
};

function workablePlot(index) {
  const plot = saved.plots[index];
  if (!plot) return ["till"];
  if (plot.planted === null) return ["plant"];
  if (plot.growth >= 2) return ["harvest"];
  const options = [];
  if (plot.watered !== dayIndex()) options.push("water");
  if (!plot.fertilized) options.push("feed");
  if (plot.pest) options.push("pest");
  return options;
}

function fieldUnavailable(action) {
  if (action === "plant") {
    const { seed, name } = cultivars[cropForPlot(farmPlot)];
    if (!saved.inventory[seed]) return `缺少${name}种子`;
  }
  if (action === "feed" && !saved.inventory.compost) return "缺少堆肥";
  if (saved.stamina < fieldActions[action].cost) return "体力不足";
  return "";
}

function fillFarm() {
  const stage = cropStage(farmPlot);
  const plot = saved.plots[farmPlot];
  const { name } = cultivars[cropForPlot(farmPlot)];
  const label = {
    empty: "荒地 · 先松土开垦。", tilled: `松过土了 · 可以播种${name}。`,
    dry: "刚发芽 · 土有些干。", watered: "刚发芽 · 今天已经浇过水。",
    leafy: "叶子长大了 · 再照料一天。", "leafy-wet": "叶子长大了 · 今天的土还湿着。",
    pest: "叶背有虫 · 清理后才能继续生长。", ripe: `${name}成熟了 · 可以收获。`
  }[stage];
  get("farm-title").textContent = plot?.planted != null ? `${name}田 ${farmPlot + 1}` : `田地 ${farmPlot + 1}`;
  const season = seasonAt(saved.minutes);
  const seasonDay = calendarDay(saved.minutes) % seasonLength + 1;
  get("farm-season").textContent = `${season.name}第 ${seasonDay} / ${seasonLength} 天，适种${cultivars[season.crop].name}。作物可以跨季收成。`;
  get("farm-status").textContent = label + (plot?.fertilized ? " 已施肥。" : "");
  const actions = get("farm-actions");
  actions.replaceChildren();
  const available = workablePlot(farmPlot);
  const needsCompost = !saved.inventory.compost && available.includes("feed");
  get("farm-compost").hidden = !needsCompost || !compostReady();
  get("farm-compost-empty").hidden = !needsCompost || compostReady();
  for (const action of available) {
    const button = document.createElement("button");
    const { label, cost } = fieldActions[action];
    const reason = fieldUnavailable(action);
    button.type = "button";
    button.className = "action";
    button.textContent = reason ? `${label} · ${reason}` : `${label} · 体力 ${cost}`;
    button.disabled = Boolean(reason);
    button.addEventListener("click", () => workField(action));
    actions.append(button);
  }
}

function workField(action) {
  if (!farmDialog.open || !workablePlot(farmPlot).includes(action) || fieldUnavailable(action) || !spend(fieldActions[action].cost)) return;
  const day = dayIndex();
  const plot = saved.plots[farmPlot];
  let message;
  if (action === "till") {
    saved.plots[farmPlot] = { tilled: true, planted: null, watered: null, fertilized: false, pest: false, pestChecked: false, growth: 0, lastDay: day };
    message = "松开了泥土，下一步可以播种。";
  } else if (action === "plant") {
    plot.crop = cropForPlot(farmPlot);
    saved.inventory[cultivars[plot.crop].seed]--;
    plot.planted = day;
    plot.lastDay = day;
    const wet = ["rain", "storm"].includes(weatherAtTime());
    plot.watered = wet ? day : null;
    message = wet ? "种子埋好了，雨水已经打湿泥土。" : "种子埋好了，浇水后才会生长。";
  } else if (action === "water") {
    plot.watered = day;
    message = "浇透了。今天可以先让它慢慢长。";
  } else if (action === "feed") {
    saved.inventory.compost--;
    plot.fertilized = true;
    message = "拌进了一份堆肥。浇过水后它会长得更快，收成也更多。";
  } else if (action === "pest") {
    plot.pest = false;
    message = "摘掉了叶背的小虫。新叶可以继续长了。";
  } else {
    const yieldCount = plot.fertilized ? 3 : 2;
    const { name, seed } = cultivars[plot.crop];
    saved.inventory[plot.crop] += yieldCount;
    saved.inventory[seed]++;
    saved.plots[farmPlot] = { tilled: true, planted: null, watered: null, fertilized: false, pest: false, pestChecked: false, growth: 0, lastDay: day };
    recordPlay("crops", yieldCount);
    recordQuest("harvest", yieldCount);
    if (farmPlot >= 3) saved.life.ventures.hadWestHarvest = true;
    message = `收获 ${yieldCount} 个${name}，留下一颗种子。`;
  }
  recordQuest("farm");
  if (action === "water") trackResidentProgress("water", 1);
  get("farm-note").textContent = message;
  fillFarm();
  chime(action === "harvest" ? 670 : 370);
  uiDirty = true;
  save();
}

function updatePlots(weather, day) {
  let changed = false;
  for (const [index, plot] of saved.plots.entries()) {
    if (!plot || plot.planted === null || plot.growth >= 2) continue;
    if (plot.lastDay < day) {
      if (plot.watered === plot.lastDay && !plot.pest) {
        plot.growth = Math.min(2, plot.growth + (plot.fertilized ? 2 : 1));
        if (plot.growth === 1 && !plot.pestChecked) {
          plot.pestChecked = true;
          plot.pest = index === 1 || (day + index) % 3 === 0;
        }
      }
      plot.lastDay = day;
      changed = true;
    }
    if (plot.growth < 2 && ["rain", "storm"].includes(weather) && plot.watered !== day) {
      plot.watered = day;
      changed = true;
    }
  }
  if (changed) save();
}

get("close-farm").addEventListener("click", () => farmDialog.close());
get("farm-compost").addEventListener("click", () => {
  farmDialog.close();
  goToIslandSpot(compostSpot);
});
get("walk-compost").addEventListener("click", () => goToIslandSpot(compostSpot));

function updateIsland() {
  if (refreshQuestDay()) save();
  const weather = weatherAtTime();
  const day = dayIndex();
  const currentSeason = seasonSerial(saved.minutes);
  if (currentSeason !== saved.lastSeason) {
    saved.lastSeason = currentSeason;
    const season = seasonAt(saved.minutes);
    addAlert(`${season.name}到了`, `${season.note} 这一季可以播种${cultivars[season.crop].name}。`);
    save();
  }
  if (weather === "storm" && saved.lastStorm !== day) {
    saved.lastStorm = day;
    addAlert("飓风过岛", "风浪太大，栈桥暂停钓鱼。18:00 后可以再去。");
    save();
  }
  updatePlots(weather, day);
  settleLivestock(day);
  if (marketDay() && saved.lastMarket !== day) {
    saved.lastMarket = day;
    const marketNote = saved.progress.farming ? "今天可以到东南侧的摊位买种子、卖收成。" : "今天可以到东南侧的摊位卖水果。";
    addAlert("小贩登岛了", marketNote);
    save();
  }
  if (saved.progress.building && quakeBeach() && saved.lastQuake !== day) {
    saved.lastQuake = day;
    canvas.classList.add("quake");
    setTimeout(() => canvas.classList.remove("quake"), 650);
    addAlert("岛上发生地震", "西边海滩露出了一枚古贝。");
    save();
  }
}

function notify(message) {
  const toast = get("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3250);
}

function addAlert(title, message, letterAt = null) {
  saved.alerts.unshift({ title, message, at: saved.minutes, unread: true, letterAt });
  saved.alerts.length = Math.min(24, saved.alerts.length);
  notify(message);
  if (alertsDialog.open) fillAlerts();
  uiDirty = true;
}

function alertTime(minutes) {
  const day = Math.floor(minutes / 1440) + 1;
  const hour = String(Math.floor(minutes % 1440 / 60)).padStart(2, "0");
  const minute = String(Math.floor(minutes % 60)).padStart(2, "0");
  return `第 ${day} 天 ${hour}:${minute}`;
}

function fillAlerts() {
  const list = get("alert-list");
  list.replaceChildren();
  get("alerts-empty").hidden = saved.alerts.length > 0;
  const unread = saved.alerts.filter(alert => alert.unread).length;
  get("alerts-unread").textContent = unread ? `${unread} 条未读` : "暂无未读";
  get("read-alerts").disabled = !unread;
  for (const alert of saved.alerts) {
    const row = document.createElement("li");
    row.classList.toggle("new-alert", alert.unread);
    const head = document.createElement("header");
    const label = document.createElement("strong");
    label.textContent = alert.unread ? `${alert.title} · 未读` : alert.title;
    const time = document.createElement("span");
    time.textContent = alertTime(alert.at);
    head.append(label, time);
    const detail = document.createElement("p");
    detail.textContent = alert.message;
    row.append(head, detail);
    const letter = saved.letters.find(item => item.arrives === alert.letterAt);
    if (letter || alert.unread) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "setup-link";
      button.textContent = letter ? "查看这封信" : "标为已读";
      button.addEventListener("click", () => {
        alert.unread = false;
        uiDirty = true;
        save();
        if (letter) {
          alertsDialog.close();
          openLetters(false, false, letter.arrives);
        } else {
          fillAlerts();
        }
      });
      row.append(button);
    }
    list.append(row);
  }
}

get("open-alerts").addEventListener("click", () => {
  if (activity || fishing || dialogOpen()) return;
  keys.clear();
  fillAlerts();
  alertsDialog.showModal();
});
get("close-alerts").addEventListener("click", () => alertsDialog.close());
get("read-alerts").addEventListener("click", () => {
  for (const alert of saved.alerts) alert.unread = false;
  fillAlerts();
  uiDirty = true;
  save();
});

const gridSize = 3;
const cols = Math.ceil(Island.W / gridSize);
const rows = Math.ceil(Island.H / gridSize);
const cellPoint = cell => ({ x: (cell % cols) * gridSize, y: Math.floor(cell / cols) * gridSize });
function makeGrid(map) {
  return Uint8Array.from({ length: cols * rows }, (_, cell) => {
    const { x, y } = cellPoint(cell);
    return Number(map.walkable(x, y, saved.life.built));
  });
}
const grids = Object.fromEntries(Object.entries(areas).map(([name, map]) => [name, makeGrid(map)]));
const canWalk = (x, y) => area().walkable(x, y, saved.life.built);
const distanceTo = spot => Math.hypot(player.x - spot.x, player.y - spot.y);

function closestCell(x, y) {
  const grid = grids[saved.area];
  let best = -1;
  let distance = Infinity;
  const col = Math.round(x / gridSize);
  const row = Math.round(y / gridSize);
  for (let j = Math.max(0, row - 3); j <= Math.min(rows - 1, row + 3); j++) {
    for (let i = Math.max(0, col - 3); i <= Math.min(cols - 1, col + 3); i++) {
      const cell = j * cols + i;
      if (!grid[cell]) continue;
      const delta = Math.hypot(x - i * gridSize, y - j * gridSize);
      if (delta < distance) {
        best = cell;
        distance = delta;
      }
    }
  }
  return best;
}

function straight(from, to) {
  const count = Math.max(1, Math.ceil(Math.hypot(from.x - to.x, from.y - to.y) / 2));
  for (let i = 1; i <= count; i++) {
    if (!canWalk(from.x + (to.x - from.x) * i / count, from.y + (to.y - from.y) * i / count)) return false;
  }
  return true;
}

function trace(to) {
  const grid = grids[saved.area];
  if (straight(player, to)) return [to];
  const origin = closestCell(player.x, player.y);
  const end = closestCell(to.x, to.y);
  if (origin < 0 || end < 0) return [];
  const visited = new Int32Array(grid.length).fill(-1);
  const queue = [origin];
  visited[origin] = origin;
  for (let cursor = 0; cursor < queue.length && visited[end] === -1; cursor++) {
    const cell = queue[cursor];
    const col = cell % cols;
    for (const neighbor of [col > 0 ? cell - 1 : -1, col < cols - 1 ? cell + 1 : -1, cell - cols, cell + cols]) {
      if (grid[neighbor] && visited[neighbor] === -1) {
        visited[neighbor] = cell;
        queue.push(neighbor);
      }
    }
  }
  if (visited[end] < 0) return [];
  const path = [];
  for (let cell = end; cell !== origin; cell = visited[cell]) path.push(cellPoint(cell));
  path.push(cellPoint(origin));
  path.reverse();
  if (straight(path[path.length - 1], to)) path.push(to);
  let from = player;
  const simplified = [];
  for (let i = 0; i < path.length; i++) {
    while (i + 1 < path.length && straight(from, path[i + 1])) i++;
    from = path[i];
    simplified.push(from);
  }
  return simplified;
}

function visit(point, spot = null) {
  if (fishing || activity || dialogOpen()) return;
  if (spot && distanceTo(spot) <= (spot.reach ?? reach)) {
    route = [];
    routedSpot = null;
    interact(spot);
    return;
  }
  if (!canWalk(point.x, point.y)) {
    const cell = closestCell(point.x, point.y);
    if (cell < 0) {
      route = [];
      routedSpot = null;
      return;
    }
    point = cellPoint(cell);
  }
  route = trace(point);
  routedSpot = route.length ? spot : null;
  retriedRoute = false;
}

function spotAt(x, y) {
  return area().spots.find(spot => x >= spot.left && x <= spot.right && y >= spot.top &&
    y <= (spot.bottom ?? spot.y + 4) && spotVisible(spot));
}

function pointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * Island.W / rect.width, y: (event.clientY - rect.top) * Island.H / rect.height };
}

canvas.addEventListener("pointermove", event => {
  if (event.pointerType === "touch") return;
  const { x, y } = pointerPoint(event);
  hovered = spotAt(x, y);
  canvas.style.cursor = hovered || fishing?.phase === "bite" || fishing?.phase === "fight" ? "pointer" : "crosshair";
});
canvas.addEventListener("pointerleave", () => { hovered = null; });
canvas.addEventListener("click", event => {
  if (fishing) {
    reel();
    return;
  }
  destinationAfterExit = null;
  const point = pointerPoint(event);
  const spot = spotAt(point.x, point.y);
  visit(spot || point, spot);
});

const movement = ["w", "a", "s", "d", "arrowleft", "arrowright", "arrowup", "arrowdown"];
window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  if (activity || dialogOpen() || event.altKey || event.ctrlKey || event.metaKey) return;
  if (movement.includes(key)) {
    event.preventDefault();
    route = [];
    routedSpot = null;
    destinationAfterExit = null;
    destinationAfterEntry = null;
    keys.add(key);
  }
  if (key === "e" && !event.repeat) {
    event.preventDefault();
    interact();
  }
});
window.addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("pagehide", save);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    lastFrame = 0;
    keys.clear();
    save();
  }
});

function move(dt) {
  player.walking = false;
  if (fishing || activity || dialogOpen()) return;
  const horizontal = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
  const vertical = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));
  const next = route[0];
  const dx = next ? next.x - player.x : horizontal;
  const dy = next ? next.y - player.y : vertical;
  const distance = Math.hypot(dx, dy);
  if (!distance && !next) return;
  const step = 82 * dt;
  if (next && distance <= step) {
    player.x = next.x;
    player.y = next.y;
    route.shift();
    if (!route.length && routedSpot) {
      const spot = routedSpot;
      routedSpot = null;
      interact(spot);
    }
    return;
  }
  const x = player.x + dx / distance * step;
  const y = player.y + dy / distance * step;
  if (canWalk(x, player.y)) {
    player.walking = x !== player.x;
    player.x = x;
  }
  if (canWalk(player.x, y)) {
    player.walking ||= y !== player.y;
    player.y = y;
  }
  if (!player.walking && next) {
    const alternative = retriedRoute ? [] : trace(route.at(-1));
    retriedRoute = true;
    route = alternative;
    if (!route.length) routedSpot = null;
  }
  player.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
}

function nearest() {
  let candidate = null;
  let best = reach;
  for (const spot of area().spots) {
    if (!spotVisible(spot)) continue;
    const distance = distanceTo(spot);
    if (distance <= (spot.reach ?? reach) && distance < best) {
      best = distance;
      candidate = spot;
    }
  }
  return candidate;
}

function interact(spot = nearest()) {
  if (activity || dialogOpen()) return;
  if (fishing) {
    reel();
    return;
  }
  if (!spot || !area().spots.includes(spot) || !spotVisible(spot) || distanceTo(spot) > (spot.reach ?? reach)) return;
  if (spot.type === "enter") {
    changeArea("cabin", Cabin.entrance);
    if (destinationAfterEntry) {
      const target = destinationAfterEntry;
      destinationAfterEntry = null;
      visit(target, target);
    }
  } else if (spot.type === "exit") {
    changeArea("island", { x: 219, y: 157, facing: "down" });
    if (destinationAfterExit) goToIslandSpot(destinationAfterExit);
  } else if (spot.type === "rest") {
    Object.assign(player, { x: spot.x, y: spot.y, facing: "up" });
    beginActivity("sleep", 3.2, "睡梦中，潮水还在涨落…");
    const tomorrow = (dayIndex() + 1) * 1440;
    activity.wake = tomorrow + seasonAt(tomorrow).dawn * 60;
  } else if (spot.type === "desk") {
    keys.clear();
    deskDialog.showModal();
  } else if (spot.type === "bench") {
    restOnBench();
  } else if (spot.type === "coop") {
    keys.clear();
    get("coop-note").textContent = "";
    fillCoop();
    coopDialog.showModal();
  } else if (spot.type === "timber") {
    saved.picked[spot.id] = dayIndex();
    saved.inventory.timber++;
    recordQuest("gather", 1, "timber");
    notify("捡到一根浮木 · +1");
    chime(600);
    uiDirty = true;
    save();
  } else if (spot.type === "cook") {
    keys.clear();
    updateRecipe();
    cookDialog.showModal();
  } else if (spot.type === "farm") {
    keys.clear();
    farmPlot = spot.plot;
    get("farm-note").textContent = "";
    fillFarm();
    farmDialog.showModal();
  } else if (spot.type === "resident-shop") {
    if (saved.area === "research") openResearch();
    else openResident(spot);
  } else if (spot.type === "crab-trap") {
    useCrabTrap();
  } else if (spot.type === "club") {
    openClub();
  } else if (spot.type === "restaurant") {
    openRestaurant();
  } else if (spot.type === "club-fish") {
    castFromBoat();
  } else if (spot.type === "trade") {
    openMarket(spot);
  } else if (spot.type === "harbor") {
    openSail();
  } else if (spot.type === "compost") {
    collectCompost();
  } else if (spot.type === "shell" || spot.type === "resource-shell") {
    saved.picked[spot.id] = dayIndex();
    saved.inventory.shell++;
    recordQuest("gather", 1, "shell");
    notify("捡到一枚古贝 · +1");
    uiDirty = true;
    save();
  } else if (spot.type === "seaweed") {
    saved.picked[spot.id] = dayIndex();
    saved.inventory.seaweed++;
    recordQuest("gather", 1, "seaweed");
    notify("在潮池边捡到海藻 · +1");
    chime(620);
    uiDirty = true;
    save();
  } else if (spot.type === "post") {
    openLetters(true);
  } else if (spot.type === "fish") {
    visitFishingSpot(spot);
  } else if (!harvested(spot.id)) {
    saved.picked[spot.id] = dayIndex();
    saved.inventory[spot.type]++;
    recordQuest("gather", 1, spot.type);
    saved.fruitCollected = true;
    notify(spot.type === "coconut" ? "摘到一个椰子 · +1" : spot.id === "drift-fruit" ? "潮水送来一颗海岛果 · +1" : "采到一颗海岛果 · +1");
    chime(620);
    uiDirty = true;
    save();
  }
}

function changeArea(name, position) {
  saved.area = name;
  Object.assign(player, position, { walking: false });
  keys.clear();
  route = [];
  routedSpot = null;
  hovered = null;
  active = null;
  canvas.style.cursor = "crosshair";
  uiDirty = true;
  save();
}

function beginActivity(kind, duration, message) {
  keys.clear();
  route = [];
  routedSpot = null;
  activity = { kind, start: elapsed, duration };
  get("activity").textContent = message;
  get("activity").hidden = false;
  uiDirty = true;
}

function activityProgress() {
  return activity ? Math.min(1, (elapsed - activity.start) / activity.duration) : 0;
}

function displayMinutes() {
  if (activity?.kind === "sail") return saved.minutes + activity.passage.minutes * activityProgress();
  if (activity?.kind !== "sleep") return saved.minutes;
  const progress = activityProgress();
  return saved.minutes + (activity.wake - saved.minutes) * (progress * progress * (3 - 2 * progress));
}

function updateActivity() {
  if (!activity || activityProgress() < 1) return;
  const finished = activity;
  activity = null;
  get("activity").hidden = true;
  if (finished.kind === "sleep") {
    saved.minutes = finished.wake;
    saved.stamina = 100;
    notify("睡到天亮。体力恢复了。");
  } else if (finished.kind === "sail") {
    finishVoyage(finished.passage);
    return;
  } else if (finished.kind === "club-sail") {
    finishClubSailing(finished.phase);
    return;
  } else if (finished.kind === "cook" || finished.kind === "restaurant-prep") {
    const { recipe, quantity = 1 } = finished;
    const preparing = finished.kind === "restaurant-prep";
    const stock = preparing ? saved.life.ventures.dining.stock : saved.inventory;
    const cooked = finishCooking(recipe, quantity, stock);
    const message = cooked ? `${items[recipe.id].name}做好了 · ${preparing ? "备菜 " : ""}+${quantity}` : "食材或体力不足，请检查备菜需求。";
    notify(message);
    if (cooked) chime(560);
    if (preparing) {
      openRestaurant();
      get("dining-feedback").textContent = message;
    }
  }
  uiDirty = true;
  save();
}

const extraFoodIds = [...Object.keys(cultivars).filter(id => id !== "crop"),
  ...species.slice(1).map(fish => fish.id), ...recipes.slice(1).map(recipe => recipe.id), "egg", "duck-egg"];
for (const id of extraFoodIds) {
  const button = document.createElement("button");
  button.className = "setup-link";
  button.type = "button";
  button.dataset.eat = id;
  button.dataset.extraFood = "";
  button.append(`${items[id].name} × `);
  const count = document.createElement("strong");
  count.id = `${id}-count`;
  button.append(count);
  get("species-stock").append(button);
}

const fishShapes = {
  shoal: ["M1 7h3v3h4V8h5V6h5v2h3v3h2v4h-3v2h-5v2H9v-2H4v3H1z", "M5 12h4v-2h12v4h-5v2H9v-2H5z"],
  reef: ["M1 7h3v3h3V8h3V5h3V3h5v3h3v3h2v8h-3v3h-3v2H9v-3H6v-4H4v3H1z", "M5 11h4V8h4V6h5v3h3v7h-3v3H9v-3H5z"],
  wing: ["M1 8h3v3h4V9h2V5h4V2h3v3h-1v4h4v2h3v5h-4v2h-3v3h-5v-3H6v-3H4v3H1z", "M5 12h5v-2h4V7h2v4h5v4h-5v3h-4v-3H5z"],
  flat: ["M1 8h3v3h4V9h3V7h7v2h3v2h2v6h-4v2H8v-2H5v-2H4v4H1z", "M5 12h5v-2h9v2h2v3h-3v2H9v-2H5z"]
};

function catalogIcon(fish, known) {
  const ns = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(ns, "svg");
  icon.setAttribute("aria-hidden", "true");
  if (known && fish.shape) {
    icon.setAttribute("viewBox", "0 0 24 24");
    const [outline, body] = fishShapes[fish.shape];
    for (const [path, color] of [
      [outline, fish.colors[0]], [body, fish.colors[1]], ["M8 12h5v1H8zm6 3h3v1h-3z", fish.colors[2]], ["M18 11h2v2h-2z", "#273b4c"]
    ]) {
      const layer = document.createElementNS(ns, "path");
      layer.setAttribute("d", path);
      layer.setAttribute("fill", color);
      icon.append(layer);
    }
  } else {
    const use = document.createElementNS(ns, "use");
    use.setAttribute("href", known ? `#i-${fish.id}` : "#i-fish");
    icon.append(use);
    if (!known) icon.classList.add("unknown-fish");
  }
  return icon;
}

function itemIcon(id) {
  const crab = crabs.find(entry => entry.id === id);
  const dishIcon = { "steamed-crab": "seaweed-fish", "crab-soup": "soup" }[id];
  const icon = crab ? crabIcon(crab) : catalogIcon(species.find(fish => fish.id === id) ?? { id: dishIcon ?? id }, true);
  icon.classList.add("item-glyph");
  return icon;
}

for (const entry of document.querySelectorAll("[data-item-icon]")) {
  entry.prepend(itemIcon(entry.dataset.itemIcon));
}
for (const entry of document.querySelectorAll("[data-extra-food]")) {
  entry.prepend(itemIcon(entry.dataset.eat));
}

function availableThisSeason(fish, season) {
  return !fish.seasons || fish.seasons.includes(season.id);
}

function fillCatalog() {
  const list = get("catalog-list");
  list.replaceChildren();
  const season = seasonAt(saved.minutes);
  const eligible = species.filter(fish => availableThisSeason(fish, season));
  get("catalog-summary").textContent = `已发现 ${species.filter(({ id }) => saved.catches[id]).length} / ${species.length} 种 · ${season.name}可钓 ${eligible.length} 种`;
  for (const fish of species) {
    const { id, rarity, hint } = fish;
    const known = saved.catches[id];
    const row = document.createElement("li");
    const desc = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = `${known ? items[id].name : "未发现"} · ${rarity}`;
    const availability = fish.seasons ? fish.seasons.map(id => seasons.find(entry => entry.id === id).name[0]).join("、") + "季" : "四季";
    const note = document.createElement("p");
    const habitats = saved.catchPlaces[id]?.join("、");
    const water = rarity === "稀有" || rarity === "传说" ? "外海深水" : "近礁浅湾";
    note.textContent = `${availability}${availableThisSeason(fish, season) ? " · 当季可钓" : ""}。 ${hint}${built("fishing-club") ? ` 推荐出海水域 ${water}。` : ""}${known ? ` 钓获 ${known} 次。` : ""}${habitats ? ` 捕获地点 ${habitats}。` : ""}`;
    desc.append(name, note);
    row.append(catalogIcon(fish, known), desc);
    list.append(row);
  }
}

get("open-catalog").addEventListener("click", () => {
  if (!saved.progress.fishing || activity || fishing || dialogOpen()) return;
  keys.clear();
  get("catalog-tabs").querySelector('button[aria-pressed="true"]').click();
  fishDialog.showModal();
});
get("close-catalog").addEventListener("click", () => fishDialog.close());

const foodButtons = [...document.querySelectorAll("[data-eat]")];
for (const button of foodButtons) {
  const id = button.dataset.eat;
  const item = items[id];
  button.setAttribute("aria-label", `食用${item.name}，恢复 ${item.energy} 点体力`);
  button.title = `恢复 ${item.energy} 点体力`;
  button.addEventListener("click", () => {
    if (activity || fishing || dialogOpen() || saved.stamina >= 100 || !saved.inventory[id]) return;
    const energy = Math.min(item.energy, 100 - saved.stamina);
    saved.inventory[id]--;
    saved.stamina += energy;
    notify(`吃了${item.name} · 体力 +${energy}`);
    chime(490);
    uiDirty = true;
    save();
  });
}

const residentMarkets = {
  beacon: {
    title: "阿澄的灯塔小铺",
    prices: () => ({
      soup: { buy: 15 }, compost: { buy: 4 }, fruit: { buy: 5 },
      shell: { sell: 10 }, fish: { sell: 6 }, seaweed: { sell: 3 },
      ...(raisingLivestock() ? { egg: { sell: items.egg.sell }, "duck-egg": { sell: items["duck-egg"].sell } } : {}),
      ...livestockSalePrices("beacon")
    })
  },
  headland: {
    title: "老纪的鱼摊",
    prices: () => {
      const season = seasonAt(saved.minutes);
      const prices = { fish: { buy: 8, sell: 6 }, seaweed: { sell: 4 } };
      for (const fish of species.slice(1)) {
        prices[fish.id] = availableThisSeason(fish, season) && fish.rarity !== "传说"
          ? { buy: fish.sell + 3, sell: fish.sell } : { sell: fish.sell };
      }
      if (hasCrabTrap()) for (const crab of crabs) {
        prices[crab.id] = { sell: crab.sell };
        if (availableThisSeason(crab, season)) prices[crab.id].buy = crab.sell + (crab.rarity === "稀有" ? 7 : 4);
      }
      return { ...prices, ...livestockSalePrices("headland") };
    }
  },
  windbell: {
    title: "小满的海风杂货",
    prices: () => {
      const seed = cultivars[seasonAt(saved.minutes).crop].seed;
      return {
        [seed]: { buy: items[seed].buy }, compost: { buy: 3 },
        coconut: { buy: 5, sell: 3 }, fruit: { buy: 5, sell: 4 },
        crop: { sell: 5 }, melon: { sell: 8 }, pumpkin: { sell: 7 }, radish: { sell: 6 },
        shell: { sell: 9 }, seaweed: { sell: 3 },
        egg: { sell: items.egg.sell }, "duck-egg": { sell: items["duck-egg"].sell }
      };
    }
  }
};

let tradePrices = {};
let tradeControls = [];

function livestockSalePrices(buyer) {
  return raisingLivestock() ? Object.fromEntries(Object.entries(livestock).map(([kind, animal]) =>
    [kind, { sell: animal[buyer] }])) : {};
}

const marketName = id => livestock[id] ? `成年${livestock[id].name}` : items[id].name;
const marketStock = id => livestock[id] ? sellableLivestock(id).length : saved.inventory[id];
const marketUnit = id => livestock[id] || crabs.some(crab => crab.id === id) ? "只" : "份";

function tradeLimit(id, side, price) {
  return side === "buy" ? Math.floor(saved.inventory.coin / price) : marketStock(id);
}

function buildTradeRows() {
  const list = get("trade-list");
  list.replaceChildren();
  tradeControls = [];
  for (const [id, prices] of Object.entries(tradePrices)) {
    if (!prices.buy && !marketStock(id) && !livestock[id]) continue;
    const row = document.createElement("li");
    row.dataset.item = id;
    row.classList.toggle("trade-livestock", Boolean(livestock[id]));
    const item = document.createElement("span");
    item.className = "trade-item";
    const name = document.createElement("span");
    if (!livestock[id]) item.append(itemIcon(id));
    item.append(name);
    row.append(item);
    const actions = [];
    for (const side of ["buy", "sell"]) {
      const price = prices[side];
      if (!price) continue;
      const group = document.createElement("div");
      group.className = `trade-side ${side}`;
      const label = document.createElement("span");
      const verb = side === "buy" ? "购买" : "出售";
      label.textContent = verb;
      group.append(label);
      for (const quantity of livestock[id] ? [1, "all"] : [1, 10, "all"]) {
        const button = document.createElement("button");
        const caption = document.createElement("span");
        const total = document.createElement("small");
        button.type = "button";
        button.className = "action";
        button.dataset.quantity = String(quantity);
        button.append(caption, total);
        button.addEventListener("click", () => trade(id, side, quantity));
        group.append(button);
        actions.push({ side, price, verb, quantity, button, caption, total });
      }
      row.append(group);
    }
    list.append(row);
    tradeControls.push({ id, name, actions });
  }
}

function updateMarket() {
  get("market-coins").textContent = saved.inventory.coin;
  for (const { id, name, actions } of tradeControls) {
    const unit = marketUnit(id);
    const reserved = livestock[id] && saved.life.coop.breeding[id] ? " · 繁殖留养 2 只" : "";
    name.textContent = `${marketName(id)} · ${livestock[id] ? "可售" : "持有"} ${marketStock(id)}${reserved}`;
    for (const { side, price, verb, quantity, button, caption, total } of actions) {
      const limit = tradeLimit(id, side, price);
      const all = quantity === "all";
      const count = all ? limit : quantity;
      const amount = count * price;
      caption.textContent = all ? `${side === "buy" ? "全买" : "全卖"} ${count}` : `${count} ${unit}`;
      total.textContent = `${amount} 贝币`;
      button.disabled = count <= 0 || count > limit;
      button.setAttribute("aria-label", `${verb}${marketName(id)} ${all ? "全部，" : ""}${count} ${unit}，${amount} 贝币`);
    }
  }
  get("trade-list").hidden = !tradeControls.length;
  get("trade-empty").hidden = Boolean(tradeControls.length);
}

function trade(id, side, quantity) {
  if (!marketDialog.open || !area().spots.includes(marketSpot) || !spotVisible(marketSpot)) return;
  const price = tradePrices[id]?.[side];
  if (!price) return;
  const limit = tradeLimit(id, side, price);
  const count = quantity === "all" ? limit : quantity;
  if (!Number.isSafeInteger(count) || count <= 0 || count > limit) return;
  const amount = price * count;
  if (side === "buy") {
    saved.inventory.coin -= amount;
    saved.inventory[id] += count;
  } else {
    if (livestock[id]) sellLivestock(id, count);
    else saved.inventory[id] -= count;
    saved.inventory.coin += amount;
    if (marketSpot.type === "trade" && (id === "coconut" || id === "fruit")) saved.progress.firstSale = true;
    recordQuest("trade", count, id);
  }
  get("trade-note").textContent = `${side === "buy" ? "买到" : "卖出"} ${count} ${marketUnit(id)}${marketName(id)} · 贝币 ${side === "buy" ? "−" : "+"}${amount}`;
  updateMarket();
  uiDirty = true;
  save();
}

function openMarket(spot) {
  keys.clear();
  marketSpot = spot;
  const shop = residentMarkets[saved.area];
  const seasonalSeed = cultivars[seasonAt(saved.minutes).crop].seed;
  if (shop) tradePrices = shop.prices();
  else if (!saved.progress.post) tradePrices = { coconut: { sell: items.coconut.sell }, fruit: { sell: items.fruit.sell } };
  else tradePrices = Object.fromEntries(Object.entries(items).flatMap(([id, item]) => {
    const farmSupply = seedIds.includes(id) || id === "compost";
    if ((farmSupply && !saved.progress.farming) || (seedIds.includes(id) && id !== seasonalSeed)) return [];
    const buy = (id === "fish" && !saved.progress.fishing) || (id === "soup" && !saved.progress.cooking) ? undefined : item.buy;
    return buy || item.sell ? [[id, { buy, sell: item.sell }]] : [];
  }));
  get("market-title").textContent = shop?.title ?? "行商小舟";
  get("trade-note").textContent = "";
  buildTradeRows();
  updateMarket();
  marketDialog.showModal();
}

get("close-market").addEventListener("click", () => marketDialog.close());
get("walk-market").addEventListener("click", () => {
  goToIslandSpot(Island.spots.find(spot => spot.type === "trade"));
});
get("wait-market").addEventListener("click", () => {
  if (saved.progress.post || !saved.fruitCollected || marketDay() || activity || fishing || dialogOpen()) return;
  keys.clear();
  route = [];
  routedSpot = null;
  saved.minutes = (dayIndex() + daysToMarket()) * 1440 + 480;
  uiDirty = true;
  updateIsland();
  save();
});

const chart = get("sailing-chart");
const chartContext = chart.getContext("2d");
let selectedStop = "tidal";
let routeSelectedAt = 0;
const returnStop = { fare: 0, note: "回程已经包含在船票里，船家会送你回自己的岛。" };

function selectedPassage() {
  const route = Archipelago.routes[selectedStop];
  if (route) return { destination: selectedStop, name: route.name, fare: route.fare, minutes: route.minutes };
  const departure = Archipelago.routes[saved.area];
  return { destination: "island", name: saved.name || "无名岛", fare: 0, minutes: departure.minutes };
}

function selectStop(id) {
  selectedStop = id;
  routeSelectedAt = elapsed;
  const trip = selectedPassage();
  const note = Archipelago.routes[id] ?? returnStop;
  get("sail-destination").textContent = note.kind ? `${trip.name} · ${note.kind}` : trip.name;
  const extras = [];
  if (id === "beacon" && raisingLivestock()) extras.push("灯塔小铺也收鸡鸭蛋和成年鸡鸭。");
  if (id === "headland") {
    if (hasCrabTrap()) extras.push("老纪买卖螃蟹。");
    if (raisingLivestock()) extras.push("鱼摊也收成年鸡鸭。");
  }
  get("sail-info").textContent = [note.note, ...extras].join(" ");
  get("sail-cost").textContent = `${trip.minutes} 岛上分钟 · ${trip.fare ? `${trip.fare} 贝币，含回程` : "免费回程"}`;
  get("sail-funds").textContent = saved.inventory.coin < trip.fare ?
    `贝币不足，还差 ${trip.fare - saved.inventory.coin}` : `现有 ${saved.inventory.coin} 贝币`;
  const button = get("sail-go");
  button.disabled = saved.inventory.coin < trip.fare;
  button.textContent = trip.fare ? "确认登船" : "登船回家";
  for (const stop of get("sail-stops").children) {
    stop.setAttribute("aria-pressed", String(stop.dataset.stop === id));
  }
}

function openSail() {
  const abroad = Boolean(Archipelago.routes[saved.area]);
  if (!abroad && !saved.progress.routes.length) return;
  keys.clear();
  const stops = get("sail-stops");
  stops.replaceChildren();
  const extension = get("chart-east-bay");
  extension.hidden = !saved.life.ventures.permits.includes("east-bay");
  extension.textContent = built("east-bay") ? "本岛 · 东岬湾" : "本岛 · 东岬湾规划";
  const selectable = abroad ? [["island", saved.name || "无名岛"]] :
    Object.entries(Archipelago.routes).filter(([id]) => hasRoute(id))
      .map(([id, route]) => [id, route.name]);
  for (const [id, name] of selectable) {
    const marker = document.createElement("button");
    const [x, y] = Archipelago.chartPoints[id];
    marker.type = "button";
    marker.className = "chart-stop";
    marker.dataset.stop = id;
    marker.style.left = `${x / chart.width * 100}%`;
    marker.style.top = `${y / chart.height * 100}%`;
    marker.textContent = name;
    if (hasReadyCommission(id)) {
      const badge = document.createElement("span");
      badge.className = "chart-turn-in";
      badge.textContent = "!";
      badge.setAttribute("aria-hidden", "true");
      marker.setAttribute("aria-label", `${name}，有委托可交付`);
      marker.append(badge);
    }
    marker.addEventListener("click", () => selectStop(id));
    stops.append(marker);
  }
  get("sail-title").textContent = abroad ? "返航" : "船家的航图";
  selectStop(selectable[0][0]);
  sailDialog.showModal();
}

function drawOpenChart() {
  const origin = Archipelago.routes[saved.area] ? saved.area : "island";
  const routeAge = elapsed - routeSelectedAt;
  const reveal = useReducedMotion() ? 1 : Math.min(1, routeAge / .65);
  Archipelago.drawChart(chartContext, origin, selectedStop, reveal, useReducedMotion() ? .72 : routeAge, saved.progress.routes);
}

get("close-sail").addEventListener("click", () => sailDialog.close());
get("sail-go").addEventListener("click", () => {
  if (!sailDialog.open || activity) return;
  const passage = selectedPassage();
  if (saved.inventory.coin < passage.fare || (passage.destination !== "island" && !hasRoute(passage.destination))) return;
  sailDialog.close();
  beginActivity("sail", useReducedMotion() ? .45 : 4.1, "解缆出港…");
  activity.passage = passage;
  chime(350);
});

function finishVoyage(passage) {
  const destination = passage.destination;
  const landing = destination === "island" ? { x: 355, y: 176, facing: "left" } : areas[destination].arrival;
  saved.inventory.coin -= passage.fare;
  saved.minutes += passage.minutes;
  if (destination !== "island" && !saved.quests.visited.includes(destination)) {
    saved.quests.visited.push(destination);
  }
  changeArea(destination, landing);
  if (!saved.progress.building && Object.hasOwn(residents, destination)) {
    saved.progress.building = true;
    addAlert("岛建计划开放", "认识了邻岛居民，你可以在手记里查看基础岛建，用沙滩上的浮木修建设施。");
    save();
  } else notify(`抵达${passage.name}`);
  chime(570);
}

function goToHarbor() {
  if (area().dock) visit(area().dock, area().dock);
  else goToIslandSpot(harborSpot);
}

get("walk-harbor").addEventListener("click", goToHarbor);

function visitFishingSpot(spot) {
  if (weatherAtTime() === "storm") return notify("飓风期间不能抛竿。18:00 后再来。");
  if (!spend(6)) return;
  route = [];
  routedSpot = null;
  player.x = spot.x;
  player.y = spot.y;
  player.facing = "down";
  fishing = { phase: "wait", start: elapsed, until: elapsed + 1.5 + Math.random() * 2 };
  get("fishing").hidden = false;
  chime(310);
  return true;
}

function endFishing() {
  fishing = null;
  get("fishing").hidden = true;
  get("fishing").classList.remove("bite", "fighting", "strain");
  get("fight-meters").hidden = true;
  uiDirty = true;
}

function pullPressure(fish) {
  return (elapsed - fish.start + fish.pattern) % 2.45 < fish.species.pull;
}

function reel() {
  if (fishing.phase === "bite" && elapsed < fishing.until) {
    fishing = { phase: "fight", start: elapsed, until: elapsed + 12, tension: .08, progress: 0,
      pattern: Math.random() * 1.5, lastPull: -1, species: fishing.species };
    get("fishing").classList.replace("bite", "fighting");
    get("fight-meters").hidden = false;
    chime(420);
    return;
  }
  if (fishing.phase !== "fight" || elapsed - fishing.lastPull < .15) return;
  fishing.lastPull = elapsed;
  const fighting = pullPressure(fishing);
  fishing.tension += fighting ? .31 : .15;
  fishing.progress += fighting ? .045 : fishing.species.gain;
  if (fishing.tension >= 1) {
    endFishing();
    notify("拉得太急，鱼线断了。鱼挣扎时等一等。");
  } else if (fishing.progress >= 1) {
    const { id, rarity } = fishing.species;
    const discovered = !saved.catches[id];
    const storedOnBoat = recordOffshoreCatch(id);
    if (!storedOnBoat) storeLandedFish(id, saved.area === "offshore" ? "东岬湾赛场" : Archipelago.routes[saved.area]?.name ?? "自家栈桥");
    endFishing();
    if (storedOnBoat) {
      notify(`钓到${items[id].name}，已放入船上鱼箱。`);
      save();
      return;
    }
    notify(`钓到${items[id].name}${rarity === "传说" ? " · 传说鱼" : ""}${discovered ? " · 图鉴已更新" : ""}`);
    chime(550);
    save();
  }
}

function updateFishing(dt) {
  if (!fishing) return;
  if (weatherAtTime() === "storm") {
    endFishing();
    return;
  }
  const panel = get("fishing");
  if (elapsed >= fishing.until && fishing.phase === "wait") {
    fishing = { phase: "bite", start: elapsed, until: elapsed + 2.8, species: offshoreFish() ?? hookedSpecies() };
    panel.classList.add("bite");
    chime(820);
  } else if (elapsed >= fishing.until) {
    endFishing();
    notify("鱼挣脱了。再抛一竿吧。");
    return;
  }
  const bite = fishing.phase === "bite";
  const fight = fishing.phase === "fight";
  let label = bite ? "上钩了！现在收线" : "等待咬钩…";
  if (fight) {
    const pulling = pullPressure(fishing);
    fishing.tension = Math.max(0, fishing.tension - dt * (pulling ? .08 : .25));
    if (pulling) fishing.progress = Math.max(0, fishing.progress - dt * .025);
    const strain = fishing.tension > .69;
    panel.classList.toggle("strain", strain);
    label = strain ? "线太紧，先松一松" : pulling ? "鱼在挣扎，先稳住" : "鱼放松了，点按收线";
    get("reel-fill").style.transform = `scaleX(${fishing.progress})`;
    get("tension-fill").style.transform = `scaleX(${fishing.tension})`;
  }
  if (get("fishing-text").textContent !== label) get("fishing-text").textContent = label;
  const percent = (elapsed - fishing.start) / (fishing.until - fishing.start);
  get("line-fill").style.transform = `scaleX(${bite || fight ? 1 - percent : percent})`;
}

const mailErrors = {
  key_missing: "请先连接 DeepSeek",
  deepseek_key: "DeepSeek 拒绝了当前密钥",
  deepseek_balance: "DeepSeek 账户余额不足",
  deepseek_daily_limit: "今天的 DeepSeek 额度已用完",
  deepseek_pending: "对岸还在写信，可以稍后重试",
  deepseek_unavailable: "DeepSeek 暂时无法回信"
};

async function api(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22000);
  try {
    const options = { signal: controller.signal };
    if (body !== undefined) {
      options.method = "POST";
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    const postOfficeOrigin = document.documentElement.dataset.postOfficeOrigin || location.origin;
    const response = await fetch(new URL(`/api/post-office${path}`, postOfficeOrigin), options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function setPostOfficeCapabilities(config) {
  deepSeekReady = config.enabled === true;
  residentDialogueReady = deepSeekReady && config.dialogue === true;
  if (residentDialog.open) syncResidentChat(saved.area);
}

async function initializePostOffice() {
  if (!serverMode) return;
  try {
    setPostOfficeCapabilities(await api(""));
    get("connect-deepseek").hidden = publicRelease;
    uiDirty = true;
  } catch {
    setPostOfficeCapabilities({});
  }
  postOfficeInitialized = true;
  resolveReply();
  resolveFamilyReply();
}

async function resolveReply() {
  const letter = saved.pending;
  if (!saved.progress.post || !letter?.provider || letter.replyText || letter.failed || mailRequest) return;
  mailRequest = letter.id;
  try {
    await fetchLetterReply(letter, letter.id);
  } finally {
    mailRequest = null;
    uiDirty = true;
    save();
    updateMail();
  }
}

async function fetchLetterReply(letter, id) {
  try {
    if (!serverMode) throw new Error("key_missing");
    const result = await api("/reply", { id, message: letter.message, character: letter.reply, kind: letter.kind === "family" ? "family" : "reply" });
    if (typeof result.text !== "string" || !result.text.trim()) throw new Error("deepseek_unavailable");
    letter.replyText = result.text.slice(0, 500);
    delete letter.failed;
  } catch (error) {
    letter.failed = Object.hasOwn(mailErrors, error.message) ? error.message : "deepseek_unavailable";
  }
}

async function retryLetter(letter, button) {
  if (mailRequest) return;
  mailRequest = crypto.randomUUID();
  button.disabled = true;
  button.textContent = "对岸正在重新写信…";
  try {
    await fetchLetterReply(letter, mailRequest);
    if (dialog.open) {
      fillLetters();
    } else if (letter.replyText) {
      letter.unread = true;
      addAlert("DeepSeek 回信到了", "海鸥带回了重新写好的回信。", letter.arrives);
    }
    uiDirty = true;
    save();
  } finally {
    mailRequest = null;
    resolveReply();
  }
}

get("connect-deepseek").addEventListener("click", () => {
  if (activity || fishing || dialogOpen()) return;
  if (!serverMode) {
    location.assign("http://127.0.0.1:8767/");
    return;
  }
  keys.clear();
  get("connect-note").textContent = "";
  connectDialog.showModal();
});
get("close-connect").addEventListener("click", () => connectDialog.close());
connectDialog.addEventListener("close", () => { get("deepseek-key").value = ""; });
get("connect-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = get("connect-submit");
  const input = get("deepseek-key");
  button.disabled = true;
  get("connect-note").textContent = "正在设置…";
  try {
    setPostOfficeCapabilities(await api("/setup", { key: input.value.trim() }));
    if (connectDialog.open) connectDialog.close();
    notify("DeepSeek 已启用。寄出一封信试试。");
    uiDirty = true;
  } catch {
    get("connect-note").textContent = "设置失败。请检查密钥格式后重试。";
  } finally {
    input.value = "";
    button.disabled = false;
  }
});

function unlockFromLetter(letter) {
  if (letter.kind === "intro" || letter.kind === "construction") return;
  const author = letterAuthor(letter);
  const { progress } = saved;
  const notes = [];
  const route = invitationRoutes[author];
  if (route && contactAvailable(author) && !hasRoute(route)) {
    progress.routes.push(route);
    notes.push(`我在${Archipelago.routes[route].name}等你。把这封邀请拿给船家，航图上就会标出到我这里的路线。`);
  }
  if (author === 1 && !progress.fishing) {
    progress.fishing = true;
    notes.push("我托海鸥带来一根鱼竿。到自家栈桥就能试钓，等浮标动了再收线。");
  }
  if (author === 3 && !progress.farming) {
    progress.farming = true;
    const { name, seed } = cultivars[seasonAt(saved.minutes).crop];
    saved.inventory[seed] += 3;
    saved.inventory.compost++;
    notes.push(`给你捎了 3 份当季${name}种子和 1 份堆肥。去田边先开垦一块地，然后播种浇水。`);
  }
  if (author === 4 && !progress.cooking) {
    progress.cooking = true;
    notes.push("旧锅已经放在灶台上。我把鱼汤的做法夹在信里，想吃点热的就试试。常备椰子和海岛果也能做果碗。");
  }
  if (notes.length) letter.enclosure = notes.join("\n");
}

function receiveLetter(letter) {
  const author = letterAuthor(letter);
  const sender = letterRecipient(author).from;
  const first = !contactAvailable(author);
  if (first) saved.progress.correspondents.push(author);
  unlockFromLetter(letter);
  letter.unread = true;
  saved.letters.unshift(letter);
  saved.letters.length = Math.min(24, saved.letters.length);
  mailboxQuietUntil = elapsed + 5;
  birdFlight = { phase: "return", start: elapsed };
  const message = first ? `收到${sender}的第一封来信，可以给对方回信了。` :
    letter.enclosure ? "海鸥带回了一封信和一份附件。" : `海鸥带回了${sender}的信。`;
  addAlert(`${sender}来信了`, message, letter.arrives);
  chime(710);
  uiDirty = true;
  if (dialog.open) fillLetters();
  if (contactsDialog.open) refreshContacts();
  save();
}

function updateMail() {
  const letter = saved.pending;
  if (resetting || !saved.progress.post || !letter || saved.minutes < letter.arrives) return;
  if (letter.provider && !letter.replyText && !letter.failed) return;
  saved.pending = null;
  receiveLetter(letter);
}

function familyContext() {
  const weather = weatherNames[weatherAtTime()];
  const progress = [
    saved.fruitCollected ? "采过水果" : "刚在岛上安顿",
    saved.fishCaught ? "钓过鱼" : "",
    saved.plots.some(plot => plot?.planted != null) ? "在照料田里的作物" : "",
    saved.inventory.soup ? "做过椰香鱼汤" : ""
  ].filter(Boolean);
  return `岛上第 ${dayIndex() + 1} 天，${seasonAt(saved.minutes).name}，天气${weather}，玩家${progress.join("、")}。这是第 ${saved.familyCount + 1} 封家书。`;
}

function deliverFamily(letter) {
  saved.familyPending = null;
  letter.arrives = saved.minutes;
  receiveLetter(letter);
}

async function resolveFamilyReply() {
  const letter = saved.familyPending;
  if (!letter || familyRequest || !postOfficeInitialized) return;
  familyRequest = letter.id;
  try {
    await fetchLetterReply(letter, letter.id);
    if (!resetting && saved.familyPending === letter) deliverFamily(letter);
  } finally {
    familyRequest = null;
  }
}

const familyMailOrder = ["mother", "sister", "father", "sister", "mother", "father"];

function sendFamilyLetter(author, occasion = "") {
  const sender = family[author];
  const count = Math.floor(saved.familyCount / familyMailOrder.length) * 2 + Number(saved.familyCount % familyMailOrder.length >= 3);
  const letter = {
    kind: "family", author, text: occasion ?
      "听说你在露台开餐厅啦！我在海图上画了个小屋顶，还添了一张靠海的桌子。下次回信告诉我，你给第一桌客人做了什么？" :
      sender.letters[count % sender.letters.length],
    arrives: saved.minutes, unread: true
  };
  if (deepSeekReady) {
    letter.id = crypto.randomUUID();
    letter.reply = familyReplyIds[author];
    letter.message = [familyContext(), occasion].filter(Boolean).join(" ");
  }
  saved.familyCount++;
  saved.familyNext = saved.minutes + 615 + Math.round(Math.random() * 1160);
  if (deepSeekReady) {
    saved.familyPending = letter;
    save();
    resolveFamilyReply();
  } else {
    deliverFamily(letter);
  }
}

function mailboxIdle() {
  return saved.progress.post && postOfficeInitialized && !resetting && !activity && !fishing && !dialogOpen() &&
    !saved.pending && !saved.familyPending && elapsed >= mailboxQuietUntil;
}

function nextIntroduction() {
  if (saved.life.expansion.referred && !contactAvailable(7)) return 7;
  return firstLetterOrder.find(id => !contactAvailable(id));
}

function updateIslandMail() {
  if (!mailboxIdle() || saved.area === "offshore") return;
  const { dining } = saved.life.ventures;
  if (dining.letter === "queued") {
    dining.letter = "sent";
    sendFamilyLetter("sister", `妹妹寄来开店贺信。玩家的餐厅「${dining.name}」刚结束第一场午餐，请提到在海图上画下餐厅。`);
    return;
  }
  const id = nextIntroduction();
  if (id !== undefined) {
    const { progress } = saved;
    if (progress.firstLetterAt === null) {
      progress.firstLetterAt = saved.minutes + firstLetterDelay;
      save();
      return;
    }
    if (saved.minutes < progress.firstLetterAt) return;
    progress.firstLetterAt = saved.minutes + firstLetterSpacing;
    const relative = Object.keys(familyReplyIds).find(author => familyReplyIds[author] === id);
    if (relative) sendFamilyLetter(relative);
    else receiveLetter({ kind: "intro", reply: id, text: introductions[id], arrives: saved.minutes });
    return;
  }
  if (saved.familyNext === null) {
    saved.familyNext = saved.minutes + 100 + Math.round(Math.random() * 145);
    save();
    return;
  }
  if (saved.minutes >= saved.familyNext) sendFamilyLetter(familyMailOrder[saved.familyCount % familyMailOrder.length]);
}

function unreadLetter() {
  return saved.letters.find(item => item.unread);
}

function fillLetters(preferred) {
  const incoming = get("incoming");
  const form = get("letter-form");
  incoming.replaceChildren();
  const atPost = dialog.dataset.atPost === "true";
  const atDesk = dialog.dataset.atDesk === "true";
  const selected = saved.letters.find(item => String(item.arrives) === dialog.dataset.letterAt);
  const letters = atDesk ? saved.letters : selected ? [selected] : saved.letters.slice(0, 1);
  for (const item of letters) {
    const relative = item.kind === "family" ? family[item.author] : null;
    const reply = relative ? null : letterRecipient(item.reply);
    const letter = document.createElement("article");
    letter.className = "incoming-letter";
    const from = document.createElement("strong");
    from.textContent = relative ? relative.name : reply.from;
    const text = document.createElement("p");
    const unsolicited = relative || item.kind === "intro" || item.kind === "construction";
    text.textContent = item.replyText || (unsolicited ? item.text : reply.text);
    letter.append(from, text);
    if (typeof item.enclosure === "string" && item.enclosure) {
      const enclosure = document.createElement("p");
      enclosure.className = "letter-enclosure";
      enclosure.textContent = item.enclosure;
      letter.append(enclosure);
    }
    if (item.replyText || item.failed) {
      const source = document.createElement("small");
      source.textContent = item.replyText ? (relative ? "DeepSeek 生成的家书" : "DeepSeek 生成的角色回信") : `预写回信 · ${mailErrors[item.failed] || "DeepSeek 暂时无法回信"}`;
      letter.append(source);
    }
    if (item.failed && serverMode && deepSeekReady) {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "setup-link retry-letter";
      retry.textContent = "用 DeepSeek 重试这封信";
      retry.addEventListener("click", () => retryLetter(item, retry));
      letter.append(retry);
    }
    if (atDesk && !unsolicited) {
      const original = document.createElement("blockquote");
      original.textContent = `你寄给${reply.from}的信　${item.message}`;
      letter.append(original);
    }
    if (!atPost && !saved.pending) {
      const respond = document.createElement("button");
      respond.type = "button";
      respond.className = "setup-link";
      respond.textContent = `给${from.textContent}回信`;
      respond.addEventListener("click", () => {
        chosenRecipient = letterAuthor(item);
        dialog.close();
        goToIslandSpot(postSpot);
      });
      letter.append(respond);
    }
    incoming.append(letter);
    item.unread = false;
    for (const alert of saved.alerts) if (alert.letterAt === item.arrives) alert.unread = false;
  }
  if ((atDesk || atPost) && !letters.length && !saved.pending && !saved.progress.correspondents.length) {
    const note = document.createElement("p");
    note.textContent = "海鸟还在等第一封来信。收到谁的信，就可以给谁回信。";
    incoming.append(note);
  } else if (atDesk && !letters.length && !saved.pending) {
    const note = document.createElement("p");
    note.textContent = "信桌上暂时没有来信。可以去栈桥给通讯录里的联系人回信。";
    incoming.append(note);
  }
  if (saved.pending) {
    const note = document.createElement("p");
    note.textContent = "海鸥还在路上。可以用「等一等」让时间过得快些。";
    incoming.append(note);
  }
  incoming.hidden = !incoming.childElementCount;
  if (atPost) refreshContacts(preferred);
  form.hidden = !atPost || Boolean(saved.pending) || !saved.progress.correspondents.length;
  get("mail-mode").textContent = deepSeekReady ? "这封信会发送给 DeepSeek，生成岛外角色的回信。" :
    publicRelease ? "海鸥回来时，会带回岛外角色的信。" :
      "当前使用预写回信。连接 DeepSeek 后，角色会按你的来信内容回复。";
  uiDirty = true;
  save();
}

function openLetters(atPost, atDesk = false, letterAt = null) {
  if (!saved.progress.post || fishing || activity || dialogOpen()) return;
  keys.clear();
  dialog.dataset.atPost = String(atPost);
  dialog.dataset.atDesk = String(atDesk);
  dialog.dataset.letterAt = letterAt === null ? "" : String(letterAt);
  get("letter-title").textContent = atDesk ? "窗边的信桌" : "海鸟邮局";
  const preferred = atPost && contactAvailable(chosenRecipient) ? String(chosenRecipient) : undefined;
  fillLetters(preferred);
  dialog.showModal();
}

get("letter-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!saved.progress.post || !dialog.open || saved.pending || dialog.dataset.atPost !== "true") return;
  if (recipientSelect.value === "") return;
  const recipient = Number(recipientSelect.value);
  if (!contactAvailable(recipient)) return;
  const input = get("letter-text");
  const message = input.value.trim();
  if (!message) {
    input.setCustomValidity("写几句话，海鸥就出发。");
    input.reportValidity();
    return;
  }
  chosenRecipient = recipient;
  saved.pending = { message, reply: recipient, arrives: saved.minutes + 90 };
  if (deepSeekReady) {
    saved.pending.provider = "deepseek";
    saved.pending.id = crypto.randomUUID();
  }
  saved.sent++;
  recordPlay("letters");
  recordQuest("mail");
  birdFlight = { phase: "depart", start: elapsed };
  input.value = "";
  dialog.close();
  notify(`海鸥带着信去找${letterRecipient(recipient).from}了。`);
  chime(500);
  uiDirty = true;
  save();
  resolveReply();
});

const recipientSelect = get("letter-recipient");
const contactEntries = [];
for (const contact of contacts) {
  const option = document.createElement("option");
  option.value = String(contact.id);
  option.textContent = contact.name;
  const row = document.createElement("li");
  const identity = document.createElement("div");
  identity.className = "contact-identity";
  const portrait = document.createElement("img");
  portrait.src = Archipelago.portrait(contact.id);
  portrait.alt = "";
  portrait.width = 42;
  portrait.height = 42;
  const name = document.createElement("strong");
  name.textContent = contact.name;
  identity.append(portrait, name);
  const write = document.createElement("button");
  write.type = "button";
  write.className = "quiet";
  write.dataset.contact = String(contact.id);
  write.textContent = "回信";
  write.setAttribute("aria-label", `回信给${contact.name}`);
  write.addEventListener("click", () => {
    if (saved.pending || !contactAvailable(contact.id)) return;
    chosenRecipient = contact.id;
    contactsDialog.close();
    goToIslandSpot(postSpot);
  });
  row.append(identity, write);
  contactEntries.push({ id: contact.id, option, row, write });
}

function refreshContacts(preferred = recipientSelect.value) {
  const known = contactEntries.filter(entry => contactAvailable(entry.id));
  for (const { write } of known) {
    write.disabled = Boolean(saved.pending);
  }
  get("contact-list").replaceChildren(...known.map(entry => entry.row));
  recipientSelect.replaceChildren(...known.map(entry => entry.option));
  if (known.some(entry => entry.option.value === preferred)) recipientSelect.value = preferred;
  get("contacts-note").textContent = saved.pending ? "海鸥还在送信。它回来后就可以回信。" :
    known.length ? "给收到过来信的人回信。收到邻岛邀请后，船家会把航线标在海图上。" :
    "还没有联系人。收到谁的第一封来信，谁就会加入通讯录。";
}

function goToIslandSpot(destination, interior = null) {
  if (saved.area === "offshore" || fishing || activity || dialogOpen() || !spotVisible(destination)) return;
  if (area().dock) {
    visit(area().dock, area().dock);
    return;
  }
  const inside = saved.area === "cabin";
  destinationAfterExit = inside ? destination : null;
  destinationAfterEntry = interior;
  const spot = inside ? Cabin.spots.find(place => place.type === "exit") : destination;
  visit(spot, spot);
}

get("open-contacts").addEventListener("click", () => {
  if (!saved.progress.post || activity || fishing || dialogOpen()) return;
  keys.clear();
  refreshContacts();
  contactsDialog.showModal();
});
get("close-contacts").addEventListener("click", () => contactsDialog.close());

get("letter-text").addEventListener("input", event => event.currentTarget.setCustomValidity(""));
get("close-letter").addEventListener("click", () => dialog.close());
postButton.addEventListener("click", () => {
  if (activity) return;
  if (fishing) {
    notify("收完这一竿，再去邮局。");
    return;
  }
  const letter = unreadLetter();
  if (letter) {
    openLetters(false, false, letter.arrives);
    return;
  }
  goToIslandSpot(postSpot);
});

get("advance").addEventListener("click", () => {
  if (saved.area === "offshore" || activity) return;
  if (fishing) {
    notify("收完这一竿，再等一等。");
    return;
  }
  const season = seasonAt(saved.minutes);
  const next = seasonAt((dayIndex() + 1) * 1440);
  const hourMarks = [[season.dawn, "破晓"], [12, "正午"], [season.dusk, "日落"], [22, "夜色"], [24 + next.dawn, "破晓"]];
  const minute = saved.minutes % 1440;
  const [hour, label] = hourMarks.find(([value]) => value * 60 > minute);
  saved.minutes = dayIndex() * 1440 + hour * 60;
  notify(label);
  updateMail();
  uiDirty = true;
  save();
});

action.addEventListener("click", () => interact());
marker.addEventListener("click", () => interact(active));
residentTurnIn.addEventListener("click", () => {
  if (!readyResidentSpot || activity || fishing || dialogOpen()) return;
  visit(readyResidentSpot, readyResidentSpot);
});

let questTab = "residents";

function refreshQuestDay() {
  const { quests } = saved;
  const day = dayIndex();
  const prior = quests.daily;
  if (prior.day === day) return false;
  if (prior.day < day) for (const task of dailyTasks(prior.day)) {
    if ((prior.counts[task.metric] ?? 0) >= task.goal && !prior.claimed.includes(task.id)) {
      if (!quests.backlog.some(entry => entry.day === prior.day && entry.id === task.id)) {
        quests.backlog.push({ day: prior.day, id: task.id });
      }
    }
  }
  quests.daily = emptyDaily(day);
  uiDirty = true;
  return true;
}

function recordQuest(metric, amount = 1, item = null) {
  refreshQuestDay();
  const { counts, daily } = saved.quests;
  counts[metric] = (counts[metric] ?? 0) + amount;
  daily.counts[metric] = (daily.counts[metric] ?? 0) + amount;
  trackResidentProgress(metric, amount, item);
  uiDirty = true;
}

function lifetimeProgress(metric) {
  if (metric === "fruit") return Number(saved.fruitCollected);
  if (metric === "fish") return Number(saved.fishCaught);
  if (metric === "mail") return saved.sent;
  if (metric === "visited") return saved.quests.visited.length;
  if (metric === "species") return Object.values(saved.catches).filter(Boolean).length;
  return saved.quests.counts[metric] ?? 0;
}

const questFeature = { fish: "fishing", species: "fishing", mail: "post", harvest: "farming", farm: "farming", compost: "farming", cook: "cooking" };

function questAvailable(task) {
  if (task.metric === "visited") return saved.progress.routes.length > 0;
  const feature = questFeature[task.metric];
  return !feature || saved.progress[feature];
}

function questRows(tab) {
  const { quests } = saved;
  if (tab === "island") return starterTasks.filter(questAvailable).map(task => ({
    task, progress: lifetimeProgress(task.metric), claimed: quests.claimed.includes(task.id), day: null
  }));
  const daily = dailyTasks(quests.daily.day).filter(questAvailable).map(task => ({
    task, progress: quests.daily.counts[task.metric] ?? 0, claimed: quests.daily.claimed.includes(task.id), day: quests.daily.day
  }));
  for (const entry of quests.backlog) {
    const task = dailyTasks(entry.day).find(task => task.id === entry.id);
    daily.push({ task, progress: task.goal, claimed: false, day: entry.day });
  }
  return daily;
}

const readyQuest = ({ task, progress, claimed }) => progress >= task.goal && !claimed;
const rewardName = id => id === "coin" ? "贝币" : items[id].name;

function updateQuestBadge() {
  const count = [...questRows("island"), ...questRows("daily")].filter(readyQuest).length +
    Object.keys(residentTaskPools).reduce((total, id) => total + readyCommissions(id), 0) + researchReadyCount();
  const badge = get("quest-badge");
  badge.hidden = !count;
  badge.textContent = count > 9 ? "9+" : String(count);
  get("open-quests").setAttribute("aria-label", count ? `任务，${count} 项可交付或领奖` : "任务");
}

function claimQuest(id, day) {
  if (!questsDialog.open) return;
  refreshQuestDay();
  const row = questRows(questTab).find(entry => entry.task.id === id && entry.day === day);
  if (!row || !readyQuest(row)) return;
  const { quests } = saved;
  if (day === null) quests.claimed.push(id);
  else if (day === quests.daily.day) quests.daily.claimed.push(id);
  else quests.backlog = quests.backlog.filter(entry => entry.day !== day || entry.id !== id);
  const rewards = Object.entries(row.task.reward);
  for (const [item, count] of rewards) saved.inventory[item] += count;
  uiDirty = true;
  save();
  chime(740);
  fillQuests();
  get("quest-feedback").textContent = `奖励已放进背包 · ${rewards.map(([item, count]) => `${rewardName(item)} × ${count}`).join("、")}`;
}

function fillQuests() {
  const list = get("quest-list");
  list.replaceChildren();
  for (const tab of get("quest-tabs").children) tab.setAttribute("aria-pressed", String(tab.dataset.questTab === questTab));
  if (questTab === "residents") {
    fillCommissionLog(list);
    return;
  }
  get("quest-intro").textContent = questTab === "island" ? "旅程任务可以慢慢完成，每项奖励领一次。" :
    "每个岛上日换新一组小事，已经完成的奖励可以留到以后领。";
  const ordered = questRows(questTab).sort((left, right) => Number(readyQuest(right)) - Number(readyQuest(left)) ||
    Number(left.claimed) - Number(right.claimed));
  for (const row of ordered) {
    const { task, progress, claimed, day } = row;
    const entry = document.createElement("li");
    const info = document.createElement("div");
    const title = document.createElement("h3");
    const archived = day !== null && day !== dayIndex();
    title.textContent = archived ? `${task.title} · 第 ${day + 1} 天` : task.title;
    const details = document.createElement("p");
    details.textContent = task.detail;
    const reward = document.createElement("div");
    reward.className = "quest-reward";
    for (const [id, count] of Object.entries(task.reward)) {
      const item = document.createElement("span");
      item.append(itemIcon(id), `${rewardName(id)} × ${count}`);
      reward.append(item);
    }
    info.append(title, details, reward);
    const status = document.createElement("div");
    status.className = "quest-status";
    if (readyQuest(row)) {
      const claim = document.createElement("button");
      claim.type = "button";
      claim.className = "action";
      claim.textContent = "领奖励";
      claim.setAttribute("aria-label", `领取${title.textContent}的奖励`);
      claim.addEventListener("click", () => claimQuest(task.id, day));
      status.append(claim);
    } else status.textContent = claimed ? "已领取" : `${Math.min(progress, task.goal)} / ${task.goal}`;
    entry.append(info, status);
    list.append(entry);
  }
}

get("open-quests").addEventListener("click", () => {
  if (activity || fishing || dialogOpen()) return;
  keys.clear();
  if (refreshQuestDay()) save();
  get("quest-feedback").textContent = "";
  fillQuests();
  questsDialog.showModal();
});
get("close-quests").addEventListener("click", () => questsDialog.close());
for (const tab of get("quest-tabs").children) tab.addEventListener("click", () => {
  questTab = tab.dataset.questTab;
  get("quest-feedback").textContent = "";
  fillQuests();
});

const progressElements = [...document.querySelectorAll("[data-unlock]")];

function updateHud() {
  const shown = displayMinutes();
  const minute = Math.floor(shown);
  const minuteChanged = minute !== previousMinute;
  const remote = Archipelago.routes[saved.area];
  if (minuteChanged) {
    previousMinute = minute;
    const hour = Math.floor((minute % 1440) / 60);
    const padded = value => String(value).padStart(2, "0");
    const season = seasonAt(shown);
    const year = Math.floor(seasonSerial(shown) / seasons.length) + 1;
    const seasonLabel = get("season");
    seasonLabel.textContent = season.name[0];
    const seasonDay = calendarDay(shown) % seasonLength + 1;
    seasonLabel.title = `第 ${year} 年 · ${season.name}第 ${seasonDay} / ${seasonLength} 天`;
    seasonLabel.setAttribute("aria-label", seasonLabel.title);
    seasonLabel.dataset.season = season.id;
    get("day").textContent = `第 ${Math.floor(minute / 1440) + 1} 天`;
    get("time").textContent = `${padded(hour)}:${padded(minute % 60)}`;
    const weather = weatherAtTime(shown);
    const remaining = daysToMarket();
    get("market-status").textContent = marketDay() ? "行商今天在岛上" : `行商还有 ${remaining} 天登岛`;
    get("walk-market").hidden = Boolean(remote) || !marketDay();
    get("weather").textContent = weatherNames[weather];
    get("weather-icon").setAttribute("href", weather === "clear" ? (hour >= season.dusk + 1 || hour < season.dawn ? "#i-moon" : "#i-sun") : `#i-${weather}`);
  }
  if (minuteChanged || uiDirty) {
    get("compost-status").textContent = compostReady() ? `今日可领 ${built("shed") ? 2 : 1} 份` : "今日已领 · 明天补充";
    get("wait-market").hidden = Boolean(remote) || saved.progress.post || !saved.fruitCollected || marketDay();
  }
  if (!uiDirty && !minuteChanged) return;
  updateCoastalHud(minute);
  get("walk-crab-trap").hidden = !hasCrabTrap() || saved.area === "offshore";
  get("walk-crab-trap").textContent = saved.life.survey.trapDay !== null &&
    dayIndex() > saved.life.survey.trapDay ? "南岸蟹笼可以收了" : "去南岸蟹笼";
  if (!uiDirty) return;
  uiDirty = false;
  updateQuestBadge();
  readyResidentSpot = hasReadyCommission(saved.area) ? area().spots.find(spot => spot.type === "resident-shop") : null;
  if (readyResidentSpot) {
    residentTurnIn.style.left = `${readyResidentSpot.x * 100 / Island.W}%`;
    residentTurnIn.style.top = `${(readyResidentSpot.y - 23) * 100 / Island.H}%`;
    residentTurnIn.setAttribute("aria-label", `向${residentTaskContact()}交付委托`);
  }
  const unreadAlerts = saved.alerts.filter(alert => alert.unread).length;
  get("alert-count").hidden = unreadAlerts === 0;
  get("alert-count").textContent = unreadAlerts > 9 ? "9+" : String(unreadAlerts);
  get("open-alerts").setAttribute("aria-label", unreadAlerts ? `消息提醒，${unreadAlerts} 条未读` : "消息提醒");
  const { progress } = saved;
  for (const element of progressElements) element.hidden = !progress[element.dataset.unlock];
  get("walk-harbor").hidden = saved.area === "offshore" || (!remote && !progress.routes.length);
  get("advance").hidden = saved.area === "offshore";
  get("inventory-slots").style.setProperty("--stock-slots", 2 + Number(progress.fishing) + Number(progress.cooking));
  get("compost-access").hidden = Boolean(remote) || !progress.farming;
  get("market-visit").hidden = Boolean(remote);
  get("shell-stock").hidden = !saved.inventory.shell && !progress.building;
  get("seaweed-stock").hidden = !saved.inventory.seaweed;
  get("timber-stock").hidden = !saved.inventory.timber;
  get("walk-coop").hidden = !built("expansion");
  get("feed-stock").hidden = !built("expansion") || !saved.inventory.feed;
  get("stamina").value = saved.stamina;
  get("stamina-value").textContent = saved.stamina;
  for (const button of foodButtons) {
    const id = button.dataset.eat;
    button.disabled = Boolean(activity || fishing || !saved.inventory[id] || saved.stamina >= 100);
    if (Object.hasOwn(button.dataset, "extraFood")) button.hidden = !saved.inventory[id];
  }
  for (const [type, count] of Object.entries(saved.inventory)) {
    const field = get(`${type}-count`);
    if (field) field.textContent = count;
  }
  const seasonalSeed = cultivars[seasonAt(saved.minutes).crop].seed;
  get("seed-label").textContent = items[seasonalSeed].name;
  get("seed-count").textContent = saved.inventory[seasonalSeed];
  const seedVisual = get("seed-visual");
  if (seedVisual.dataset.item !== seasonalSeed) {
    seedVisual.replaceChildren(itemIcon(seasonalSeed));
    seedVisual.dataset.item = seasonalSeed;
  }
  const tasks = {
    fruit: saved.fruitCollected,
    sale: progress.firstSale || progress.post,
    post: progress.post
  };
  const taskCount = Object.values(tasks).filter(Boolean).length;
  get("guide-progress").textContent = taskCount === 3 ? "已完成" : `${taskCount}/3`;
  const guide = get("island-guide");
  const guideNext = get("guide-next");
  guideNext.hidden = progress.post;
  guideNext.textContent = !tasks.fruit ? "先在岛上摘些椰子和海岛果。" : !tasks.sale ?
    (marketDay() ? "行商到了。带水果去东南边的摊位。" : "收好水果。可以等到这周行商登岛再卖。") :
    `现在有 ${saved.inventory.coin} 贝币。攒到 ${postCoinGoal} 贝币就能使用海鸟邮局。`;
  if (taskCount === 3 && !guide.dataset.completed) {
    guide.open = false;
    guide.dataset.completed = "true";
  }
  for (const task of document.querySelectorAll("#tasks li")) {
    task.classList.toggle("done", tasks[task.dataset.task]);
    task.setAttribute("aria-label", `${task.textContent.trim()}，${tasks[task.dataset.task] ? "已完成" : "未完成"}`);
  }
  get("connect-deepseek").hidden = publicRelease;
  get("connect-deepseek").textContent = deepSeekReady ? "DeepSeek 已启用 · 更换密钥" : "连接 DeepSeek";
  const unread = unreadLetter();
  const waitingOnReply = saved.pending?.provider && !saved.pending.replyText && !saved.pending.failed;
  get("post-status").textContent = saved.pending ? (waitingOnReply ? "深海那边正在写回信，海鸥在等。" : "海鸥正在送信，约一小时半后回来。") :
    unread ? `${letterRecipient(letterAuthor(unread)).from}写了一封信给你。` :
    !progress.correspondents.length ? "海鸟在等第一封来信。可以用「等一等」往前走一段岛上时间。" :
    "可以给通讯录里的联系人回信。收到邻岛邀请后，船家会开放相应航线。";
  const indoors = saved.area === "cabin";
  postButton.firstChild.textContent = unread?.kind === "family" ? "读家书 " : unread ? "读来信 " : remote ? "回岛去邮局 " : indoors ? "出门去栈桥 " : "走向栈桥 ";
  get("location-name").textContent = saved.area === "offshore" ? "东岬垂钓船" : remote?.name ?? (indoors ? "岛上木屋" : (saved.name || "无名岛"));
  get("walk-harbor").querySelector("span").textContent = remote ? "返航" : "去码头";
  get("rename-island").title = saved.name ? `${saved.name} · 角色和游玩记录` : "角色与岛屿资料";
  get("scene-help").textContent = remote ? "点击岛上的人或物品互动，左侧码头可以返航。" :
    indoors ? (progress.post ? "书桌可以读信和写日记。门口通往岛上。" : "躺到床上可以休息到第二天。门口通往岛上。") :
    progress.post ? "点击岛上的人或物品，也可以走过去互动。" : "摘些水果，留给每周到访的行商。";
  canvas.setAttribute("aria-label", remote ? `${remote.name}的像素地图。点击地面移动，左侧码头返航。` : indoors ? "木屋室内。点击床、窗边信桌、灶台或门口互动" : "像素海岛地图。点击地面移动，靠近目标可互动");
}

const activityLabels = { "club-sail": "航行中…", sleep: "休息中…", sail: "航行中…", cook: "烹饪中…",
  "restaurant-prep": "餐厅备菜中…", reset: "重开小岛…" };

function updateAction() {
  const spot = nearest();
  active = !fishing && !activity && !player.walking && !route.length ? spot : null;
  const label = activity ? activityLabels[activity.kind] :
    fishing ? (fishing.phase === "wait" ? "等待咬钩…" : "收线") : spot ? spotLabel(spot) : "靠近目标互动";
  if (action.textContent !== label) action.textContent = label;
  action.disabled = Boolean(activity || (fishing ? fishing.phase === "wait" : !spot));
  get("walk-harbor").disabled = Boolean(activity || fishing);
  get("walk-coop").disabled = Boolean(activity || fishing);
  const blocked = dialogOpen();
  residentTurnIn.hidden = !readyResidentSpot || Boolean(activity || fishing || blocked);
  marker.hidden = !active || blocked;
  if (active) {
    const turnIn = active === readyResidentSpot;
    marker.style.left = `${active.x * 100 / Island.W}%`;
    marker.style.top = `${(turnIn ? active.y + 7 : active.markY) * 100 / Island.H}%`;
    marker.classList.toggle("below", turnIn || Boolean(active.markerBelow));
    if (marker.textContent !== label) marker.textContent = label;
  }
}

const musicBars = [
  { bass: 45, chord: [57, 60, 64, 67], lead: [76, 0, 79, 0, 81, 79, 76, 0] },
  { bass: 41, chord: [57, 60, 64, 69], lead: [72, 0, 76, 77, 0, 76, 72, 0] },
  { bass: 48, chord: [55, 59, 64, 67], lead: [71, 0, 74, 0, 76, 79, 76, 0] },
  { bass: 43, chord: [55, 59, 62, 69], lead: [74, 0, 0, 71, 69, 0, 74, 0] },
  { bass: 45, chord: [57, 60, 64, 67], lead: [76, 0, 79, 84, 0, 81, 79, 0] },
  { bass: 41, chord: [57, 60, 64, 69], lead: [77, 0, 76, 0, 72, 0, 69, 0] },
  { bass: 50, chord: [57, 60, 65, 69], lead: [72, 76, 0, 77, 81, 0, 77, 0] },
  { bass: 43, chord: [55, 59, 62, 69], lead: [74, 0, 71, 0, 69, 0, 67, 0] }
];
const weatherMix = {
  clear: { waves: .17, wind: .01, rain: 0, spray: 0, music: .54 },
  cloud: { waves: .14, wind: .065, rain: 0, spray: 0, music: .49 },
  rain: { waves: .105, wind: .025, rain: .052, spray: .011, music: .44 },
  storm: { waves: .17, wind: .155, rain: .081, spray: .033, music: .35 },
  snow: { waves: .065, wind: .035, rain: 0, spray: .009, music: .44 }
};
let audioMix;
let changingSound = false;

function chime(hz) {
  if (!soundOn || !audioMix) return;
  const now = audio.currentTime;
  const tone = audio.createOscillator();
  const envelope = audio.createGain();
  tone.type = "sine";
  tone.frequency.setValueAtTime(hz, now);
  tone.frequency.exponentialRampToValueAtTime(hz * 1.36, now + .13);
  envelope.gain.setValueAtTime(.001, now);
  envelope.gain.exponentialRampToValueAtTime(.065, now + .025);
  envelope.gain.exponentialRampToValueAtTime(.001, now + .28);
  tone.connect(envelope).connect(audioMix.effects);
  tone.start(now);
  tone.stop(now + .3);
}

function setUpSound() {
  audio = new (window.AudioContext || window.webkitAudioContext)();
  const samples = audio.sampleRate * 4;
  const foam = audio.createBuffer(1, samples, audio.sampleRate);
  const hiss = audio.createBuffer(1, samples, audio.sampleRate);
  const foamSamples = foam.getChannelData(0);
  const hissSamples = hiss.getChannelData(0);
  const random = Island.art.random(9057);
  let slow = 0;
  for (let i = 0; i < samples; i++) {
    const noise = random() * 2 - 1;
    slow = (slow + .025 * noise) / 1.025;
    foamSamples[i] = slow * 4.4;
    hissSamples[i] = noise * .58;
  }
  const master = audio.createGain();
  master.gain.value = .72;
  master.connect(audio.destination);
  const music = audio.createGain();
  music.gain.value = 0;
  music.connect(master);
  const effects = audio.createGain();
  effects.connect(master);
  const mallet = audio.createPeriodicWave(new Float32Array(5), new Float32Array([0, 1, .23, .075, .035]));
  const weather = {};
  for (const [name, buffer, type, frequency, rate] of [
    ["waves", foam, "lowpass", 640, .16],
    ["wind", foam, "bandpass", 360, .48],
    ["rain", hiss, "lowpass", 1280, .65],
    ["spray", hiss, "bandpass", 2050, 1.5]
  ]) {
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = .62;
    const swell = audio.createOscillator();
    swell.frequency.value = rate;
    const depth = audio.createGain();
    depth.gain.value = name === "wind" ? .30 : .14;
    const movement = audio.createGain();
    movement.gain.value = .8;
    const volume = audio.createGain();
    volume.gain.value = 0;
    swell.connect(depth).connect(movement.gain);
    source.connect(filter).connect(movement).connect(volume).connect(master);
    source.start(0, rate);
    swell.start();
    weather[name] = volume;
  }
  audioMix = { master, music, effects, mallet, weather, hiss, soundscape: "", next: 0, step: 0, timer: null };
}

function syncAudio() {
  if (!soundOn || !audioMix) return;
  const weather = weatherAtTime();
  const inside = saved.area === "cabin";
  const key = `${weather}:${inside}`;
  if (audioMix.soundscape === key) return;
  audioMix.soundscape = key;
  const mix = weatherMix[weather];
  const now = audio.currentTime;
  for (const [name, node] of Object.entries(audioMix.weather)) {
    node.gain.setTargetAtTime(mix[name] * (inside ? .28 : 1) * preferences.ambient / 100, now, .62);
  }
  audioMix.music.gain.setTargetAtTime(mix.music * (inside ? .88 : 1) * preferences.music / 100, now, .62);
  audioMix.effects.gain.setTargetAtTime(preferences.effects / 100, now, .12);
}

function musicNote(midi, start, length, volume, voice) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  if (voice === "mallet") oscillator.setPeriodicWave(audioMix.mallet);
  else oscillator.type = voice;
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, start + length);
  oscillator.connect(gain).connect(audioMix.music);
  oscillator.start(start);
  oscillator.stop(start + length + .01);
}

function percussion(start, kick) {
  const gain = audio.createGain();
  gain.connect(audioMix.music);
  if (kick) {
    const oscillator = audio.createOscillator();
    oscillator.frequency.setValueAtTime(83, start);
    oscillator.frequency.exponentialRampToValueAtTime(43, start + .12);
    gain.gain.setValueAtTime(.105, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .22);
    oscillator.connect(gain);
    oscillator.start(start);
    oscillator.stop(start + .23);
  } else {
    const source = audio.createBufferSource();
    source.buffer = audioMix.hiss;
    const filter = audio.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 5200;
    gain.gain.setValueAtTime(.039, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .092);
    source.connect(filter).connect(gain);
    source.start(start, .41, .10);
  }
}

function scheduleMusic() {
  if (!soundOn || document.hidden) return;
  const beat = 60 / 88;
  const now = audio.currentTime;
  if (audioMix.next < now) audioMix.next = now + .06;
  while (audioMix.next < now + .25) {
    const step = audioMix.step % 8;
    const bar = musicBars[Math.floor(audioMix.step / 8) % musicBars.length];
    const at = audioMix.next;
    if (step === 0 || step === 4) musicNote(bar.bass - (step === 4 ? 0 : 12), at, beat * 1.15, .105, "sine");
    if (step === 1 || step === 5 || step === 7) {
      for (const note of bar.chord) musicNote(note, at, beat * .77, .028, "triangle");
    }
    if (bar.lead[step]) musicNote(bar.lead[step], at, beat * .85, .070, "mallet");
    if (step === 0 || step === 4) percussion(at, true);
    else if (step % 2) percussion(at + .018, false);
    audioMix.step++;
    audioMix.next += beat / 2;
  }
}

async function toggleSound() {
  if (changingSound) return;
  changingSound = true;
  const button = get("sound");
  const settingsButton = get("settings-sound");
  button.disabled = settingsButton.disabled = true;
  try {
    if (!audio) setUpSound();
    if (soundOn) {
      await audio.suspend();
      soundOn = false;
      clearInterval(audioMix.timer);
      audioMix.timer = null;
    } else {
      await audio.resume();
      soundOn = true;
      syncAudio();
      scheduleMusic();
      audioMix.timer = setInterval(scheduleMusic, 90);
    }
    button.setAttribute("aria-pressed", String(soundOn));
    button.setAttribute("aria-label", soundOn ? "关闭音乐和环境音" : "开启音乐和环境音");
    button.querySelector("use").setAttribute("href", soundOn ? "#i-sound" : "#i-mute");
    settingsButton.textContent = soundOn ? "关闭声音" : "开启声音";
    settingsButton.setAttribute("aria-pressed", String(soundOn));
  } catch {
    const message = "当前浏览器无法播放音乐和环境音";
    if (settingsDialog.open) get("settings-feedback").textContent = message;
    else notify(message);
  } finally {
    changingSound = false;
    button.disabled = settingsButton.disabled = false;
  }
}

get("sound").addEventListener("click", toggleSound);
get("settings-sound").addEventListener("click", toggleSound);

const settingsKey = "tidal-letters-settings-v1";
const preferenceDefaults = { music: 100, ambient: 100, effects: 100, pace: "normal", motion: "system" };
const clockPaces = { slow: .5, normal: 1, fast: 2 };

function readPreferences() {
  const result = { ...preferenceDefaults };
  try {
    const stored = JSON.parse(localStorage.getItem(settingsKey));
    for (const key of ["music", "ambient", "effects"]) {
      if (Number.isFinite(stored?.[key])) result[key] = Math.max(0, Math.min(100, stored[key]));
    }
    if (Object.hasOwn(clockPaces, stored?.pace)) result.pace = stored.pace;
    if (["system", "full", "reduced"].includes(stored?.motion)) result.motion = stored.motion;
  } catch {
    // The island stays playable when the browser blocks saved preferences.
  }
  return result;
}

const preferences = readPreferences();

const releases = [
  { version: "0.8.3", date: "2026-11-19", changes: [
    "拿到蟹笼后解锁海藻蒸蟹、椰香蟹汤，老纪的鱼摊开始买卖螃蟹。",
    "西岸畜舍可扩到 8 个饲养位并繁殖鸡鸭。老纪和阿澄收购成年的鸡鸭。",
    "修复从海边餐厅前往西岸畜舍时，自动路线在岸边中断的问题。"
  ] },
  { version: "0.8.2", date: "2026-11-19", changes: [
    "重绘海边餐厅与潮汐露台，增加遮阳座位、木板步道和夜间窗灯。",
    "修复主岛海岸遮住餐厅的问题，餐厅入口与新的画面对齐。",
    "餐厅可以按份数转入成品、使用食材现做和补菜，并显示缺少的食材与开门条件。"
  ] },
  { version: "0.8.1", date: "2026-11-19", changes: [
    "岛上手记开放委托板，每个岛上日至少有一项新委托可接。",
    "新增本岛采集、补货、垂钓和邻岛订单。已接委托可跨天推进。"
  ] },
  { version: "0.8.0", date: "2026-11-19", changes: [
    "西岸沙洲后可以建设东岬湾、垂钓俱乐部和潮汐露台。第三片完工后开放海边餐厅。",
    "新增两处出海钓点、带客航次、周三钓鱼比赛、午餐营业和经营账本。",
    "第一次在北岬岛与老纪交谈即可获知潮生岛的位置。",
    "完成老纪的委托可获得蟹笼和洄湾研究岛航线，新增蟹类图鉴和水产研究委托。",
    "提交扩岛工程后，阿岩寄来开工通知，地块在下一个岛上日完工。",
    "开始养殖后，灯塔小铺收购鸡蛋和鸭蛋。也可在畜舍以 30% 成功率孵蛋。"
  ] },
  { version: "0.7.3", date: "2026-11-19", changes: [
    "行商和邻岛商店支持按 1 份、10 份或可交易的最大数量买卖。",
    "提高岛屿和木屋的绘制分辨率，更新浅水、浪花与地形细节。",
    "可交付的委托在居民头上和航图显示叹号，消息顶部可一键标为已读。"
  ] },
  { version: "0.7.2", date: "2026-11-19", changes: [
    "收到对方的第一封来信后，才会在通讯录里见到对方并可以回信。",
    "邻岛居民会陆续寄来介绍信，后续的邀请信会开放对应航线。"
  ] },
  { version: "0.7.1", date: "2026-11-19", changes: [
    "新岛从采水果和行商交易开始，攒到 12 贝币后启用海鸟邮局。",
    "居民回信逐步开放航线、钓鱼与种田，妈妈的信带来灶台食谱。"
  ] },
  { version: "0.7.0", date: "2026-11-19", changes: [
    "设置新增炸岛重开，可确认后观看像素转场并创建新岛。",
    "设置新增开发者署名、当前版本号和更新日志。"
  ] },
  { version: "0.6.0", date: "2026-11-19", changes: [
    "居民聊天接入 DeepSeek，新增可跨日完成的随机委托。",
    "开放歧石岛、贷款扩岛和西岸鸡鸭养殖。"
  ] },
  { version: "0.5.0", date: "2026-11-19", changes: [
    "木屋新增日记和食谱，外岛居民可对话、交易和发布委托。",
    "新增长椅、堆肥棚和西岸扩岛。"
  ] },
  { version: "0.4.0", date: "2026-11-18", changes: [
    "公开试玩上线，新增游戏设置和任务奖励，调低阵雨音量。",
    "公开版海鸟邮局默认启用 DeepSeek 回信和家书。"
  ] }
];

function fillUpdateLog() {
  get("game-version").textContent = `v${releases[0].version}`;
  const entries = releases.map(({ version, date, changes }) => {
    const row = document.createElement("li");
    const heading = document.createElement("strong");
    heading.textContent = `v${version}`;
    const stamp = document.createElement("time");
    stamp.dateTime = date;
    stamp.textContent = date;
    const notes = document.createElement("ul");
    for (const change of changes) {
      const note = document.createElement("li");
      note.textContent = change;
      notes.append(note);
    }
    row.append(heading, stamp, notes);
    return row;
  });
  get("update-log").replaceChildren(...entries);
}

function useReducedMotion() {
  return preferences.motion === "reduced" || (preferences.motion === "system" && reducedMotion.matches);
}

function fillSettings() {
  for (const name of ["music", "ambient", "effects"]) {
    get(`${name}-level`).value = preferences[name];
    get(`${name}-value`).textContent = `${preferences[name]}%`;
  }
  get("time-pace").value = preferences.pace;
  get("motion-pref").value = preferences.motion;
}

function applyPreferences(saveMessage) {
  document.documentElement.dataset.motion = preferences.motion;
  if (audioMix) {
    audioMix.soundscape = "";
    syncAudio();
  }
  if (!saveMessage) return;
  try {
    localStorage.setItem(settingsKey, JSON.stringify(preferences));
    get("settings-feedback").textContent = saveMessage;
  } catch {
    get("settings-feedback").textContent = "已应用到当前页面，浏览器未保存偏好。";
  }
}

get("open-settings").addEventListener("click", () => {
  if (activity || fishing || dialogOpen()) return;
  keys.clear();
  get("settings-feedback").textContent = "偏好会自动保存";
  fillSettings();
  settingsDialog.showModal();
});
get("close-settings").addEventListener("click", () => settingsDialog.close());
for (const name of ["music", "ambient", "effects"]) {
  get(`${name}-level`).addEventListener("input", event => {
    preferences[name] = Number(event.target.value);
    get(`${name}-value`).textContent = `${preferences[name]}%`;
    applyPreferences("已保存");
  });
}
get("time-pace").addEventListener("change", event => {
  preferences.pace = event.target.value;
  applyPreferences("已保存");
});
get("motion-pref").addEventListener("change", event => {
  preferences.motion = event.target.value;
  applyPreferences("已保存");
});
get("restore-settings").addEventListener("click", () => {
  Object.assign(preferences, preferenceDefaults);
  fillSettings();
  applyPreferences("已恢复默认设置");
});

function isFlatDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
}

function deviceDescription() {
  const ua = navigator.userAgent;
  const system = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad" :
    /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Macintosh|Mac OS/.test(ua) ? "Mac" :
      /Linux/.test(ua) ? "Linux" : "未知设备";
  const browser = /Edg/.test(ua) ? "Edge" : /Chrome|CriOS/.test(ua) ? "Chrome" :
    /Firefox|FxiOS/.test(ua) ? "Firefox" : /Version.*Safari/.test(ua) ? "Safari" : "内嵌或其他浏览器";
  return `${system} · ${browser}`;
}

function startPlaySession() {
  if (activeSession || !saved.profile) return;
  const now = Date.now();
  activeSession = {
    started: now, updated: now, device: deviceDescription(), seconds: 0,
    day: dayIndex() + 1, fish: 0, crops: 0, meals: 0, letters: 0
  };
  saved.sessions.unshift(activeSession);
  save();
}

function recordPlay(field, amount = 1) {
  if (activeSession) activeSession[field] += amount;
}

function duration(seconds) {
  return seconds < 60 ? `${Math.floor(seconds)} 秒` : `${Math.floor(seconds / 60)} 分 ${Math.floor(seconds % 60)} 秒`;
}

function showPlayHistory() {
  get("island-id").textContent = saved.islandId;
  get("device-name").textContent = deviceDescription();
  const all = saved.sessions;
  get("play-summary").textContent = `打开过 ${all.length} 次 · 游玩 ${duration(all.reduce((total, item) => total + item.seconds, 0))}`;
  const history = get("play-history");
  history.replaceChildren();
  const date = new Intl.DateTimeFormat("zh-CN", { dateStyle: "short", timeStyle: "short" });
  for (const item of all) {
    const row = document.createElement("li");
    row.textContent = `${date.format(new Date(item.started))} · 第 ${item.day} 天 · ${duration(item.seconds)}`;
    const details = document.createElement("small");
    details.textContent = `${item.device} · 钓鱼 ${item.fish ?? 0} · 收获 ${item.crops ?? 0} · 做饭 ${item.meals ?? 0} · 寄信 ${item.letters ?? 0}`;
    row.append(details);
    history.append(row);
  }
}

function updateAvatarPreview() {
  const portrait = document.createElement("canvas");
  portrait.width = 30;
  portrait.height = 30;
  Island.art.avatar(portrait.getContext("2d"), {
    x: 14, y: 26, facing: "down", walking: false, gender: get("player-gender").value
  }, 0);
  get("avatar-preview").src = portrait.toDataURL();
}

get("player-gender").addEventListener("change", updateAvatarPreview);

function openNaming(first = false) {
  if (!first && (activity || fishing || dialogOpen())) return;
  keys.clear();
  const known = Boolean(saved.profile);
  get("name-title").textContent = known ? "角色与岛屿" : "创建你的角色";
  get("name-intro").hidden = !first || Boolean(saved.name);
  get("skip-name").hidden = !known;
  get("play-profile").hidden = !known;
  get("player-name").value = saved.profile?.name || "";
  get("player-birthday").value = saved.profile?.birthday || "";
  const today = new Date();
  get("player-birthday").max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  get("player-gender").value = saved.profile?.gender || "";
  updateAvatarPreview();
  get("island-name").value = saved.name || "";
  if (known) showPlayHistory();
  nameDialog.showModal();
}

get("rename-island").addEventListener("click", () => openNaming());
get("skip-name").addEventListener("click", () => nameDialog.close());
nameDialog.addEventListener("cancel", event => {
  if (!saved.profile) event.preventDefault();
});
get("name-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = get("player-name");
  const name = input.value.trim();
  const birthday = get("player-birthday").value;
  if (!name) {
    input.setCustomValidity("请输入角色名字。");
    input.reportValidity();
    return;
  }
  if (!isFlatDate(birthday)) return;
  saved.profile = { name, birthday, gender: get("player-gender").value };
  player.gender = saved.profile.gender;
  saved.name = get("island-name").value.trim() || "无名岛";
  nameDialog.close();
  arrivalInProgress = false;
  startPlaySession();
  uiDirty = true;
  save();
  notify(`${name}，欢迎来到${saved.name}`);
});
get("player-name").addEventListener("input", event => event.currentTarget.setCustomValidity(""));
function openResetWarning() {
  if (resetting || resetDialog.open || !saved.profile) return;
  get("reset-error").hidden = true;
  resetDialog.showModal();
  get("cancel-reset").focus();
}

get("settings-reset").addEventListener("click", openResetWarning);
get("reset-game").addEventListener("click", openResetWarning);
get("cancel-reset").addEventListener("click", () => resetDialog.close());
get("confirm-reset").addEventListener("click", () => {
  if (resetting || !resetDialog.open) return;
  const backdrop = Island.sceneContext();
  Island.draw(backdrop, { ...islandScene(saved.minutes), elapsed: 0, player: null, fishing: null, target: null });
  try {
    if (islandChangedInStorage()) {
      reloadIsland();
      return;
    }
    const freshSave = JSON.stringify(initialIsland());
    localStorage.setItem(activeStorageKey, freshSave);
    if (activeStorageKey === storageKey) {
      try {
        // Tabs still running an older build only write to the old key.
        localStorage.setItem(restartStorageKey, freshSave);
        localStorage.removeItem(storageKey);
      } catch {
        // The fresh save is already in the current slot.
      }
    }
  } catch {
    const error = get("reset-error");
    error.textContent = "浏览器未能写入新岛存档，请再试一次。";
    error.hidden = false;
    return;
  }
  resetting = true;
  const reduced = useReducedMotion();
  const duration = reduced ? 1 : 2.85;
  resetCutscene = { backdrop: backdrop.canvas, reduced, start: performance.now(), duration };
  for (const pane of gameDialogs) if (pane.open) pane.close();
  beginActivity("reset", duration, "小岛即将重开…");
  updateAction();
  canvas.scrollIntoView({ block: "nearest" });
  setTimeout(reloadIsland, duration * 1000);
});

function revealIsland() {
  if (saved.profile) return;
  if (!arrivalInProgress || useReducedMotion()) {
    openNaming(true);
    return;
  }
  const fog = get("arrival");
  fog.hidden = false;
  setTimeout(() => {
    fog.hidden = true;
    openNaming(true);
  }, 2600);
}

function islandScene(shown) {
  const season = seasonAt(shown);
  return {
    elapsed: useReducedMotion() ? 0 : elapsed, hour: lightHour(shown % 1440 / 60, season), season: season.id,
    weather: weatherAtTime(shown), player, harvested,
    showMarket: marketDay(), showShell: saved.progress.building && quakeBeach() && !harvested("ancient-shell"),
    showTimber: saved.progress.building,
    compostReady: compostReady(), projects: saved.life.built, animals: saved.life.coop.animals, day: dayIndex(),
    lunch: saved.life.ventures.dining.shift, restaurantPrep: activity?.kind === "restaurant-prep",
    trapPlaced: saved.life.survey.trapDay !== null,
    crops: saved.plots.map((plot, index) => ({ stage: cropStage(index), crop: plot?.crop })),
    pending: birdFlight && !useReducedMotion() ? birdFlight.phase : saved.pending ? "away" : "home",
    flightSeconds: birdFlight ? elapsed - birdFlight.start : 0,
    fishing: fishing?.phase, tugging: fishing?.phase === "fight" && pullPressure(fishing),
    cooking: activity?.kind === "cook", sleeping: activity?.kind === "sleep",
    sleepProgress: activity?.kind === "sleep" ? activityProgress() : 0,
    target: route[route.length - 1] || (hovered && { x: hovered.x, y: hovered.y })
  };
}

function frame(now) {
  requestAnimationFrame(frame);
  if (resetting) {
    if (resetCutscene) {
      const { backdrop, reduced, start, duration } = resetCutscene;
      Island.drawReset(ctx, backdrop, Math.min(1, (now - start) / (duration * 1000)), reduced);
    }
    return;
  }
  const visibleSeconds = lastFrame ? (now - lastFrame) / 1000 : 0;
  const dt = Math.min(visibleSeconds, .05);
  lastFrame = now;
  if (document.hidden) return;
  elapsed += dt;
  if (activeSession) activeSession.seconds += visibleSeconds;
  const contest = saved.area === "offshore" && !activeFishingSession()?.water;
  if (!dialogOpen() && !activity && !contest) saved.minutes += dt * clockPaces[preferences.pace];
  updateActivity();
  updateIsland();
  updateVentures();
  updateMail();
  updateIslandMail();
  move(dt);
  updateFishing(dt);
  updateHud();
  updateAction();
  syncAudio();
  if (elapsed - lastSave >= 5) {
    save();
    lastSave = elapsed;
  }
  if (birdFlight && elapsed - birdFlight.start > 6) birdFlight = null;
  if (sailDialog.open) drawOpenChart();
  const scene = islandScene(displayMinutes());
  if (activity?.kind === "sail") {
    const progress = activityProgress();
    const message = progress < .24 ? "解缆出港…" : progress < .76 ? `驶往${activity.passage.name}…` : "正在靠岸…";
    if (get("activity").textContent !== message) get("activity").textContent = message;
    Archipelago.drawVoyage(ctx, scene, useReducedMotion() ? .54 : progress);
  } else if (activity?.kind === "club-sail") {
    Archipelago.drawVoyage(ctx, scene, useReducedMotion() ? .54 : activityProgress());
  } else {
    area().draw(ctx, scene);
  }
}

function lifeButton(text, onClick, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "action";
  button.textContent = text;
  button.disabled = disabled;
  button.addEventListener("click", onClick);
  return button;
}

function lifeCard(title, description, icon) {
  const row = document.createElement("li");
  const body = document.createElement("div");
  const heading = document.createElement("h3");
  const detail = document.createElement("p");
  heading.textContent = title;
  detail.textContent = description;
  body.append(heading, detail);
  if (icon) row.append(itemIcon(icon));
  row.append(body);
  return { row, body };
}

function lifeStatus(text) {
  const status = document.createElement("span");
  status.className = "life-status";
  status.textContent = text;
  return status;
}

function itemAmounts(entries, withStock = false) {
  const list = document.createElement("div");
  list.className = "quest-reward";
  for (const [id, count] of Object.entries(entries)) {
    const item = document.createElement("span");
    item.append(itemIcon(id), `${rewardName(id)} × ${count}${withStock ? `（有 ${saved.inventory[id]}）` : ""}`);
    list.append(item);
  }
  return list;
}

function hasStock(entries) {
  return Object.entries(entries).every(([id, count]) => saved.inventory[id] >= count);
}

function cookingPlan(recipe, quantity) {
  const ingredients = Object.fromEntries(Object.entries(recipe.ingredients).map(([id, count]) => [id, count * quantity]));
  let unfilledCrabs = recipe.crab ? quantity : 0;
  for (const crab of crabs) {
    if (!unfilledCrabs) break;
    const count = Math.min(unfilledCrabs, saved.inventory[crab.id]);
    if (count) ingredients[crab.id] = count;
    unfilledCrabs -= count;
  }
  const energy = cookingEnergy * quantity;
  const missing = Object.entries(ingredients).flatMap(([id, count]) =>
    saved.inventory[id] < count ? [`${items[id].name} × ${count - saved.inventory[id]}`] : []);
  if (unfilledCrabs) missing.push(`螃蟹 × ${unfilledCrabs}`);
  if (saved.stamina < energy) missing.push(`体力 ${energy - saved.stamina} 点`);
  return { ingredients, unfilledCrabs, energy, missing };
}

function finishCooking(recipe, quantity, stock) {
  const { ingredients, energy, missing } = cookingPlan(recipe, quantity);
  if (missing.length) return false;
  saved.stamina -= energy;
  for (const [id, count] of Object.entries(ingredients)) saved.inventory[id] -= count;
  stock[recipe.id] += quantity;
  recordPlay("meals", quantity);
  recordQuest("cook", quantity, recipe.id);
  return true;
}

function recipeKnown(recipe) {
  if (!recipe || (recipe.restaurantOnly && !saved.life.ventures.dining.opened)) return false;
  if (recipe.crab) return hasCrabTrap();
  return recipe.id === "soup" || Object.keys(recipe.ingredients).every(id => saved.life.ingredients.includes(id));
}

function discoverIngredients() {
  const newItems = recipeIngredients.filter(id => saved.inventory[id] && !saved.life.ingredients.includes(id));
  if (!newItems.length) return;
  const unseen = recipes.filter(recipe => !recipeKnown(recipe));
  saved.life.ingredients.push(...newItems);
  const unlocked = unseen.filter(recipeKnown);
  if (unlocked.length) addAlert("食谱解锁", `小灶台收录了${unlocked.map(recipe => items[recipe.id].name).join("、")}的食谱。`);
}

function updateRecipe() {
  const list = get("recipe-list");
  list.replaceChildren();
  const visible = recipes.filter(recipe => (!recipe.expansionOnly || built("expansion")) &&
    (!recipe.restaurantOnly || saved.life.ventures.dining.opened) && (!recipe.crab || hasCrabTrap()));
  const known = visible.filter(recipeKnown);
  get("recipe-count").textContent = `已解锁 ${known.length} / ${visible.length} 道菜。发现新食材后，食谱会记在这里。`;
  get("cook-note").textContent = saved.stamina < cookingEnergy ?
    `还剩不到 ${cookingEnergy} 点体力，先吃点东西或休息。` : `做一道菜消耗 ${cookingEnergy} 点体力。`;
  for (const recipe of visible) {
    const unlocked = recipeKnown(recipe);
    const { name, energy } = items[recipe.id];
    const { row, body } = lifeCard(name, unlocked ? `食用恢复 ${energy} 点体力` : "发现全部食材后解锁", recipe.id);
    const plan = cookingPlan(recipe, 1);
    body.append(itemAmounts(plan.ingredients, unlocked));
    if (plan.unfilledCrabs) {
      const note = document.createElement("p");
      note.textContent = "还需任一种螃蟹 × 1";
      body.append(note);
    }
    row.append(unlocked ? lifeButton("烹饪", () => cook(recipe), Boolean(plan.missing.length)) : lifeStatus("待解锁"));
    if (unlocked) row.lastElementChild.setAttribute("aria-label", `烹饪${name}`);
    list.append(row);
  }
}

function cook(recipe) {
  if (!cookDialog.open || activity || saved.area !== "cabin" || !recipeKnown(recipe) ||
      cookingPlan(recipe, 1).missing.length) return;
  Object.assign(player, { x: 330, y: 156, facing: "up" });
  cookDialog.close();
  beginActivity("cook", 3, `正在做${items[recipe.id].name}…`);
  activity.recipe = recipe;
}

get("close-cook").addEventListener("click", () => cookDialog.close());
get("close-desk").addEventListener("click", () => deskDialog.close());
get("desk-letters").addEventListener("click", () => {
  deskDialog.close();
  openLetters(false, true);
});

const diaryPicker = get("diary-day");
const diaryText = get("diary-text");
const diaryDrafts = new Map();

function fillDiaryDays(selected = dayIndex()) {
  const days = new Set([dayIndex(), ...Object.keys(saved.life.diary).map(Number), ...diaryDrafts.keys()]);
  diaryPicker.replaceChildren(...[...days].sort((a, b) => b - a).map(day => {
    const option = document.createElement("option");
    const date = `${seasonAt(day * 1440).name} · 第 ${day + 1} 天`;
    option.value = String(day);
    option.textContent = day === dayIndex() ? `今天 · ${date}` : date;
    return option;
  }));
  diaryPicker.value = String(selected);
  fillDiaryPage();
}

function fillDiaryPage() {
  const day = Number(diaryPicker.value);
  diaryText.value = diaryDrafts.get(day) ?? saved.life.diary[day] ?? "";
  get("diary-note").textContent = "";
  get("save-diary").disabled = !diaryText.value.trim();
}

get("desk-diary").addEventListener("click", () => {
  deskDialog.close();
  fillDiaryDays();
  diaryDialog.showModal();
});
get("close-diary").addEventListener("click", () => diaryDialog.close());
diaryPicker.addEventListener("change", fillDiaryPage);
diaryText.addEventListener("input", () => {
  diaryDrafts.set(Number(diaryPicker.value), diaryText.value);
  get("save-diary").disabled = !diaryText.value.trim();
  get("diary-note").textContent = "";
});
get("diary-form").addEventListener("submit", event => {
  event.preventDefault();
  const day = Number(diaryPicker.value);
  const text = diaryText.value.trim().slice(0, 1200);
  if (!diaryDialog.open || !Number.isSafeInteger(day) || day < 0 || day > dayIndex() || !text) return;
  saved.life.diary[day] = text;
  diaryDrafts.delete(day);
  save();
  get("diary-note").textContent = autoSave ? "已保存到岛上日记" : "浏览器暂时无法保存";
});

let talkingSpot = null;
const residentChats = new Map();

function residentChat(id) {
  if (!residentChats.has(id)) {
    residentChats.set(id, { question: "", line: residentConversation(id).greeting, history: [], status: "", pending: false });
  }
  return residentChats.get(id);
}

function syncResidentChat(id) {
  const chat = residentChat(id);
  const playerLine = get("resident-player-line");
  playerLine.hidden = !chat.question;
  playerLine.textContent = chat.question ? `你 · ${chat.question}` : "";
  get("resident-line").textContent = chat.line;
  get("resident-chat-note").textContent = chat.pending ? `${residentConversation(id).name}正在想怎么回答…` : chat.status;
  get("resident-topic").disabled = chat.pending;
  get("resident-chat-form").hidden = !residentDialogueReady;
  get("resident-chat-text").disabled = chat.pending;
  get("resident-chat-send").disabled = chat.pending;
}

async function speakToResident(message) {
  const id = saved.area;
  const resident = residentConversation(id);
  if (!residentDialog.open || !resident || !message) return;
  const chat = residentChat(id);
  if (chat.pending) return;
  chat.question = message;
  if (!residentDialogueReady) {
    chat.line = resident.answer;
    chat.status = "";
    syncResidentChat(id);
    return;
  }
  chat.pending = true;
  syncResidentChat(id);
  try {
    const { text } = await api("/reply", {
      id: crypto.randomUUID(), kind: "dialogue", character: resident.portrait, message,
      context: { season: seasonAt(saved.minutes).name, weather: weatherNames[weatherAtTime()] },
      history: chat.history
    });
    if (typeof text !== "string" || !text.trim()) throw new Error("deepseek_unavailable");
    chat.line = Array.from(text.trim()).slice(0, 180).join("");
    chat.history = [...chat.history, { question: message, answer: chat.line }].slice(-2);
    chat.status = "DeepSeek 生成的对话";
  } catch (error) {
    chat.line = resident.answer;
    chat.status = ["deepseek_daily_limit", "deepseek_dialogue_limit"].includes(error.message)
      ? "今日的 DeepSeek 对话额度已用完，当前使用本地台词。" : "DeepSeek 暂时无法回复，当前使用本地台词。";
  } finally {
    chat.pending = false;
    if (residentDialog.open && saved.area === id) syncResidentChat(id);
  }
}

function openResident(spot) {
  const resident = residentConversation(saved.area);
  if (!resident) return;
  keys.clear();
  talkingSpot = spot;
  get("resident-name").textContent = resident.name;
  get("resident-portrait").src = Archipelago.portrait(resident.portrait);
  get("resident-topic").textContent = resident.topic;
  if (saved.area === "headland" && !hasRoute("tidal")) {
    saved.progress.routes.push("tidal");
    residentChat("headland").line = "北岬西南有座潮生岛，退潮后能捡海藻和古贝。我已经把它标在船家的航图上。";
    addAlert("老纪指路 · 潮生岛", "潮生岛是资源岛。回自家码头，就能在船家的航图上选择这条航线。");
    save();
  }
  get("resident-shop").hidden = saved.area === "qishi";
  get("resident-chat-text").value = "";
  syncResidentChat(saved.area);
  fillResidentOffers();
  residentDialog.showModal();
}

get("close-resident").addEventListener("click", () => residentDialog.close());
get("resident-topic").addEventListener("click", () => {
  if (residentDialog.open) speakToResident(residentConversation(saved.area).topic);
});
get("resident-chat-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!residentDialogueReady || !residentDialog.open || residentChat(saved.area).pending) return;
  const input = get("resident-chat-text");
  const message = input.value.trim();
  if (!message) return;
  input.value = "";
  speakToResident(message);
});
get("resident-shop").addEventListener("click", () => {
  if (!residentDialog.open || saved.area === "qishi" || !area().spots.includes(talkingSpot)) return;
  residentDialog.close();
  openMarket(talkingSpot);
});

function dailyCommission(id) {
  const { residentOffers, residentBacklog } = saved.life;
  const prior = residentOffers[id];
  const day = dayIndex();
  if (prior?.day === day) return prior;
  if (prior?.state === "active" && prior.day < day) residentBacklog[id].push(prior);
  const season = seasonAt(saved.minutes).id;
  const eligible = residentTaskPools[id].filter(task => {
    const feature = task.feature ?? questFeature[task.event] ?? (task.event === "water" ? "farming" : null);
    const route = task.route ?? (Archipelago.routes[task.area] ? task.area : null);
    return (!feature || saved.progress[feature]) && (!route || hasRoute(route)) &&
      (!task.seasons || task.seasons.includes(season)) &&
      (!task.recipe || recipeKnown(recipes.find(recipe => recipe.id === task.recipe))) &&
      (!task.livestock || saved.life.coop.animals.some(animal => animal.kind === task.livestock)) &&
      (!task.facility || built(task.facility)) && (!task.trap || saved.life.survey.fisherTasks >= 5);
  });
  const different = eligible.filter(task => task.id !== prior?.task);
  const choices = different.length ? different : eligible;
  let hash = 2166136261;
  for (const char of `${saved.islandId}:${id}:${day}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const task = choices[(hash >>> 0) % choices.length];
  const entry = { task: task.id, day, state: "offered", progress: 0 };
  residentOffers[id] = entry;
  save();
  return entry;
}

function residentOrders(id) {
  const today = saved.life.residentOffers[id];
  return today ? [today, ...saved.life.residentBacklog[id]] : saved.life.residentBacklog[id];
}

function commission(id, slot, order = saved.life.residentOffers[id]) {
  if (slot === "intro") {
    const entry = saved.life.commissions[id];
    return { task: residents[id], entry, state: entry?.done ? "done" : entry ? "active" : "offered" };
  }
  return { task: randomCommissionTask(id, order?.task), entry: order, state: order?.state };
}

function commissionReady(id, slot, order) {
  const { task, entry, state } = commission(id, slot, order);
  return state === "active" && (!(task.fresh || task.event) || entry.progress >= task.count) &&
    (!task.item || saved.inventory[task.item] >= task.count);
}

function residentTaskContact() {
  return saved.area === "research" ? "水产专家林澜" : residents[saved.area].name;
}

function readyCommissions(id) {
  const intro = id === "island" ? 0 : Number(commissionReady(id, "intro"));
  return intro + residentOrders(id).filter(order => commissionReady(id, "random", order)).length;
}

function hasReadyCommission(id) {
  if (id === "research") return researchReadyCount() > 0;
  return Object.hasOwn(residents, id) && readyCommissions(id) > 0;
}

function commissionProgress({ task, entry, state }) {
  if (state === "done") return "已完成";
  if (state === "skipped") return "已放弃";
  if (state !== "active") return "未接取";
  const held = task.item ? `背包 ${Math.min(saved.inventory[task.item], task.count)} / ${task.count}` : "";
  const progress = task.fresh || task.event ? `进度 ${entry.progress} / ${task.count}` : "";
  return [progress, held].filter(Boolean).join(" · ");
}

function trackResidentProgress(event, amount, item = null) {
  const intro = saved.life.commissions.headland;
  if (intro && !intro.done && event === "fish" && item === residents.headland.item) {
    intro.progress = Math.min(residents.headland.count, intro.progress + amount);
  }
  for (const id of Object.keys(residentTaskPools)) for (const entry of residentOrders(id)) {
    if (entry.state !== "active") continue;
    const task = randomCommissionTask(id, entry.task);
    if (task.event === event && (!task.target || task.target === item) && (!task.area || task.area === saved.area)) {
      entry.progress = Math.min(task.count, entry.progress + amount);
    }
  }
}

function fillResidentOffers() {
  const id = saved.area;
  const offers = get("resident-offers");
  offers.replaceChildren();
  if (id === "qishi") {
    fillBuilderOffer(offers);
    fillCoastalPlans(offers);
    return;
  }
  if (id === "headland") fillFisherMilestones(offers);
  fillReferralOffer(offers, id);
  dailyCommission(id);
  appendResidentOffer(offers, id, "intro");
  for (const entry of residentOrders(id)) appendResidentOffer(offers, id, "random", entry);
}

function appendResidentOffer(offers, id, slot, order) {
  const row = commission(id, slot, order);
  const { task, entry, state } = row;
  const random = slot === "random";
  const offer = document.createElement("section");
  offer.className = "life-offer";
  const label = document.createElement("p");
  label.className = "commission-kind";
  label.textContent = random ? (entry.day < dayIndex() ? `第 ${entry.day + 1} 天接续` : "今日委托") : "常驻委托";
  const heading = document.createElement("h3");
  heading.textContent = task.task;
  const detail = document.createElement("p");
  detail.textContent = state === "done" ? (task.thanks ?? "辛苦啦。报酬已经放进你的背包。") :
    state === "skipped" ? "这项委托已放弃，明天会刷新。" : task.request;
  offer.append(label, heading, detail);
  if (state === "offered" || state === "active") {
    offer.append(itemAmounts(task.reward));
    const actions = document.createElement("div");
    actions.className = "life-actions";
    const ready = commissionReady(id, slot, entry);
    if (state === "active") actions.append(lifeStatus(ready ? "可交付" : commissionProgress(row)));
    if (state === "offered") {
      actions.append(lifeButton(random ? "接受随机委托" : "接受委托", () => handleCommission(id, slot, "accept", entry)));
    } else {
      actions.append(lifeButton(random ? "交付随机委托" : "交付委托", () => handleCommission(id, slot, "finish", entry), !ready));
      if (random) {
        const skip = lifeButton("放弃随机委托", () => handleCommission(id, slot, "skip", entry));
        skip.className = "setup-link";
        actions.append(skip);
      }
    }
    offer.append(actions);
  }
  offers.append(offer);
}

function handleCommission(id, slot, action, order) {
  if (!residentDialog.open || id !== saved.area || !area().spots.includes(talkingSpot)) return;
  if (applyCommissionAction(id, slot, action, order)) fillResidentOffers();
}

function applyCommissionAction(id, slot, action, order) {
  const { task, entry, state } = commission(id, slot, order);
  if (slot === "random" && (!entry || !residentOrders(id).includes(entry))) return false;
  if (action === "accept" && state === "offered") {
    if (slot === "intro") saved.life.commissions[id] = { done: false, progress: 0 };
    else {
      if (entry.day !== dayIndex()) return false;
      entry.state = "active";
    }
  } else if (action === "finish" && commissionReady(id, slot, entry)) {
    if (task.item) saved.inventory[task.item] -= task.count;
    for (const [item, count] of Object.entries(task.reward)) saved.inventory[item] += count;
    if (slot === "intro") entry.done = true;
    else entry.state = "done";
    if (id !== "island") {
      saved.life.helpedResident = true;
      if (built("east-bay")) saved.life.ventures.deliveries++;
      if (id === "headland") recordFisherDelivery();
    }
    notify(`完成「${task.task}」 · 贝币 +${task.reward.coin}`);
    chime(740);
  } else if (action === "skip" && slot === "random" && state === "active") {
    entry.state = "skipped";
  } else return false;
  if (slot === "random" && entry !== saved.life.residentOffers[id] && entry.state !== "active") {
    saved.life.residentBacklog[id] = saved.life.residentBacklog[id].filter(prior => prior !== entry);
  }
  uiDirty = true;
  save();
  return true;
}

function onHomeIsland() {
  return saved.area === "island" || saved.area === "cabin";
}

function actOnCommissionBoard(id, order, action) {
  if (!questsDialog.open || questTab !== "residents" ||
      (id !== "island" && !saved.quests.visited.includes(id)) ||
      (action === "finish" && (id !== "island" || !onHomeIsland()))) return;
  if (!applyCommissionAction(id, "random", action, order)) return;
  const task = randomCommissionTask(id, order.task);
  get("quest-feedback").textContent = {
    accept: `已接取「${task.task}」`, finish: `委托已交付 · 贝币 +${task.reward.coin}`, skip: "已放弃委托"
  }[action];
  fillQuests();
}

function fillCommissionLog(list) {
  const locations = ["island", ...Object.keys(residents).filter(id => saved.quests.visited.includes(id))];
  const today = locations.map(id => dailyCommission(id));
  const available = today.filter(entry => entry.state === "offered").length;
  get("quest-intro").textContent = `第 ${dayIndex() + 1} 天 · 今日 ${available} 项可接。已接委托可跨天完成，邻岛委托请找发布人交付。`;
  for (const [index, id] of locations.entries()) appendCommissionRow(list, id, "random", today[index]);
  for (const id of locations) {
    for (const entry of saved.life.residentBacklog[id]) appendCommissionRow(list, id, "random", entry);
    if (id !== "island") appendCommissionRow(list, id, "intro");
  }
  if (saved.quests.visited.includes("research")) appendResearchCommissions(list);
}

function appendCommissionRow(list, id, slot, order) {
  const info = commission(id, slot, order);
  const { task, state } = info;
  const home = id === "island";
  const location = home ? "自家岛 · 船家" : `${Archipelago.routes[id].name} · ${residents[id].name}`;
  const date = slot === "intro" ? "常驻" : order.day < dayIndex() ? `第 ${order.day + 1} 天` : "今日";
  const { row, body } = lifeCard(task.task, `${location} · ${date}`);
  row.className = "commission-row";
  row.dataset.commission = task.id ?? `${id}-intro`;
  if (order) row.dataset.postedDay = String(order.day);
  const detail = document.createElement("p");
  detail.textContent = task.request;
  body.append(detail, itemAmounts(task.reward));
  const actions = document.createElement("div");
  actions.className = "commission-actions";
  const ready = commissionReady(id, slot, order);
  if (slot === "random" && state === "offered") {
    actions.append(lifeButton("接取", () => actOnCommissionBoard(id, order, "accept")));
  } else if (home && ready && onHomeIsland()) {
    actions.append(lifeButton("交付", () => actOnCommissionBoard(id, order, "finish")));
  } else {
    const label = ready ? (home ? "回自家岛交付" : "可当面交付") :
      slot === "intro" && state === "offered" ? "找居民接取" : commissionProgress(info);
    actions.append(lifeStatus(label));
  }
  if (slot === "random" && state === "active") {
    const skip = lifeButton("放弃", () => actOnCommissionBoard(id, order, "skip"));
    skip.className = "setup-link";
    actions.append(skip);
  }
  row.append(actions);
  list.append(row);
}

function appendResearchCommissions(list) {
  const { orders } = saved.life.survey;
  for (const project of surveyProjects) {
    const order = orders[project.id];
    if (!order) continue;
    const { row, body } = lifeCard(project.name, "洄湾研究岛 · 林澜");
    row.className = "commission-row";
    body.append(itemAmounts(project.reward));
    const count = availableSamples(project, order).length;
    const status = order.state === "done" ? "已完成" : count >= project.count ? "可提交样本" :
      `新样本 ${count} / ${project.count}`;
    row.append(lifeStatus(status));
    list.append(row);
  }
}

function built(id) {
  return saved.life.built.includes(id);
}

function expansionReferralRequirements() {
  const missing = [];
  if (dayIndex() + 1 < expansionUnlockDay) missing.push(`度过前 ${expansionUnlockDay - 1} 个岛上日`);
  if (!built("bench")) missing.push("建好观潮长椅");
  if (!built("shed")) missing.push("建好防风堆肥棚");
  if (!saved.life.helpedResident) missing.push("完成 1 项居民委托");
  return missing;
}

function expansionRequirements() {
  if (saved.life.expansion.permitted) return [];
  if (hasRoute("qishi")) return ["前往歧石岛，请建筑工阿岩开启扩岛计划"];
  if (saved.life.expansion.referred) return [contactAvailable(7) ? "给阿岩回信，等他寄来歧石岛的邀请" : "等阿岩寄来第一封来信"];
  return [...expansionReferralRequirements(), "请一位外岛居民介绍建筑工"];
}

function fillReferralOffer(offers, id) {
  if (saved.life.expansion.referred || expansionReferralRequirements().length) return;
  const panel = document.createElement("section");
  panel.className = "life-offer expansion-offer";
  const heading = document.createElement("h3");
  heading.textContent = "歧石岛的介绍信";
  const detail = document.createElement("p");
  detail.textContent = "你的岛已经有些样子了。歧石岛的阿岩会搭桥，我给他写封介绍信。他收到后就会给你来信。";
  panel.append(heading, detail, lifeButton("请居民介绍建筑工", () => {
    if (!residentDialog.open || saved.area !== id || saved.life.expansion.referred || expansionReferralRequirements().length) return;
    saved.life.expansion.referred = true;
    const { progress } = saved;
    if (!contactAvailable(7)) progress.firstLetterAt = Math.min(progress.firstLetterAt ?? Infinity, saved.minutes + firstLetterDelay);
    addAlert("介绍信已送出", `${residents[id].name}把介绍信寄给了阿岩。等他来信，就可以给他回信了。`);
    uiDirty = true;
    save();
    fillResidentOffers();
  }));
  offers.append(panel);
}

function fillBuilderOffer(offers) {
  const { permitted, referred } = saved.life.expansion;
  const project = islandProjects.find(entry => entry.id === "expansion");
  const panel = document.createElement("section");
  panel.className = "life-offer expansion-offer";
  const heading = document.createElement("h3");
  heading.textContent = project.name;
  const detail = document.createElement("p");
  detail.textContent = permitted ? "图纸已经交给你了。回自家岛打开岛建计划，备齐材料就能施工。" :
    "我看过介绍信了。我们可以从西岸搭一座木桥，把外侧沙洲整理成能耕种的土地。";
  const terms = document.createElement("p");
  terms.textContent = `手头贝币不够时可以按差额借款，最多借 ${expansionLoanLimit} 贝币。利息按借款的 ${expansionLoanRate * 100}% 一次计收，向上取整。可以分次还款。`;
  panel.append(heading, detail, itemAmounts(project.costs), terms);
  if (!permitted) panel.append(lifeButton("开启扩岛计划", () => {
    const state = saved.life.expansion;
    if (!residentDialog.open || saved.area !== "qishi" || !state.referred || state.permitted) return;
    state.permitted = true;
    addAlert("西岸扩岛图纸", "阿岩交给你一份扩岛图纸。回家在岛建计划里选择全款或贷款施工。");
    save();
    fillResidentOffers();
  }, !referred));
  offers.append(panel);
}

function expansionFinancing(price) {
  const principal = Math.max(0, price - saved.inventory.coin);
  return {
    principal, deposit: price - principal,
    repayment: principal + Math.ceil(principal * expansionLoanRate),
    available: principal > 0 && principal <= expansionLoanLimit
  };
}

function appendExpansionActions(row, body, project) {
  const { coin, ...materials } = project.costs;
  const missing = expansionRequirements();
  if (missing.length) {
    const note = document.createElement("p");
    note.textContent = `解锁步骤 · ${missing.join("、")}`;
    body.append(note);
    row.append(lifeStatus("未开放"));
    return;
  }
  const canBuild = saved.area === "island" && hasStock(materials);
  const financing = expansionFinancing(coin);
  const quote = document.createElement("p");
  const actions = document.createElement("div");
  actions.className = "life-actions";
  actions.append(lifeButton("全款扩岛", () => buildProject(project), !canBuild || saved.inventory.coin < coin));
  if (financing.principal) {
    quote.textContent = financing.available ?
      `贷款方案 · 首付 ${financing.deposit} 贝币，借 ${financing.principal}，共还 ${financing.repayment}。` :
      `贷款最多 ${expansionLoanLimit} 贝币，至少先备 ${coin - expansionLoanLimit} 贝币。`;
    body.append(quote);
    actions.append(lifeButton("确认贷款扩岛", () => buildProject(project, true), !canBuild || !financing.available));
  }
  body.append(actions);
}

function fillLoanPanel() {
  const panel = get("expansion-loan");
  const { debt } = saved.life.expansion;
  panel.replaceChildren();
  panel.hidden = !debt;
  if (!debt) return;
  const title = document.createElement("h3");
  title.textContent = "扩岛贷款";
  const info = document.createElement("p");
  info.textContent = `剩余 ${debt} 贝币 · 背包 ${saved.inventory.coin} 贝币。已经固定总还款额。`;
  const actions = document.createElement("div");
  actions.className = "life-actions";
  const portion = Math.min(10, debt, saved.inventory.coin);
  if (debt > 10 || saved.inventory.coin < debt) {
    actions.append(lifeButton(portion ? `还款 ${portion} 贝币` : "分期还款", () => repayExpansionLoan(portion), !portion));
  }
  actions.append(lifeButton("全部结清", () => repayExpansionLoan(debt), saved.inventory.coin < debt));
  panel.append(title, info, actions);
}

function repayExpansionLoan(amount) {
  const loan = saved.life.expansion;
  if (!projectsDialog.open || amount <= 0 || amount > loan.debt || amount > saved.inventory.coin) return;
  saved.inventory.coin -= amount;
  loan.debt -= amount;
  if (!loan.debt) {
    saved.life.ventures.loanCleared = true;
    addAlert("扩岛贷款已结清", "最后一笔还款已记入经营账本。");
  }
  uiDirty = true;
  save();
  fillLoanPanel();
  get("project-note").textContent = loan.debt ? `已还 ${amount} 贝币。还剩 ${loan.debt} 贝币。` : "扩岛贷款已结清。";
}

function fillProjects() {
  const list = get("project-list");
  list.replaceChildren();
  get("projects-location").textContent = saved.area === "island" ? "浮木每天会漂到自家沙滩，潮生岛也能捡到。" : "回到自家岛的户外，就能开始建造。";
  for (const project of islandProjects) {
    const { id, name, description, costs } = project;
    const { row, body } = lifeCard(name, description);
    row.dataset.project = id;
    if (id === "tidal-terrace" && built("east-bay")) {
      const { guestTrips, deliveries } = saved.life.ventures;
      body.append(lifeStatus(`带客 ${Math.min(2, guestTrips)}/2 · 居民委托 ${Math.min(2, deliveries)}/2`));
    }
    const construction = saved.life.ventures.construction;
    if (construction?.project === id) {
      row.append(lifeStatus(`施工中 · 第 ${construction.finishDay + 1} 天完工`));
    } else if (built(id)) {
      row.append(lifeStatus("已建成"));
    } else {
      body.append(itemAmounts(costs, true));
      if (id === "expansion") appendExpansionActions(row, body, project);
      else {
        const requirement = projectRequirement(project);
        const locked = Boolean(requirement);
        if (locked) body.append(lifeStatus(requirement));
        row.append(lifeButton("建造", () => buildProject(project), locked || saved.area !== "island" || !hasStock(costs)));
        row.lastElementChild.setAttribute("aria-label", `建造${name}`);
      }
    }
    list.append(row);
  }
  fillLoanPanel();
}

function projectRequirement(project) {
  if (coastalProjects.includes(project)) return coastalRequirement(project.id);
  if (project.id === "shed" && !saved.progress.farming) return "先收到小满的种田来信";
  if (project.id === "coop-expansion" && !built("expansion")) return "先完成西岸扩岛计划";
  return "";
}

function buildProject(project, financed = false) {
  const { id, name, costs } = project;
  const expanding = id === "expansion";
  const land = landProjects.includes(id);
  if (!projectsDialog.open || saved.area !== "island" || built(id) || (expanding && expansionRequirements().length)) return;
  if (land && saved.life.ventures.construction) return;
  if (projectRequirement(project)) return;
  const quote = financed && expanding ? expansionFinancing(costs.coin) : null;
  if (quote && !quote.available) return;
  const payment = quote ? { ...costs, coin: quote.deposit } : costs;
  if (!hasStock(payment)) return;
  for (const [item, count] of Object.entries(payment)) saved.inventory[item] -= count;
  if (land) {
    const finishDay = dayIndex() + 1;
    saved.life.ventures.construction = { project: id, finishDay, debt: quote?.repayment ?? 0 };
    receiveLetter({
      kind: "construction", reply: 7, arrives: saved.minutes,
      text: `材料和施工手续都收到了。「${name}」准备开工，明天（第 ${finishDay + 1} 天）就能完工。到时来岸边看看。阿岩`
    });
    fillProjects();
    get("project-note").textContent = "扩岛已提交。阿岩寄来一封开工信。";
    return;
  }
  saved.life.built.push(id);
  if (coastalProjects.includes(project)) grids.island = makeGrid(Island);
  uiDirty = true;
  save();
  chime(690);
  fillProjects();
  get("project-note").textContent = `${name}已建成。`;
  notify(get("project-note").textContent);
}

function finishLandConstruction() {
  const { construction } = saved.life.ventures;
  const { project, debt } = construction;
  saved.life.ventures.construction = null;
  saved.life.built.push(project);
  if (project === "expansion") saved.life.expansion.debt = debt;
  grids.island = makeGrid(Island);
  const label = islandProjects.find(entry => entry.id === project).name;
  const unlocked = { expansion: "沿西岸木桥可以去新田和畜舍。",
    "east-bay": "东岬船坞已经连通，可以找阿岩商量俱乐部。", "tidal-terrace": "餐厅计划已经开放。" };
  addAlert(`${label}完工`, unlocked[project]);
  save();
  if (projectsDialog.open) fillProjects();
}

function readCoop(source, day, capacity) {
  const animals = Array.isArray(source?.animals) ? source.animals.filter(animal => Object.hasOwn(livestock, animal?.kind))
    .slice(0, capacity).map(animal => {
      const fed = Number.isSafeInteger(animal.fed) && animal.fed >= 0 && animal.fed <= day ? animal.fed : -1;
      return { kind: animal.kind, fed, laid: Number.isSafeInteger(animal.laid) && animal.laid <= fed ? animal.laid : -1,
        eggs: nonnegative(animal.eggs), matureDay: Math.min(day + 2, nonnegative(animal.matureDay)) };
    }) : [];
  const egg = source?.incubation;
  const incubation = egg && animals.length < capacity && Object.hasOwn(livestock, egg.kind) &&
    Number.isSafeInteger(egg.readyDay) && egg.readyDay > 0 && egg.readyDay <= day + 1 && typeof egg.success === "boolean" ?
    { kind: egg.kind, readyDay: egg.readyDay, success: egg.success } : null;
  let vacancies = capacity - animals.length - Number(Boolean(incubation));
  const breeding = {};
  if (capacity === coopCapacity(true)) for (const kind of Object.keys(livestock)) {
    const readyDay = source?.breeding?.[kind]?.readyDay;
    if (vacancies && Number.isSafeInteger(readyDay) && readyDay > 0 && readyDay <= day + breedingDays) {
      breeding[kind] = { readyDay };
      vacancies--;
    }
  }
  return { animals, starter: source?.starter === true || animals.some(animal => animal.kind === "hen"), incubation, breeding };
}

function raisingLivestock() {
  const { starter, animals } = saved.life.coop;
  return starter || animals.length > 0;
}

function settleLivestock(day) {
  const { coop } = saved.life;
  const egg = coop.incubation;
  const ready = egg && day >= egg.readyDay;
  if (ready) {
    coop.incubation = null;
    const chick = `小${livestock[egg.kind].name}`;
    if (egg.success) {
      addYoungAnimal(egg.kind, egg.readyDay);
      addAlert(`${chick}孵化成功`, `畜舍里多了一只${chick}，再过两天就能长大。`);
    } else {
      addAlert("这枚蛋未能孵化", "孵化位已空出，可以放入下一枚蛋。");
    }
  }
  let born = false;
  for (const [kind, breeding] of Object.entries(coop.breeding)) {
    if (day < breeding.readyDay) continue;
    delete coop.breeding[kind];
    addYoungAnimal(kind, breeding.readyDay);
    const young = `小${livestock[kind].name}`;
    addAlert(`${young}出生了`, `畜舍里多了一只${young}，再过两个岛上日就会长成。`);
    born = true;
  }
  let produced = 0;
  for (const animal of coop.animals) {
    if (animal.fed >= animal.matureDay && animal.fed < day && animal.laid < animal.fed) {
      animal.laid = animal.fed;
      animal.eggs++;
      produced++;
    }
  }
  if (produced) addAlert("西岸畜舍有蛋了", `畜舍里有 ${produced} 枚新鲜的蛋可以收取。`);
  if (ready || born || produced) {
    save();
    if (coopDialog.open) fillCoop();
  }
}

function addYoungAnimal(kind, bornDay) {
  saved.life.coop.animals.push({ kind, fed: -1, laid: -1, eggs: 0, matureDay: bornDay + 2 });
}

const farmAnimals = kind => saved.life.coop.animals.filter(animal => animal.kind === kind);
const emptyCoopSlots = coop => coopCapacity(built("coop-expansion")) - coop.animals.length -
  Number(Boolean(coop.incubation)) - Object.keys(coop.breeding).length;
const canUseCoop = () => coopDialog.open && saved.area === "island" && built("expansion");

function sellableLivestock(kind) {
  const adults = farmAnimals(kind).filter(animal => animal.matureDay <= dayIndex());
  return saved.life.coop.breeding[kind] ? adults.slice(2) : adults;
}

function sellLivestock(kind, count) {
  const sold = new Set(sellableLivestock(kind).slice(0, count));
  const { coop, ventures } = saved.life;
  coop.animals = coop.animals.filter(animal => !sold.has(animal));
  const eggs = [...sold].reduce((total, animal) => total + animal.eggs, 0);
  if (eggs) {
    saved.inventory[livestock[kind].product] += eggs;
    ventures.hadWestHarvest = true;
  }
}

function coopAction(note) {
  uiDirty = true;
  save();
  fillCoop();
  get("coop-note").textContent = note;
  chime(570);
}

function adoptAnimal(kind) {
  const { coop } = saved.life;
  if (!canUseCoop() || !Object.hasOwn(livestock, kind) || emptyCoopSlots(coop) <= 0) return;
  const animal = livestock[kind];
  const starter = kind === "hen" && !coop.starter;
  if (!starter && (!coop.starter || saved.inventory.coin < animal.price)) return;
  if (starter) {
    coop.starter = true;
    saved.inventory.feed += 2;
  } else saved.inventory.coin -= animal.price;
  coop.animals.push({ kind, fed: -1, laid: -1, eggs: 0, matureDay: 0 });
  coopAction(starter ? "领到了第一只鸡和 2 份饲料。现在可以把成年鸡鸭卖给老纪和阿澄。" : `新来了一只${animal.name}。`);
}

function feedAnimals(kind) {
  if (!canUseCoop()) return;
  const day = dayIndex();
  const hungry = farmAnimals(kind).filter(animal => animal.matureDay <= day && animal.fed !== day).slice(0, saved.inventory.feed);
  if (!hungry.length) return;
  for (const animal of hungry) animal.fed = day;
  saved.inventory.feed -= hungry.length;
  coopAction(`喂了 ${hungry.length} 只${livestock[kind].name}。明天可以收蛋。`);
}

function collectEggs(kind) {
  if (!canUseCoop()) return;
  const animals = farmAnimals(kind);
  const eggs = animals.reduce((count, animal) => count + animal.eggs, 0);
  if (!eggs) return;
  for (const animal of animals) animal.eggs = 0;
  const product = livestock[kind].product;
  saved.inventory[product] += eggs;
  saved.life.ventures.hadWestHarvest = true;
  coopAction(`收取 ${items[product].name} × ${eggs}。`);
}

function prepareFeed() {
  if (!canUseCoop()) return;
  const ingredient = feedIngredients.find(id => saved.inventory[id]);
  if (!ingredient) return;
  saved.inventory[ingredient]--;
  saved.inventory.feed += 2;
  coopAction(`用 1 份${items[ingredient].name}配了 2 份饲料。`);
}

function incubateEgg(kind) {
  const { coop } = saved.life;
  const animal = livestock[kind];
  if (!canUseCoop() || !raisingLivestock() || !animal || coop.incubation || emptyCoopSlots(coop) <= 0 ||
      !saved.inventory[animal.product]) return;
  saved.inventory[animal.product]--;
  coop.incubation = { kind, readyDay: dayIndex() + 1, success: Math.random() < .30 };
  coopAction(`放入 1 枚${items[animal.product].name}。明天揭晓孵化结果。`);
}

function fillIncubator(coop) {
  const panel = get("coop-incubator");
  panel.replaceChildren();
  panel.hidden = !raisingLivestock();
  if (panel.hidden) return;
  const egg = coop.incubation;
  const message = egg ? `${items[livestock[egg.kind].product].name}孵化中 · 第 ${egg.readyDay + 1} 天揭晓。` :
    emptyCoopSlots(coop) <= 0 ? "畜舍已满。孵化需要为幼崽留一个位置。" : "一次放 1 枚蛋，隔天揭晓。每枚蛋成功率 30%。";
  const details = venturePanel(panel, "孵化位", message);
  if (!egg) for (const [kind, animal] of Object.entries(livestock)) {
    details.append(lifeButton(`孵化${items[animal.product].name}`, () => incubateEgg(kind),
      emptyCoopSlots(coop) <= 0 || !saved.inventory[animal.product]));
  }
}

function breedingRequirement(kind) {
  const { coop } = saved.life;
  if (!built("coop-expansion")) return "先扩建西岸畜舍";
  if (coop.breeding[kind]) return `第 ${coop.breeding[kind].readyDay + 1} 天出生`;
  if (emptyCoopSlots(coop) <= 0) return "需要 1 个空饲养位";
  const today = dayIndex();
  const fedAdults = farmAnimals(kind).filter(animal => animal.matureDay <= today && animal.fed === today);
  if (fedAdults.length < 2) return "需要 2 只今天已喂养的成禽";
  if (saved.inventory.feed < breedingFeed) return `还需 ${breedingFeed - saved.inventory.feed} 份饲料`;
  return "";
}

function startBreeding(kind) {
  if (!canUseCoop() || !Object.hasOwn(livestock, kind) || breedingRequirement(kind)) return;
  saved.inventory.feed -= breedingFeed;
  saved.life.coop.breeding[kind] = { readyDay: dayIndex() + breedingDays };
  coopAction(`已安排${livestock[kind].name}繁殖。预留 1 个饲养位，两个岛上日后迎来幼崽。`);
}

function fillBreeding() {
  const container = get("coop-breeding");
  container.replaceChildren();
  container.hidden = !built("coop-expansion");
  if (container.hidden) return;
  const panel = venturePanel(container, "鸡鸭繁殖",
    `同种成禽当天喂饱两只后，再用 ${breedingFeed} 份饲料。幼崽 ${breedingDays} 天后出生。`);
  for (const [kind, animal] of Object.entries(livestock)) {
    const actions = document.createElement("div");
    actions.className = "life-actions";
    const requirement = breedingRequirement(kind);
    actions.append(lifeButton(`繁殖${animal.name}`, () => startBreeding(kind), Boolean(requirement)));
    if (requirement) actions.append(lifeStatus(requirement));
    panel.append(actions);
  }
}

function fillCoop() {
  const { coop } = saved.life;
  const list = get("coop-list");
  list.replaceChildren();
  const upgraded = built("coop-expansion");
  const reserved = Number(Boolean(coop.incubation)) + Object.keys(coop.breeding).length;
  get("coop-stock").textContent = `畜舍 ${coop.animals.length} / ${coopCapacity(upgraded)} 只${reserved ? ` · 预留 ${reserved} 位` : ""} · 饲料 ${saved.inventory.feed} 份 · 贝币 ${saved.inventory.coin}`;
  get("coop-upgrade").hidden = upgraded;
  const ingredient = feedIngredients.find(id => saved.inventory[id]);
  const feed = get("make-feed");
  feed.disabled = !ingredient;
  feed.textContent = ingredient ? `用${items[ingredient].name}配饲料` : "配饲料";
  for (const [kind, animal] of Object.entries(livestock)) {
    const group = farmAnimals(kind);
    const adults = group.filter(entry => entry.matureDay <= dayIndex());
    const young = group.length - adults.length;
    const hungry = adults.filter(entry => entry.fed !== dayIndex()).length;
    const eggs = group.reduce((count, entry) => count + entry.eggs, 0);
    const starter = kind === "hen" && !coop.starter;
    const { row, body } = lifeCard(`${animal.name} · ${group.length} 只`, group.length ?
      `今日已喂 ${adults.length - hungry} / ${adults.length} · 可收 ${items[animal.product].name} × ${eggs}${young ? ` · 小${animal.name} ${young} 只成长中` : ""}` :
      `喂养后，次日可收取${items[animal.product].name}。`, animal.product);
    const actions = document.createElement("div");
    actions.className = "life-actions";
    if (group.length) actions.append(
      lifeButton(`喂${animal.name}`, () => feedAnimals(kind), !hungry || !saved.inventory.feed),
      lifeButton(`收${items[animal.product].name}`, () => collectEggs(kind), !eggs));
    if (emptyCoopSlots(coop) > 0) actions.append(
      lifeButton(starter ? "领养第一只鸡" : `领养${animal.name} · ${animal.price} 贝币`, () => adoptAnimal(kind),
        !starter && (!coop.starter || saved.inventory.coin < animal.price)));
    body.append(actions);
    list.append(row);
  }
  fillIncubator(coop);
  fillBreeding();
}

get("close-coop").addEventListener("click", () => coopDialog.close());
get("make-feed").addEventListener("click", prepareFeed);
get("walk-coop").addEventListener("click", () => goToIslandSpot(Island.spots.find(spot => spot.type === "coop")));
get("coop-upgrade").addEventListener("click", () => {
  if (!canUseCoop() || built("coop-expansion")) return;
  coopDialog.close();
  get("open-projects").click();
  get("project-list").querySelector('[data-project="coop-expansion"]')?.scrollIntoView({ block: "nearest" });
});

function restOnBench() {
  if (saved.life.benchDay === dayIndex()) return notify("今天已经在长椅上休息过了。");
  const energy = Math.min(24, 100 - saved.stamina);
  if (!energy) return notify("体力已经充足，海风吹得正好。");
  saved.life.benchDay = dayIndex();
  saved.stamina += energy;
  uiDirty = true;
  save();
  notify(`在长椅上歇了一会儿 · 体力 +${energy}`);
}

get("open-projects").addEventListener("click", () => {
  if (!saved.progress.building || activity || fishing || dialogOpen()) return;
  keys.clear();
  get("project-note").textContent = "";
  fillProjects();
  projectsDialog.showModal();
});
get("close-projects").addEventListener("click", () => projectsDialog.close());

setupVentures();
setupSurvey();
fillUpdateLog();
applyPreferences();
startPlaySession();
save();
initializePostOffice();
revealIsland();
requestAnimationFrame(frame);
