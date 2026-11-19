"use strict";

const Island = (() => {
  const W = 448;
  const H = 280;
  const renderScale = 2;
  const seaLine = 64;
  const beach = [
    [66, 185], [71, 173], [83, 168], [87, 153], [101, 144], [104, 132],
    [118, 120], [128, 118], [135, 106], [158, 99], [179, 98], [191, 90],
    [219, 87], [236, 92], [256, 91], [278, 103], [302, 106], [318, 117],
    [330, 129], [340, 132], [343, 145], [357, 159], [361, 173], [363, 186],
    [354, 197], [343, 208], [324, 216], [318, 228], [299, 238], [272, 238],
    [258, 248], [236, 253], [207, 252], [194, 258], [163, 257], [153, 250],
    [132, 246], [117, 236], [99, 231], [91, 221], [79, 216], [75, 198]
  ];
  const meadow = [
    [87, 182], [95, 165], [109, 156], [113, 143], [128, 135], [141, 118],
    [160, 111], [184, 112], [197, 102], [224, 100], [242, 106], [258, 103],
    [280, 117], [301, 119], [321, 133], [331, 150], [343, 164], [342, 180],
    [329, 188], [327, 200], [310, 205], [299, 220], [278, 225], [259, 224],
    [242, 236], [222, 239], [204, 234], [185, 244], [166, 241], [152, 231],
    [132, 228], [119, 218], [107, 214], [103, 205], [91, 200]
  ];

  const trees = [
    { x: 121, y: 156, size: 0.92, wind: -1, id: "west-palm" },
    { x: 306, y: 143, size: 1.14, wind: 1, id: "east-palm" },
    { x: 156, y: 212, size: 1.2, wind: -1, id: "south-palm" },
    { x: 113, y: 208, size: 0.77, wind: -1 },
    { x: 182, y: 113, size: 0.83, wind: 1 },
    { x: 276, y: 123, size: 0.73, wind: -1 },
    { x: 306, y: 206, size: 0.89, wind: 1 }
  ];
  const berryTrees = [
    { x: 160, y: 142, id: "fruit-tree" },
    { x: 272, y: 173, id: "east-fruit" }
  ];
  const basePlotCount = 3;
  const beds = [[239, 200], [264, 199], [289, 195], [39, 207], [62, 207]];
  const expansionBeach = [[17, 205], [20, 193], [21, 183], [25, 171], [34, 165], [48, 162], [57, 164], [66, 171],
    [75, 182], [78, 194], [81, 209], [75, 224], [65, 230], [52, 232], [40, 231], [25, 226], [20, 219]];
  const eastBay = [[310, 213], [338, 207], [357, 204], [377, 209], [399, 220], [410, 234],
    [407, 248], [393, 259], [371, 260], [350, 253], [334, 241], [321, 228]];
  const tideTerrace = [[74, 238], [86, 224], [105, 222], [130, 227], [153, 234], [177, 235],
    [195, 242], [207, 251], [208, 261], [197, 270], [176, 275], [150, 277],
    [121, 277], [97, 274], [84, 269], [75, 260], [71, 249]];
  const restaurantFootprint = { left: 84, right: 125, top: 226, bottom: 247 };
  const restaurantTables = [[151, 247], [180, 248], [148, 264], [178, 265]];
  const timberSpots = [
    { id: "timber-west", x: 126, y: 234, markY: 225, top: 227, left: 116, right: 136, type: "timber", label: "捡浮木", reach: 16 },
    { id: "timber-east", x: 302, y: 230, markY: 221, top: 223, left: 292, right: 312, type: "timber", label: "捡浮木", reach: 16 }
  ];
  const benchSpot = { id: "shore-bench", x: 191, y: 224, markY: 205, top: 208, left: 177, right: 205,
    reach: 15, project: "bench", type: "bench", label: "在长椅上歇歇" };
  const coopSpot = { id: "west-coop", x: 48, y: 190, markY: 163, top: 165, left: 23, right: 73,
    bottom: 195, reach: 15, project: "expansion", type: "coop", label: "照料西岸畜舍" };
  const compostBin = { id: "compost-bin", x: 258, y: 227, markY: 230, top: 210, left: 246, right: 270,
    markerBelow: true, reach: 15, type: "compost", label: "堆肥箱" };
  const spots = [
    ...trees.filter(tree => tree.id).map(tree => ({
      id: tree.id, x: tree.x, y: tree.y + 9, markY: tree.y - 43,
      top: tree.y - 44, left: tree.x - 21, right: tree.x + 21,
      type: "coconut", label: "摘椰子"
    })),
    ...berryTrees.map(tree => ({
      id: tree.id, x: tree.x, y: tree.y + 10, markY: tree.y - 35,
      top: tree.y - 34, left: tree.x - 18, right: tree.x + 18,
      type: "fruit", label: "采海岛果"
    })),
    { id: "drift-fruit", x: 221, y: 249, markY: 238, top: 244, left: 210, right: 242, type: "fruit", label: "捡漂流果" },
    { id: "cabin", x: 219, y: 155, markY: 105, top: 98, left: 190, right: 247, reach: 19, type: "enter", label: "进入木屋" },
    { id: "harbor", x: 351, y: 171, markY: 202, top: 153, bottom: 200, left: 345, right: 367,
      markerBelow: true, reach: 13, type: "harbor", label: "找船家出海" },
    { id: "fishing", x: 387, y: 173, markY: 161, top: 161, left: 368, right: 399, type: "fish", label: "抛竿钓鱼" },
    { id: "post", x: 411, y: 172, markY: 147, top: 137, left: 400, right: 427, type: "post", label: "海鸟邮局" },
    ...beds.map(([x, y], plot) => ({ id: `plot-${plot}`, x, y: y + 8, markY: y - 10,
      top: y - 7, left: x - 11, right: x + 11, reach: 17, type: "farm", plot,
      project: plot >= basePlotCount ? "expansion" : null })),
    ...timberSpots, benchSpot, compostBin, coopSpot,
    { id: "southern-crab-trap", x: 238, y: 244, markY: 260, top: 236, left: 230, right: 248,
      bottom: 254, reach: 14, markerBelow: true, type: "crab-trap", label: "南岸蟹笼" },
    { id: "east-bay-club", x: 371, y: 237, markY: 208, top: 208, left: 349, right: 394, reach: 16,
      type: "club", label: "东岬垂钓俱乐部", project: "fishing-club" },
    { id: "tidal-terrace-restaurant", x: 107, y: 252, markY: 207, top: 205, left: 76, right: 132, reach: 16,
      type: "restaurant", label: "海边餐厅", project: "restaurant" },
    { id: "market", x: 330, y: 207, markY: 169, top: 174, left: 307, right: 353, type: "trade", label: "和小贩交易" },
    { id: "ancient-shell", x: 105, y: 223, markY: 214, top: 218, left: 97, right: 113, reach: 18, type: "shell", label: "拾起古贝" }
  ];

  function random(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function sceneContext(canvas = document.createElement("canvas"), options) {
    canvas.width = W * renderScale;
    canvas.height = H * renderScale;
    const ctx = canvas.getContext("2d", options);
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  const rng = random(218);
  const waves = Array.from({ length: 480 }, () => ({
    x: rng() * (W + 30) - 15, y: seaLine + 2 + rng() ** 1.4 * (H - seaLine - 2),
    width: rng(), phase: rng() * 8, color: rng()
  }));
  const stars = Array.from({ length: 58 }, () => [rng() * W, rng() * 54, rng()]);
  const rain = Array.from({ length: 121 }, () => [rng() * (W + 80), rng() * (H + 15), rng()]);
  const shoreFlecks = Array.from({ length: 185 }, () => [rng() * 300 + 65, rng() * 170 + 88, rng()]);
  const grassFlecks = Array.from({ length: 390 }, () => [rng() * 265 + 88, rng() * 151 + 97, rng()]);
  const swells = Array.from({ length: 94 }, () => [rng() * (W + 20) - 10, rng() * 211 + 68, rng(), rng() * 8]);

  function inside(x, y, points) {
    let result = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [a, b] = points[i];
      const [c, d] = points[j];
      if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) result = !result;
    }
    return result;
  }

  function walkable(x, y, projects = []) {
    const expanded = projects.includes("expansion");
    if (projects.includes("fishing-club") && x >= 350 && x <= 384 && y >= 215 && y <= 232) return false;
    if (projects.includes("restaurant")) {
      const { left, right, top, bottom } = restaurantFootprint;
      if (x >= left && x <= right && y >= top && y <= bottom) return false;
      if (restaurantTables.some(([tx, ty]) => Math.abs(x - tx) <= 5 && Math.abs(y - ty) <= 2)) return false;
    }
    if (projects.includes("east-bay") && inside(x, y, eastBay)) return true;
    if (projects.includes("tidal-terrace") && inside(x, y, tideTerrace)) return true;
    if (expanded && ((x >= 68 && x <= 94 && y >= 197 && y <= 206) || inside(x, y, expansionBeach))) return true;
    if (x >= 340 && x <= 422 && y >= 164 && y <= 180) return true;
    if (x < 72 || x > 354 || y < 100 || y > 253 || !inside(x, y, beach)) return false;
    if (x >= 195 && x <= 241 && y >= 113 && y <= 153) return false;
    return ![...trees, ...berryTrees].some(tree => Math.abs(tree.x - x) < 4 && Math.abs(tree.y - y) < 3);
  }

  function box(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function polygon(ctx, points, color, dx = 0, dy = 0, scale = 1) {
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      if (index) ctx.lineTo(Math.round(dx + x * scale), Math.round(dy + y * scale));
      else ctx.moveTo(Math.round(dx + x * scale), Math.round(dy + y * scale));
    });
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function line(ctx, points, color, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      if (index) ctx.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
      else ctx.moveTo(Math.round(x) + 0.5, Math.round(y) + 0.5);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function oval(ctx, x, y, w, h, color) {
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), w, h, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function tint(a, b, t) {
    return a.map((value, i) => Math.round(value + (b[i] - value) * t));
  }

  function rgb(values, alpha = 1) {
    return `rgba(${values.join(",")},${alpha})`;
  }

  const seasonal = {
    spring: { grass: ["#72a45d", "#80ae63", "#90b969"], leaf: ["#346a4d", "#649d53", "#8db963"], petals: ["#f5b8bb", "#ffe0a7"], water: [39, 153, 164], cast: [109, 153, 132], strength: 0 },
    summer: { grass: ["#468b55", "#63a956", "#80b95b"], leaf: ["#1b634d", "#38874a", "#75ad5c"], petals: ["#f58076", "#ffd17b"], water: [19, 185, 184], cast: [53, 174, 180], strength: .17 },
    autumn: { grass: ["#a18149", "#b49550", "#c2a857"], leaf: ["#885544", "#b7734e", "#df9e55"], petals: ["#d6734c", "#efaf58"], water: [53, 138, 159], cast: [204, 137, 116], strength: .17 },
    winter: { grass: ["#78968b", "#9db6aa", "#bdcfc1"], leaf: ["#4d7674", "#6f9690", "#b9ccba"], petals: ["#ddeadd", "#e1eef0"], water: [52, 126, 160], cast: [123, 160, 190], strength: .30 }
  };

  const skies = [
    { hour: 0, sky: [13, 24, 62], rim: [47, 68, 111], sea: [12, 41, 82], deep: [13, 57, 93], light: [106, 145, 205], shade: [20, 30, 77, 0.50] },
    { hour: 4.7, sky: [30, 44, 92], rim: [119, 101, 141], sea: [27, 61, 99], deep: [18, 64, 105], light: [152, 166, 214], shade: [39, 39, 92, 0.38] },
    { hour: 6, sky: [62, 115, 182], rim: [255, 177, 124], sea: [44, 129, 168], deep: [15, 72, 123], light: [250, 203, 164], shade: [255, 169, 104, 0.17] },
    { hour: 8, sky: [50, 148, 199], rim: [163, 222, 221], sea: [29, 137, 173], deep: [21, 87, 127], light: [147, 238, 214], shade: [255, 206, 123, 0.04] },
    { hour: 13, sky: [33, 135, 193], rim: [152, 222, 233], sea: [24, 139, 178], deep: [16, 92, 137], light: [134, 234, 225], shade: [255, 235, 178, 0.0] },
    { hour: 17, sky: [76, 102, 169], rim: [255, 171, 107], sea: [83, 112, 156], deep: [34, 66, 123], light: [255, 196, 135], shade: [238, 117, 89, 0.17] },
    { hour: 18.6, sky: [74, 46, 108], rim: [255, 138, 94], sea: [131, 85, 125], deep: [39, 49, 103], light: [255, 176, 119], shade: [111, 49, 100, 0.28] },
    { hour: 20.1, sky: [18, 28, 62], rim: [74, 72, 127], sea: [20, 48, 88], deep: [16, 62, 101], light: [111, 151, 217], shade: [27, 35, 89, 0.46] }
  ];

  function daylight(hour, weather, season = "spring") {
    const end = skies.findIndex(phase => phase.hour > hour);
    const start = skies[end < 0 ? skies.length - 1 : end - 1];
    const finish = end < 0 ? { ...skies[0], hour: 24 } : skies[end];
    const blend = (hour - start.hour) / (finish.hour - start.hour);
    const result = {};
    const look = seasonal[season];
    for (const name of ["sky", "rim", "sea", "deep", "light"]) {
      const seasonalTone = name === "sea" || name === "deep" ? look.water : look.cast;
      const colors = tint(tint(start[name], finish[name], blend), seasonalTone, look.strength);
      const haze = weather === "storm" ? 0.8 : weather === "rain" ? 0.56 : weather === "snow" ? 0.49 : weather === "cloud" ? 0.19 : 0;
      result[name] = tint(colors, weather === "storm" ? [37, 61, 76] : [71, 111, 137], haze);
    }
    result.shade = tint(start.shade.slice(0, 3), finish.shade.slice(0, 3), blend);
    result.alpha = (start.shade[3] + (finish.shade[3] - start.shade[3]) * blend) * .85;
    if (weather === "storm") {
      result.shade = [25, 55, 69];
      result.alpha = Math.max(result.alpha, .35);
    }
    return result;
  }

  function cloud(ctx, x, y, scale, bright, low, underside) {
    const shape = [[0, 10], [6, 10], [6, 7], [12, 7], [12, 4], [20, 4], [20, 1],
      [34, 1], [34, 4], [41, 4], [41, 8], [53, 8], [53, 11], [61, 11],
      [61, 14], [49, 15], [5, 15], [5, 13], [0, 13]];
    polygon(ctx, shape, low, x, y, scale);
    polygon(ctx, [[8, 10], [12, 7], [20, 4], [20, 1], [34, 1], [41, 5], [34, 6],
      [27, 6], [22, 9], [29, 9], [25, 11], [9, 12]], bright, x, y, scale);
    polygon(ctx, [[5, 13], [17, 12], [29, 13], [42, 12], [57, 13], [49, 15], [5, 15]], underside, x, y, scale);
  }

  function skyAndSea(ctx, palette, hour, weather, elapsed) {
    const gale = weather === "storm";
    const warm = Math.max(0, 1 - Math.min(Math.abs(hour - 6.05), Math.abs(hour - 18.25)) / 2.25);
    for (let y = 0; y < seaLine; y += 3) {
      const mix = (y / seaLine) ** (1.2 + warm * .65);
      box(ctx, 0, y, W, 3, rgb(tint(palette.sky, palette.rim, mix)));
    }
    const day = hour >= 5.2 && hour < 19;
    let lightX;
    if (day) {
      const progress = (hour - 5.2) / 13.8;
      lightX = 45 + progress * 350;
      const y = 63 - Math.sin(progress * Math.PI) * 51;
      const opacity = gale ? .06 : weather === "rain" || weather === "snow" ? .20 : weather === "cloud" ? .8 : 1;
      const size = 1 + warm * .42;
      for (const [rx, ry, alpha] of [[76, 29, .08], [55, 22, .10], [34, 16, .13], [19, 13, .18]]) {
        oval(ctx, lightX, y, rx * size, ry * size, rgb([255, 172 + Math.round(56 * (1 - warm)), 126], alpha * opacity * (.30 + warm * .70)));
      }
      polygon(ctx, [[-10, -7], [-7, -10], [6, -10], [10, -7], [12, -2], [12, 4],
        [9, 8], [5, 11], [-6, 11], [-10, 7], [-12, 2], [-12, -3]],
        rgb([255, 238, 169], opacity), lightX, y, size);
      box(ctx, lightX - 11 * size, y + 3 * size, Math.round(22 * size), Math.round(3 * size), rgb([255, 204, 117], opacity));
      box(ctx, lightX - 8 * size, y + 7 * size, Math.round(16 * size), Math.round(2 * size), rgb([252, 162, 103], opacity));
    } else {
      const progress = ((hour + 5) % 24) / 10.2;
      lightX = 46 + progress * 345;
      const y = Math.max(13, 56 - Math.sin(progress * Math.PI) * 39);
      const opacity = weather === "rain" ? 0.24 : 0.9;
      for (const [x, sy, size] of stars) {
        box(ctx, x, sy, size > 0.87 ? 2 : 1, 1, rgb([234, 232, 209], (0.21 + size * 0.54) * opacity));
      }
      polygon(ctx, [[-5, -6], [1, -8], [1, -4], [-2, -2], [-2, 1], [1, 4], [6, 4],
        [8, 2], [6, 7], [1, 9], [-5, 7], [-8, 2], [-8, -2]], rgb([245, 229, 175], opacity), lightX, y);
    }
    const cloudBands = weather === "clear" ? 7 : 12;
    for (let i = 0; i < cloudBands; i++) {
      const x = ((i * 99 + 9 + elapsed * (gale ? 19 : weather === "rain" ? 4 : 1.2)) % (W + 120)) - 94;
      const y = 13 + (i * 19 % 39);
      cloud(ctx, x, y, .55 + (i % 4) * .22,
        rgb(tint(palette.rim, [255, 242, 210], gale ? .10 : .44), day ? .83 : .33),
        rgb(tint(palette.sky, palette.rim, .29), .88), rgb(tint(palette.rim, [255, 148, 102], warm * .38), .24 + warm * .46));
    }
    for (let y = seaLine; y < H; y += 3) box(ctx, 0, y, W, 3, rgb(tint(palette.sea, palette.deep, (y - seaLine) / (H - seaLine))));
    box(ctx, 0, seaLine, W, 1, rgb(palette.light, .66));
    box(ctx, 0, seaLine + 4, W, 2, rgb(palette.rim, 0.15));
    paintReflection(ctx, lightX, warm, palette, gale ? .14 : (weather === "rain" || weather === "snow") ? .30 : 1, elapsed);
    for (const [x, y, r, phase] of swells) {
      const near = (y - seaLine) / (H - seaLine);
      const length = Math.round((12 + near * 39) * (0.55 + r * 0.45));
      const ripple = Math.sin(phase + elapsed * (gale ? 3.6 : 1.3));
      const sx = Math.round(x + ripple * 5);
      const sy = Math.round(y);
      const alpha = (gale ? .13 : .06) + near * .12 + ripple * .035;
      polygon(ctx, [[0, 3], [length * .21, 1], [length * .48, 0], [length * .82, 1],
        [length, 3], [length * .75, 2], [length * .3, 3]], rgb(palette.light, alpha), sx, sy);
      box(ctx, sx + length * .28, sy + 3, length * .48, 1, rgb(palette.deep, alpha * 1.6));
      if (r > .62) box(ctx, sx + length * .38, sy + 1, Math.ceil(length * .21), .5, rgb(palette.light, alpha * 1.5));
    }
    for (const wave of waves) {
      const near = (wave.y - seaLine) / (H - seaLine);
      const motion = Math.sin(wave.phase + elapsed * (0.65 + near * 0.4));
      const x = wave.x + motion * (2 + near * 5);
      const width = Math.max(1, Math.round((4 + near * 26) * wave.width));
      const reflection = Math.abs(x - lightX) < 10 + near * 45;
      const color = wave.color > 0.23 ? palette.light : [9, 56, 105];
      const alpha = reflection ? 0.25 + motion * 0.12 : 0.08 + wave.color * 0.13 + motion * 0.05;
      box(ctx, x, wave.y, width, near > 0.47 && wave.color > 0.6 ? 2 : 1, rgb(color, alpha));
    }
  }

  function paintReflection(ctx, lightX, warm, palette, opacity, elapsed) {
    const gleam = tint(palette.light, [255, 214, 134], warm * .63);
    for (let i = 0; i < 102; i++) {
      const depth = (i / 102) ** 1.37;
      const y = seaLine + 2 + depth * (H - seaLine);
      const band = 6 + 39 * depth;
      const surge = Math.sin(i * 2.16 + elapsed * 1.9);
      const shift = Math.sin(i * 1.67 + elapsed * 1.45) * band * .48;
      const width = (5 + band * (.48 + surge * .37)) * (0.65 + warm * .35);
      const x = lightX + shift - width / 2;
      const alpha = (.13 + warm * .44) * (1 - depth * .51) * (.59 + surge * .38) * opacity;
      box(ctx, x, y, Math.round(width), depth > .50 && i % 4 === 0 ? 2 : 1, rgb(gleam, alpha));
      if (i % 4 === 0) box(ctx, x + width + 3, y + 2, Math.round(width * .27), 1, rgb(gleam, alpha * .6));
    }
  }

  const terrainLayers = new Map();
  const land = sceneContext();
  const shallow = document.createElement("canvas");
  shallow.width = W;
  shallow.height = H;
  const shallowCtx = shallow.getContext("2d");

  function paintSeabed() {
    const image = shallowCtx.createImageData(W, H);
    const depthColors = [[241, 214, 165], [137, 218, 190], [61, 199, 189], [32, 158, 178], [28, 135, 167]];
    const edges = beach.map(([x, y], i) => {
      const [endX, endY] = beach[(i + 1) % beach.length];
      const dx = endX - x;
      const dy = endY - y;
      return { x, y, dx, dy, length: dx * dx + dy * dy };
    });
    for (let y = 64; y < H; y++) for (let x = 30; x < 402; x++) {
      let nearest = 36 ** 2;
      for (const edge of edges) {
        const dx = x - edge.x;
        const dy = y - edge.y;
        const t = Math.max(0, Math.min(1, (dx * edge.dx + dy * edge.dy) / edge.length));
        const distance = (dx - t * edge.dx) ** 2 + (dy - t * edge.dy) ** 2;
        nearest = Math.min(nearest, distance);
      }
      const distance = Math.sqrt(nearest);
      if (distance >= 35) continue;
      const ripple = Math.sin(x * .13 + y * .23) * 1.8 + Math.sin(y * .42 + x * .07) * 1.4;
      const depth = Math.max(0, Math.min(3.99, (distance + ripple) / 7.6));
      const step = Math.floor(depth);
      const color = tint(depthColors[step], depthColors[step + 1], depth - step);
      const index = (y * W + x) * 4;
      const dither = ((x ^ y) & 1) ? 3 : -3;
      image.data[index] = color[0] + dither;
      image.data[index + 1] = color[1] + dither;
      image.data[index + 2] = color[2] + dither;
      image.data[index + 3] = Math.round(242 * Math.min(1, (35 - distance + ripple) / 12));
    }
    shallowCtx.putImageData(image, 0, 0);
  }

  paintSeabed();

  const coastSegments = beach.flatMap(([x, y], index) => {
    const [ex, ey] = beach[(index + 1) % beach.length];
    const pieces = Math.max(1, Math.ceil(Math.hypot(ex - x, ey - y) / 4));
    return Array.from({ length: pieces }, (_, i) => {
      const sx = x + (ex - x) * i / pieces;
      const sy = y + (ey - y) * i / pieces;
      const dx = sx - 213;
      const dy = sy - 169;
      const length = Math.hypot(dx, dy);
      return [sx, sy, dx / length, dy / length, (ex - x) / pieces, (ey - y) / pieces, index + i / pieces];
    });
  });

  function coast(ctx, palette, weather, elapsed) {
    const gale = weather === "storm";
    const foam = tint(palette.light, gale ? [181, 221, 220] : [250, 252, 224], .68);
    ctx.globalAlpha = Math.max(.31, .98 - 1.25 * palette.alpha);
    ctx.drawImage(shallow, 0, 0);
    ctx.globalAlpha = 1;
    for (const [x, y, nx, ny, dx, dy, phase] of coastSegments) {
      const time = elapsed * (gale ? 3.2 : 1.28) + phase * .28;
      const swell = Math.sin(time);
      if (Math.cos(phase * 2.2 + elapsed * .8) > -.48) {
        const dist = 4.3 + swell * 3.3;
        const sx = x + nx * dist;
        const sy = y + ny * dist + 2;
        line(ctx, [[sx, sy], [sx + dx, sy + dy]], rgb(foam, .52 + swell * .27), gale ? 1.5 : 1);
        if (swell > .43) {
          box(ctx, sx - 2 + nx * 2, sy + 2 + ny * 2, 2, .5, rgb(foam, .69));
          box(ctx, sx + nx * 4, sy + ny * 4, 1, 1, rgb(foam, .53));
        }
      }
      if (Math.sin(phase * 1.76 + elapsed * .85) > .19) {
        const distance = 13.5 + 5.2 * Math.sin(time - 1.2);
        const sx = x + nx * distance;
        const sy = y + ny * distance;
        line(ctx, [[sx, sy], [sx + dx * .75, sy + dy * .75]], rgb([162, 247, 225], .22 + (swell + 1) * .10));
      }
      if (Math.cos(phase * 3.16) > .32) {
        const sx = x + nx * (18 + (phase % 3) * 3) + Math.sin(elapsed * .72 + phase) * 2;
        const sy = y + ny * (18 + (phase % 3) * 3);
        box(ctx, sx, sy, 4, 1, rgb([139, 239, 215], .16 + swell * .08));
        box(ctx, sx + 4, sy + 1, 3, 1, rgb([154, 247, 224], .24 + swell * .08));
        box(ctx, sx + 7, sy + 2, 3, 1, rgb([139, 239, 215], .13));
      }
    }
    for (const [x, y, s] of [[63, 208, .5], [88, 235, .4], [321, 237, .55], [304, 243, .45], [364, 194, .5], [324, 109, .45]]) {
      polygon(ctx, [[-10, 2], [-8, -3], [-3, -7], [4, -6], [9, 0], [6, 4], [-7, 4]], "#285f6979", x, y, s);
      box(ctx, x - 1, y - 2, 3, 1, "#87d2b78c");
    }
  }

  function tuft(ctx, x, y, style) {
    const light = ["#9db852", "#a9bf66", "#769d4d"][style % 3];
    box(ctx, x, y, 6, 2, "#407858");
    box(ctx, x + 2, y - 3, 2, 4, light);
    box(ctx, x, y - 1, 1, 2, light);
    box(ctx, x + 5, y - 2, 1, 2, "#588b50");
    box(ctx, x + 3, y - 4, 1, 3, "#c6c875");
    box(ctx, x + 6, y, 2, 1, "#6a9558");
  }

  function stone(ctx, x, y, scale) {
    oval(ctx, x + 2 * scale, y + 4 * scale, 10 * scale, 3 * scale, "#355d5899");
    polygon(ctx, [[-9, 2], [-7, -3], [-3, -7], [3, -8], [8, -5], [10, 1], [8, 4], [-7, 4]], "#526d71", x, y, scale);
    polygon(ctx, [[-9, 2], [-7, -3], [-3, -7], [3, -8], [6, -5], [4, -2], [-2, -1], [-3, 2]], "#8b9e90", x, y, scale);
    polygon(ctx, [[-6, -3], [-3, -7], [3, -8], [6, -5], [0, -5], [-2, -3]], "#b0b5a0", x, y, scale);
  }

  function terrainPaint(ctx, season) {
    const { grass, petals } = seasonal[season];
    polygon(ctx, beach, "#39756f", 0, 4);
    polygon(ctx, beach, "#b78357", 0, 2);
    polygon(ctx, beach, "#edc082");
    polygon(ctx, beach, "#f7d89b", 0, -2);
    line(ctx, [[81, 210], [100, 227], [118, 231], [132, 242], [155, 247],
      [169, 254], [193, 253], [207, 248], [235, 249], [257, 244], [271, 235], [298, 235], [320, 224]], "#fff0b1", 2);
    for (const [x, y, r] of shoreFlecks) {
      if (!inside(x, y, beach)) continue;
      box(ctx, x, y, r > 0.88 ? 4 : 2, 1, r > 0.49 ? "#d8ac74" : "#ffe6a3");
    }
    polygon(ctx, meadow, "#8c9558", 1, 4);
    polygon(ctx, meadow, "#527f51", 0, 2);
    polygon(ctx, meadow, grass[0]);
    polygon(ctx, [[98, 175], [115, 159], [133, 149], [152, 127], [179, 121],
      [199, 107], [224, 103], [249, 111], [266, 109], [297, 128], [317, 144],
      [319, 160], [303, 183], [284, 193], [257, 205], [211, 219], [196, 230],
      [169, 228], [152, 219], [129, 208], [108, 190]], grass[1]);
    polygon(ctx, [[95, 171], [110, 156], [115, 144], [141, 119], [160, 112],
      [185, 113], [174, 126], [156, 132], [145, 149], [126, 154], [110, 174], [95, 185]], grass[2]);
    polygon(ctx, [[234, 158], [248, 150], [265, 152], [292, 146], [315, 149],
      [326, 154], [343, 167], [356, 168], [357, 178], [330, 177], [311, 169],
      [292, 165], [265, 172], [247, 166], [231, 173], [219, 194], [210, 213],
      [212, 234], [225, 250], [211, 250], [199, 235], [198, 213],
      [203, 195], [211, 180], [205, 167], [198, 156], [210, 149], [222, 165]], "#c6b279");
    polygon(ctx, [[220, 186], [226, 175], [241, 165], [263, 162], [290, 156], [317, 158],
      [338, 169], [355, 169], [353, 173], [331, 173], [309, 163], [291, 161],
      [264, 168], [248, 167], [233, 172], [221, 192], [210, 217], [211, 235],
      [221, 247], [213, 247], [203, 234], [201, 217], [208, 198]], "#d7c38a");
    for (const [x, y, width] of [[202, 160, 7], [211, 169, 7], [213, 178, 8], [239, 165, 9],
      [280, 162, 8], [316, 163, 9], [210, 206, 7], [204, 219, 6], [207, 234, 7]]) {
      box(ctx, x, y + 1, width, 1, "#a99263");
      box(ctx, x + 1, y, width - 2, 1, "#ead29d");
    }
    for (const [x, y, r] of grassFlecks) {
      if (!inside(x, y, meadow)) continue;
      if (r > 0.87 && !(x > 195 && x < 245) && !(x > 245 && y > 150 && y < 179)) tuft(ctx, x, y, Math.floor(x) % 3);
      else box(ctx, x, y, r > 0.53 ? 3 : 2, 1, r > 0.51 ? grass[2] + "90" : "#567f5355");
    }
    for (const [x, y] of [[100, 173], [108, 175], [141, 153], [146, 159], [166, 184],
      [158, 189], [178, 204], [187, 200], [154, 218], [179, 231], [232, 221], [244, 215],
      [269, 216], [275, 211], [289, 218], [311, 191], [321, 180], [254, 149], [274, 142],
      [294, 131], [316, 147], [132, 207], [127, 194]]) {
      tuft(ctx, x, y, (x + y) % 3);
      tuft(ctx, x - 4, y + 4, (x + y + 1) % 3);
      box(ctx, x + 5, y + 2, 1, 2, "#508356");
      if (x % 2) box(ctx, x + 2, y - 5, 2, 2, "#f4c18b");
    }
    for (const [x, y, s] of [[95, 190, .73], [135, 223, .68], [175, 237, .54], [282, 224, 1],
      [325, 188, .68], [316, 153, .58], [252, 109, .64], [138, 164, .47], [102, 213, .46], [281, 104, .44]]) stone(ctx, x, y, s);
    for (const [x, y] of [[82, 201], [113, 226], [122, 234], [145, 244], [166, 253],
      [196, 247], [246, 245], [279, 231], [308, 231], [338, 202], [351, 186], [344, 157], [325, 131]]) {
      box(ctx, x, y, 4, 2, "#c58f64");
      box(ctx, x, y - 1, 3, 2, "#f8dfae");
      box(ctx, x + 7, y + 1, 2, 1, "#d3a475");
    }
    for (const [x, y] of [[176, 165], [184, 167], [183, 174], [245, 198], [251, 192],
      [253, 195], [257, 218], [263, 215], [133, 181], [129, 180], [131, 185], [304, 128], [225, 226]]) {
      box(ctx, x + 1, y, 1, 3, "#418052");
      box(ctx, x, y, 3, 2, petals[x % 2]);
    }
  }
  function terrainLayer(season) {
    if (!terrainLayers.has(season)) {
      const terrain = sceneContext();
      terrainPaint(terrain, season);
      seasonalGround(terrain, season);
      terrainLayers.set(season, terrain.canvas);
    }
    return terrainLayers.get(season);
  }

  const decorations = [[113, 179], [129, 189], [163, 168], [172, 210], [175, 223],
    [189, 193], [236, 218], [239, 184], [263, 186], [285, 185], [303, 181], [306, 220],
    [314, 158], [296, 144], [269, 130], [249, 126], [184, 121], [148, 136]];

  function seasonalGround(ctx, season) {
    if (season === "winter") for (const [x, y, scale] of [[122, 170, .9], [154, 197, 1.05],
      [174, 232, 1.1], [267, 212, 1.2], [296, 225, .98], [312, 187, .88], [302, 148, .99], [265, 125, 1]]) {
      polygon(ctx, [[-13, 4], [-14, 1], [-9, 0], [-8, -3], [1, -3], [3, -6], [8, -5],
        [12, -2], [15, 1], [10, 3], [5, 6], [-1, 5], [-8, 6]], "#dce9ddc9", x, y, scale);
      box(ctx, x - 7, y - 1, 9, 1, "#f0edd9b0");
      box(ctx, x + 9, y + 4, 3, 1, "#bfd5c6ce");
    }
    const { petals } = seasonal[season];
    for (const [x, y] of decorations) {
      if (season === "autumn") {
        for (const [dx, dy] of [[0, 1], [4, -2], [-3, 4]]) {
          box(ctx, x + dx, y + dy, 3, 1, "#875848");
          box(ctx, x + dx + 1, y + dy - 1, 2, 2, petals[(x + dx) & 1]);
        }
      } else if (season !== "winter") {
        const color = petals[x % 2];
        for (const [dx, dy] of [[0, 3], [-4, 0], [3, -3]]) {
          if (season === "summer") box(ctx, x + dx - 1, y + dy - 2, 4, 3, "#568f50");
          box(ctx, x + dx, y + dy - 2, season === "summer" ? 3 : 2, 2, color);
          box(ctx, x + dx + 1, y + dy - 1, 1, 1, "#ffe0a2");
        }
      }
    }
  }

  function seasonalAir(ctx, season, weather, elapsed) {
    if (season === "winter" && weather === "snow") {
      for (const [x, y, r] of rain.slice(0, 92)) {
        const sx = ((x + elapsed * (9 + r * 12)) % (W + 50)) - 20;
        const sy = (y + elapsed * (17 + r * 27)) % H;
        box(ctx, sx, sy, r > .72 ? 2 : 1, r > .88 ? 2 : 1, rgb([231, 246, 234], .40 + r * .51));
      }
    } else if (season === "autumn") {
      for (const [x, y, r] of rain.slice(4, 25)) {
        const sx = (x + elapsed * (9 + r * 8)) % W;
        const sy = 91 + (y + elapsed * (4 + r * 9)) % 172;
        box(ctx, sx, sy, 2, 1, r > .6 ? "#da9966a0" : "#ffd09585");
        if (Math.sin(elapsed * 4 + y) > 0) box(ctx, sx + 1, sy + 1, 1, 1, "#a46e5690");
      }
    }
  }


  function palm(ctx, tree, fruit, windShift, season) {
    const { x, y, size, wind } = tree;
    const palmColors = season === "winter" ? ["#356766", "#5a8f79", "#92ab86"] : season === "autumn" ?
      ["#456143", "#838e4c", "#b1a055"] : season === "summer" ?
        ["#1e604e", "#3b8b50", "#70b661"] : ["#275f53", "#498b51", "#6fae55"];
    const px = (v, height = 0) => Math.round(x + v * size * wind + Math.max(0, -height / 50) * windShift);
    const py = v => Math.round(y + v * size);
    function part(points, color) {
      polygon(ctx, points.map(([a, b]) => [px(a, b), py(b)]), color);
    }
    oval(ctx, x + 6, y + 1, 15 * size, 4 * size, "#29515b43");
    part([[-4, 1], [-5, -12], [-2, -25], [3, -35], [8, -35], [3, -24],
      [1, -12], [2, 1], [-1, 3]], "#77594d");
    part([[-3, 0], [-4, -12], [-1, -26], [4, -35], [6, -34], [1, -24], [-1, -11], [0, 1]], "#cb9865");
    for (const p of [[-4, -7, 5], [-4, -12, 4], [-2, -18, 4], [0, -24, 4]]) {
      line(ctx, [[px(p[0]), py(p[1])], [px(p[0] + p[2]), py(p[1] - 1)]], "#8f664e");
    }
    part([[2, -30], [-4, -31], [-9, -29], [-16, -23], [-17, -30], [-22, -27],
      [-20, -36], [-14, -41], [-8, -42], [-4, -40], [0, -47], [7, -51],
      [13, -50], [9, -44], [17, -46], [26, -44], [28, -40], [21, -40],
      [29, -34], [29, -27], [22, -32], [21, -27], [16, -30], [14, -22],
      [9, -27], [4, -26]], palmColors[0]);
    part([[0, -35], [-7, -38], [-16, -37], [-20, -33], [-9, -34], [-15, -29],
      [-8, -32], [0, -32], [6, -33]], palmColors[1]);
    part([[4, -35], [1, -40], [3, -45], [8, -48], [10, -48], [6, -42],
      [8, -39], [12, -41], [19, -43], [25, -42], [20, -40], [14, -39],
      [10, -36]], palmColors[2]);
    part([[6, -35], [13, -38], [20, -37], [27, -33], [27, -30], [21, -33],
      [16, -33], [20, -29], [14, -32], [13, -27], [10, -31]], "#4b9355");
    part([[-20, -35], [-15, -40], [-9, -40], [-4, -38], [-15, -37]], "#9bc168");
    part([[3, -45], [7, -49], [12, -49], [7, -46]], "#b1cc72");
    for (const [frond, color] of [
      [[[4, -35], [-5, -37], [-15, -39]], "#bad476"],
      [[[5, -36], [6, -42], [9, -47]], "#b6ce6c"],
      [[[7, -36], [14, -41], [23, -42]], "#a8c96a"],
      [[[8, -34], [17, -36], [24, -33]], "#80ae59"],
      [[[7, -32], [13, -29], [15, -25]], "#79a954"]
    ]) line(ctx, frond.map(([a, b]) => [px(a, b), py(b)]), color);
    for (const [a, b] of [[-13, -37], [-8, -35], [-10, -32], [9, -45], [16, -39], [21, -38],
      [21, -35], [24, -31], [11, -28], [14, -25]]) {
      box(ctx, px(a, b), py(b), 1, 2, "#b0bf674b");
    }
    if (fruit) {
      box(ctx, px(3) - 2, py(-33), 5, 5, "#45614b");
      box(ctx, px(8) - 2, py(-32), 5, 5, "#587b41");
      box(ctx, px(3) - 1, py(-33), 3, 3, "#b0bb64");
      box(ctx, px(8) - 1, py(-32), 3, 2, "#8ea653");
    }
  }

  function berries(ctx, tree, fruit, season) {
    const { leaf, petals } = seasonal[season];
    const { x, y } = tree;
    oval(ctx, x + 4, y + 1, 15, 4, "#315b4e50");
    box(ctx, x - 2, y - 17, 5, 18, "#835f52");
    box(ctx, x - 1, y - 12, 2, 11, "#c18c63");
    polygon(ctx, [[-17, -12], [-19, -21], [-15, -30], [-8, -31], [-4, -36], [6, -35],
      [10, -31], [15, -30], [20, -22], [18, -11], [11, -7], [2, -9],
      [-5, -6], [-11, -9]], leaf[0], x, y);
    polygon(ctx, [[-17, -17], [-17, -23], [-13, -29], [-8, -28], [-4, -34],
      [4, -33], [8, -28], [15, -28], [17, -23], [15, -17], [9, -16], [2, -19],
      [-2, -15], [-9, -18], [-13, -14]], leaf[1], x, y);
    polygon(ctx, [[-14, -24], [-11, -28], [-7, -28], [-3, -33], [4, -33],
      [5, -29], [1, -28], [-4, -25], [-9, -26]], leaf[2], x, y);
    box(ctx, x + 9, y - 25, 5, 2, "#9db96a");
    box(ctx, x - 11, y - 13, 5, 2, "#558a51");
    if (season === "spring" || season === "winter") for (const [dx, dy] of [[-9, -27], [5, -31], [12, -22], [-11, -14]]) {
      box(ctx, x + dx, y + dy, 3, 2, petals[0]);
    }
    if (fruit) for (const [dx, dy] of [[-10, -22], [3, -27], [10, -16], [-2, -13]]) fruitSprite(ctx, x + dx, y + dy);
  }

  function fruitSprite(ctx, x, y) {
    box(ctx, x + 1, y - 1, 3, 2, "#bac569");
    box(ctx, x - 2, y + 1, 6, 4, "#b85636");
    box(ctx, x - 1, y, 4, 4, "#f6a360");
    box(ctx, x - 1, y + 1, 2, 2, "#ffcd81");
  }

  function cabin(ctx, dark, season) {
    oval(ctx, 221, 151, 41, 9, "#3b664e60");
    box(ctx, 195, 121, 46, 30, "#73544d");
    box(ctx, 196, 122, 39, 26, "#d19766");
    for (let y = 124; y < 148; y += 4) box(ctx, 196, y, 39, 1, "#a57158");
    box(ctx, 196, 145, 46, 5, "#7c5646");
    box(ctx, 213, 129, 12, 21, "#66494a");
    box(ctx, 215, 131, 8, 18, "#a66e57");
    box(ctx, 221, 138, 1, 2, "#eac28a");
    for (const x of [201, 228]) {
      box(ctx, x - 1, 128, 8, 9, "#89594f");
      box(ctx, x, 129, 6, 7, dark ? "#ffce76" : "#93bfc5");
      box(ctx, x + 4, 129, 1, 2, dark ? "#fff0b1" : "#daf1e9");
      box(ctx, x + 2, 129, 1, 7, "#845e50");
      box(ctx, x, 132, 6, 1, "#845e50");
      box(ctx, x - 1, 136, 8, 1, "#f5c883");
    }
    polygon(ctx, [[189, 123], [200, 109], [209, 101], [231, 101], [235, 105],
      [247, 120], [246, 125], [192, 126]], "#713f46");
    polygon(ctx, [[190, 120], [202, 108], [211, 100], [229, 100], [234, 104],
      [243, 117], [239, 121]], "#ca6a52");
    polygon(ctx, [[194, 117], [209, 102], [229, 102], [233, 105], [213, 105], [203, 115]], "#ed9470");
    for (const [y, x, w] of [[106, 208, 25], [110, 204, 32], [114, 200, 39], [118, 196, 44]]) {
      box(ctx, x, y, w, 1, "#a85048");
      box(ctx, x + 3, y + 1, Math.round(w * 0.72), 1, "#dc7658");
      for (let tile = x + 4 + y % 3; tile < x + w - 4; tile += 7) {
        box(ctx, tile, y + 1, .5, 2, "#8f4d45");
        box(ctx, tile + 1, y + 1, 3, .5, "#f09771");
      }
    }
    if (season === "winter") {
      polygon(ctx, [[197, 114], [210, 101], [230, 101], [236, 107], [221, 108], [216, 111], [205, 111], [201, 115]], "#e0e8d5");
      box(ctx, 197, 118, 7, 2, "#d8e6d3");
      box(ctx, 235, 117, 8, 2, "#c7dfcb");
    }
    box(ctx, 226, 99, 6, 10, "#875a55");
    box(ctx, 225, 96, 8, 3, "#b67567");
    box(ctx, 207, 150, 24, 3, "#c79466");
    box(ctx, 205, 153, 28, 2, "#ae8058");
    box(ctx, 243, 139, 5, 7, "#604e44");
    box(ctx, 244, 140, 3, 4, "#ffcd75");
    if (dark) oval(ctx, 246, 145, 11, 9, "#ffc67827");
  }

  function pier(ctx) {
    box(ctx, 338, 182, 84, 5, "#123b5355");
    for (const x of [350, 368, 386, 406, 420]) {
      box(ctx, x, 166, 4, 22, "#594c4b");
      box(ctx, x, 176, 1, 10, "#997758");
    }
    box(ctx, 341, 161, 83, 20, "#644c48");
    box(ctx, 341, 161, 83, 16, "#c38c63");
    box(ctx, 341, 162, 83, 2, "#e0ad75");
    for (let x = 342; x < 423; x += 6) {
      box(ctx, x, 162, 1, 15, "#87644e");
      box(ctx, x + 2, 166 + x % 7, 2, 1, "#dca16e");
      box(ctx, x + 1, 175, 1, 1, "#775848");
    }
    box(ctx, 341, 177, 83, 2, "#9c7158");
    for (const x of [348, 370, 399, 421]) {
      box(ctx, x, 157, 4, 7, "#6e5548");
      box(ctx, x, 157, 4, 2, "#e2ba83");
    }
    box(ctx, 411, 146, 2, 19, "#6a5045");
    box(ctx, 407, 148, 11, 6, "#774e48");
    box(ctx, 407, 146, 11, 5, "#d28551");
    box(ctx, 409, 148, 7, 1, "#f6d48a");
  }

  function gull(ctx, x, y, flap = 0, scale = 1) {
    if (flap) {
      polygon(ctx, [[-12, 0], [-7, -3 * flap], [-3, -2 * flap], [0, 0], [4, -3 * flap],
        [10, -4 * flap], [13, -3 * flap], [8, 0], [4, 3], [-3, 2], [-8, 1]], "#f7edd7", x, y, scale);
      box(ctx, x - 12 * scale, y, 3 * scale, 1, "#506271");
    } else {
      box(ctx, x - 4, y + 2, 8, 1, "#754d46");
      box(ctx, x - 4, y - 4, 9, 6, "#f0e8d6");
      box(ctx, x + 2, y - 7, 6, 6, "#fff4db");
      box(ctx, x - 6, y - 2, 7, 3, "#9faeb3");
      box(ctx, x - 8, y - 1, 4, 2, "#526773");
      box(ctx, x + 8, y - 4, 3, 2, "#efb065");
      box(ctx, x + 6, y - 5, 1, 1, "#2e4253");
    }
  }

  function garden(ctx, x, y, { stage, crop }) {
    if (stage === "empty") {
      oval(ctx, x, y + 2, 12, 5, "#6d8a55");
      for (const [dx, dy] of [[-7, 2], [-1, -2], [5, 1]]) tuft(ctx, x + dx, y + dy, Math.abs(dx) % 3);
      box(ctx, x + 7, y + 2, 3, 2, "#a4ad74");
      return;
    }
    const wet = stage === "watered" || stage === "leafy-wet";
    polygon(ctx, [[-12, -3], [-8, -6], [8, -6], [12, -3], [11, 5], [8, 7], [-10, 7], [-13, 4]], "#686147", x, y);
    polygon(ctx, [[-10, -3], [-7, -5], [8, -5], [11, -2], [9, 5], [-10, 5]], wet ? "#78514a" : "#a87756", x, y);
    for (const dy of [-3, 0, 3]) box(ctx, x - 8, y + dy, 16, 1, wet ? "#a36e51" : "#c89365");
    if (stage === "tilled") return;
    if (stage === "dry" || stage === "watered") {
      for (const dx of [-6, 0, 6]) {
        box(ctx, x + dx, y - 2, 1, 5, "#4e743f");
        box(ctx, x + dx - 2, y - 2, 2, 2, stage === "dry" ? "#a6a25f" : "#9ac96f");
        box(ctx, x + dx + 1, y - 3, 2, 2, "#72964d");
      }
      return;
    }
    if (stage !== "ripe") {
      for (const dx of [-6, 0, 6]) {
        box(ctx, x + dx, y - 4, 1, 7, "#4b7650");
        box(ctx, x + dx - 3, y - 4, 3, 3, "#8fb461");
        box(ctx, x + dx + 1, y - 6, 3, 4, "#6e9e55");
        box(ctx, x + dx + 2, y - 6, 1, 2, "#b1c875");
      }
      if (stage === "pest") {
        box(ctx, x + 2, y - 5, 4, 3, "#754e42");
        box(ctx, x + 3, y - 6, 2, 1, "#e9ab66");
      }
      return;
    }
    if (crop === "melon" || crop === "pumpkin") {
      const [shade, flesh, stripe] = crop === "melon" ? ["#356448", "#6ba65f", "#9cc46a"] : ["#a75b3f", "#e69551", "#ffbc65"];
      for (const dx of [-5, 5]) {
        polygon(ctx, [[-4, -1], [-2, -4], [2, -4], [4, -2], [4, 2], [2, 4], [-3, 3], [-5, 1]], shade, x + dx, y);
        box(ctx, x + dx - 3, y - 2, 6, 4, flesh);
        box(ctx, x + dx - 1, y - 3, 1, 6, stripe);
        box(ctx, x + dx + 1, y - 5, 2, 2, "#537a48");
      }
      return;
    }
    const [root, light] = crop === "radish" ? ["#afbac0", "#f3ead3"] : ["#914855", "#cc7563"];
    for (const dx of [-6, 0, 6]) {
      box(ctx, x + dx - 2, y + 1, 4, 4, root);
      box(ctx, x + dx - 1, y, 4, 4, light);
      box(ctx, x + dx - 2, y - 4, 5, 3, "#417055");
      box(ctx, x + dx - 1, y - 5, 3, 3, "#a8c56c");
    }
  }

  function paintCompostBin(ctx, ready, sheltered) {
    const { x, y } = compostBin;
    oval(ctx, x, y - 3, 12, 4, "#38635366");
    box(ctx, x - 9, y - 12, 18, 10, "#674943");
    box(ctx, x - 7, y - 11, 14, 8, "#ae7750");
    box(ctx, x - 7, y - 7, 14, 1, "#815a46");
    box(ctx, x - 9, y - 13, 18, 3, "#d29d60");
    box(ctx, x - 7, y - 14, 14, 2, ready ? "#634938" : "#83604d");
    if (ready) {
      box(ctx, x - 5, y - 16, 8, 3, "#79553c");
      box(ctx, x - 4, y - 16, 4, 1, "#a4b66b");
      box(ctx, x + 1, y - 17, 4, 2, "#7ba15c");
    }
    box(ctx, x - 2, y - 9, 4, 3, ready ? "#b4c17a" : "#ba9565");
    if (sheltered) {
      box(ctx, x - 12, y - 23, 2, 20, "#735448");
      box(ctx, x + 10, y - 23, 2, 20, "#735448");
      polygon(ctx, [[-14, -20], [-9, -28], [8, -28], [14, -20]], "#795349", x, y);
      polygon(ctx, [[-12, -22], [-8, -27], [7, -27], [11, -22]], "#c69463", x, y);
      box(ctx, x - 9, y - 25, 18, 1, "#e4b579");
    }
  }

  function vendor(ctx) {
    oval(ctx, 330, 206, 23, 5, "#38655a62");
    box(ctx, 310, 185, 3, 20, "#66464a");
    box(ctx, 347, 185, 3, 20, "#66464a");
    box(ctx, 312, 197, 36, 8, "#995c4a");
    box(ctx, 314, 199, 31, 3, "#c58f59");
    box(ctx, 310, 194, 40, 4, "#ecb77a");
    for (const [x, color] of [[315, "#78b076"], [320, "#efad64"], [340, "#c68163"]]) {
      box(ctx, x, 190, 5, 4, color);
      box(ctx, x + 1, 189, 3, 1, "#f8c77b");
    }
    box(ctx, 329, 182, 9, 11, "#403942");
    box(ctx, 329, 188, 8, 5, "#d29c64");
    box(ctx, 330, 183, 7, 6, "#edb985");
    box(ctx, 334, 184, 1, 2, "#3b3544");
    box(ctx, 327, 179, 12, 3, "#b47b52");
    box(ctx, 325, 181, 16, 2, "#efd296");
    polygon(ctx, [[310, 174], [347, 174], [353, 183], [306, 183]], "#b36257");
    for (const x of [311, 323, 335, 347]) {
      polygon(ctx, [[x, 174], [x + 4, 174], [x + 5, 183], [x - 1, 183]], "#efd092");
    }
    box(ctx, 306, 183, 47, 2, "#874a47");
    box(ctx, 314, 174, 30, 1, "#ffc988");
  }

  function ancientShell(ctx, x, y, elapsed) {
    box(ctx, x - 4, y, 9, 2, "#bd8c61");
    polygon(ctx, [[-5, 0], [-5, -3], [-3, -6], [2, -7], [6, -3], [4, 0]], "#ce8b80", x, y);
    box(ctx, x - 3, y - 4, 6, 3, "#ffddb2");
    box(ctx, x - 2, y - 6, 2, 2, "#fff2cc");
    if (Math.sin(elapsed * 3) > .3) {
      box(ctx, x + 6, y - 9, 1, 5, "#fff5d0");
      box(ctx, x + 4, y - 7, 5, 1, "#fff5d0");
    }
  }

  const playerColors = {
    s: "#252738", S: "#3c3145", h: "#653b43", H: "#a35148", r: "#d17a51",
    R: "#ec995d", a: "#ffbf76", p: "#ffd09c", P: "#dd956e", c: "#b97862",
    b: "#265467", B: "#3a827e", T: "#68aaa0", o: "#283c52", O: "#55687c",
    d: "#718298", k: "#ad774c", K: "#d5a268", e: "#ffebc6", z: "#a65549"
  };
  const playerLooks = {
    female: { ...playerColors, h: "#75444c", H: "#a86557", r: "#9a6754", R: "#d7a276", a: "#ffe0a2",
      b: "#51496f", B: "#836899", T: "#bc95bf", k: "#77544e", K: "#bb8d6a" },
    male: { ...playerColors, h: "#3e343d", H: "#655054", r: "#975047", R: "#c97959", a: "#f5b972",
      b: "#204d58", B: "#3c697a", T: "#7e9db1", k: "#695641", K: "#ab9763" },
    other: { ...playerColors, h: "#393d55", H: "#59627b", r: "#4f728f", R: "#6d9eae", a: "#d5e6dc",
      b: "#704b37", B: "#ad7647", T: "#e8b06d", k: "#3d5956", K: "#759883" }
  };

  function avatarColors(gender) {
    return playerLooks[gender] ?? playerColors;
  }
  const front = [
    "......hhrrrr.......", ".....hrRaaarh......", "....hrRRaarRrh.....",
    "...hHrRRRRrRrhh....", "...hhHRRrRrHhhs....", "..SSSSHHhHhSSSSS...",
    "...hccPpppPPch.....", "...hcPpepppePh.....", "...hcPspppsPPh.....",
    "....cPppppcPh......", "....hcPzppch.......", ".....ssPPss........",
    "....kKTTTTBK.......", "...kKTTBBTBKk......", "...PBKBbBBKKP......",
    "...pBKBBBBKBp......", "...pBKBbBBKBc......", "....oBBBBbo........",
    "....oOodOOo........", "....oO..dOo........", "....oOd..Oo........",
    "....soO..oos.......", "...ssoo..oos......."
  ];
  const rear = [
    "......hhrrrr.......", ".....hrRaaarh......", "....hrRRaarRrh.....",
    "...hHrRRRRrRrhh....", "...hhHRRrRrHhhs....", "..SSSSHHhHhSSSSS...",
    "...hhhhHhhhhsh.....", "...hhHHHHHhhsh.....", "...hHHhHhhhssh.....",
    "....hhHHhhhsh......", "....shhHhhs........", ".....sscss.........",
    "....BKKKKKKB.......", "...TBKaaaaKBT......", "...BBkKKKKkBB......",
    "...pBKKkkKKBp......", "...pBkaKKakBP......", "....okkkkkko.......",
    "....oOodOOo........", "....oO..dOo........", "....oOd..Oo........",
    "....soO..oos.......", "...ssoo..oos......."
  ];
  const side = [
    ".......hhrrrr......", "......hrRaaarh.....", ".....hRRaarRrh.....",
    "....hhRRRRrRrhh....", "....hHhRrrrHhhs....", "...SSSShHHhSSSSS...",
    "....hhHhccPPpch....", "....hhHhcPpepp.....", "....hhHhcPpspp.....",
    ".....hHhcPppcPp....", ".....shhccpzzp.....", ".....kkKssPc.......",
    "....kkKTBTB........", "....kKaKTTBB.......", "....kkKKBBpB.......",
    "....kkKKBBpB.......", ".....kKkBBPB.......", "......oBBbbo.......",
    "......oOddOo.......", "......oO.Oo........", "......oO.Odo.......",
    "......soo.oos......", ".....ssoo.oos......"
  ];

  function avatar(ctx, player, elapsed, lean = 0) {
    const { x, y, facing, walking, gender } = player;
    const step = walking ? Math.sin(elapsed * 16) : 0;
    const colors = avatarColors(gender);
    oval(ctx, x + 2, y + 1, 9, 3, "#25485880");
    const sprite = facing === "up" ? rear : facing === "down" ? front : side;
    const flip = facing === "left" ? -1 : 1;
    if (gender === "female") {
      const tailX = x - flip * (facing === "right" || facing === "left" ? 5 : 4);
      const tailY = y - 13 - Math.round(Math.abs(step));
      box(ctx, tailX - 2, tailY, 5, 6, colors.h);
      box(ctx, tailX - 2, tailY + 1, 2, 4, colors.H);
      box(ctx, tailX - 1, tailY, 3, 1, colors.T);
    }
    sprite.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const color = colors[row[i]];
        if (!color) continue;
        const foot = j >= 19 ? (i < 9 ? step : -step) : 0;
        const sway = j < 18 ? Math.round(Math.abs(step) * .85) : 0;
        const offset = j < 12 ? lean : 0;
        box(ctx, x + flip * (i - 8 + Math.round(foot * 1.4)) + offset,
          y + j - 22 - Math.max(0, Math.round(foot * 2)) - sway, 1, 1, color);
      }
    });
    if (gender === "other") {
      const scarf = flip * (facing === "up" ? 3 : 1);
      box(ctx, x + scarf, y - 11, 4, 1, "#e9cb8b");
      box(ctx, x + scarf + flip * 3, y - 10, 3, 2, "#cb8d64");
    } else if (gender === "male") {
      box(ctx, x - 4 * flip, y - 11, 2, 2, colors.b);
      box(ctx, x + 4 * flip, y - 11, 2, 2, colors.B);
    }
  }

  function castShadows(ctx, hour) {
    const low = Math.max(0, 1 - Math.min(Math.abs(hour - 6.8), Math.abs(hour - 17.8)) / 2.1);
    if (low <= .03) return;
    const direction = hour < 12 ? 1 : -1;
    for (const tree of trees) {
      const { x, y, size } = tree;
      const length = (13 + low * 18) * size;
      polygon(ctx, [[0, -1], [direction * (length - 3), 6], [direction * (length + 9), 9],
        [direction * (length + 6), 13], [direction * (length - 9), 11], [1, 2]], rgb([53, 68, 78], .22 * low), x, y);
    }
  }

  function driftwood(ctx, x, y) {
    oval(ctx, x, y + 1, 9, 2, "#446d5f6a");
    polygon(ctx, [[-9, 0], [-7, -4], [0, -4], [3, -6], [8, -6], [10, -2], [6, 1]], "#735244", x, y);
    line(ctx, [[x - 7, y - 2], [x, y - 3], [x + 5, y - 5], [x + 8, y - 4]], "#c69468", 2);
    box(ctx, x + 6, y - 3, 3, 2, "#e4b680");
  }

  function paintBench(ctx, x, y) {
    oval(ctx, x, y + 1, 16, 4, "#4c684c66");
    for (const dx of [-11, 9]) {
      box(ctx, x + dx, y - 13, 3, 13, "#6a5249");
      box(ctx, x + dx, y - 15, 3, 2, "#e4b783");
    }
    box(ctx, x - 14, y - 14, 28, 6, "#a87152");
    box(ctx, x - 14, y - 14, 28, 2, "#d8a478");
    box(ctx, x - 14, y - 7, 28, 5, "#855e4d");
    box(ctx, x - 13, y - 7, 26, 2, "#eac18f");
  }

  function paintExpansion(ctx, shore, season, elapsed) {
    polygon(ctx, expansionBeach, "#72cabb85", -8, -33, 1.16);
    line(ctx, [[18, 210], [21, 224], [35, 234], [53, 235], [68, 226]], "#b8ead184");
    const wash = Math.floor(Math.sin(elapsed * 1.8) * 2);
    box(ctx, 15, 207 + wash, 6, 1, "#c8efcf88");
    box(ctx, 34, 233 + wash, 15, 1, "#cef1d39a");
    polygon(shore, expansionBeach, "#b78360", 0, 2);
    polygon(shore, expansionBeach, "#edc48a");
    polygon(shore, [[25, 199], [27, 183], [35, 174], [48, 171], [60, 175], [69, 183], [73, 198], [74, 213], [65, 223], [49, 225], [32, 219], [27, 213]],
      seasonal[season].grass[0]);
    for (const [x, y, style] of [[27, 208, 2], [34, 195, 1], [57, 191, 0], [70, 220, 1], [43, 221, 2]]) tuft(shore, x, y, style);
    stone(shore, 24, 215, .47);
    stone(shore, 61, 224, .45);
  }

  function paintExpansionBridge(ctx) {
    box(ctx, 68, 201, 27, 10, "#4b6260");
    box(ctx, 68, 197, 27, 10, "#a57555");
    for (let x = 69; x < 95; x += 4) {
      box(ctx, x, 197, 3, 9, "#c89969");
      box(ctx, x, 197, 3, 1, "#e8bf8b");
    }
    for (const x of [68, 81, 94]) {
      box(ctx, x, 194, 2, 5, "#805e4d");
      box(ctx, x, 205, 2, 5, "#805e4d");
      box(ctx, x, 205, 2, 1, "#e6b77c");
    }
  }

  function paintCoop(ctx, upgraded) {
    if (upgraded) {
      polygon(ctx, [[25, 189], [34, 182], [65, 182], [74, 188], [74, 201], [64, 204], [28, 202], [23, 197]], "#c9b887");
      line(ctx, [[23, 195], [28, 200], [42, 202]], "#a38260");
      line(ctx, [[58, 202], [73, 200], [75, 195]], "#a38260");
      for (const [x, y] of [[23, 191], [28, 198], [41, 200], [59, 200], [72, 198], [74, 193]]) {
        box(ctx, x, y - 2, 2, 6, "#9d7959");
        box(ctx, x, y - 2, 2, 1, "#edc994");
      }
      box(ctx, 25, 173, 16, 15, "#9d6550");
      box(ctx, 27, 176, 13, 10, "#d6a774");
      box(ctx, 28, 178, 6, 5, "#536961");
      polygon(ctx, [[22, 174], [27, 168], [39, 165], [46, 172], [43, 177], [23, 177]], "#436860");
      polygon(ctx, [[24, 173], [29, 169], [39, 167], [43, 172]], "#83a18a");
      box(ctx, 71, 186, 5, 3, "#a88762");
      box(ctx, 72, 185, 4, 1, "#e5bb78");
    }
    oval(ctx, 46, 187, 16, 4, "#45594d63");
    box(ctx, 34, 175, 25, 12, "#8c5c4d");
    box(ctx, 36, 176, 21, 8, "#c28d61");
    box(ctx, 41, 178, 8, 9, "#644f47");
    box(ctx, 51, 177, 4, 5, "#f7dca1");
    polygon(ctx, [[32, 175], [36, 170], [54, 168], [61, 175], [59, 178], [33, 178]], "#536f69");
    polygon(ctx, [[34, 174], [37, 171], [54, 170], [59, 174]], "#7d9c86");
    oval(ctx, 62, 193, 7, 3, "#4b8181");
    oval(ctx, 62, 192, 5, 2, "#83bfae");
    box(ctx, 36, 187, 1, 7, "#a7825f");
    box(ctx, 54, 187, 1, 7, "#a7825f");
    box(ctx, 36, 190, 19, 1, "#d0aa76");
  }

  const livestockPerches = [[33, 194], [56, 197], [66, 190], [44, 199], [26, 189], [70, 198], [35, 201], [59, 190]];

  function paintLivestock(ctx, { kind, fed, matureDay }, index, elapsed, day) {
    const [homeX, y] = livestockPerches[index];
    const x = homeX + Math.round(Math.sin(elapsed * 2.3 + index) * 2);
    const duck = kind === "duck";
    if (matureDay > day) {
      oval(ctx, x, y + 1, 3, 1, "#44625066");
      box(ctx, x - 2, y - 2, 4, 2, duck ? "#eec878" : "#f3ca94");
      box(ctx, x + 1, y - 4, 3, 3, duck ? "#fbe39a" : "#ffe5a5");
      box(ctx, x + 3, y - 3, 2, 1, "#c77949");
      box(ctx, x + 2, y - 4, 1, 1, "#675744");
      return;
    }
    const duckOrPeck = fed >= 0 && Math.sin(elapsed * 3 + index) > .6;
    oval(ctx, x, y + 1, 5, 1.5, "#44625066");
    box(ctx, x - 3, y - 4, 6, 3, duck ? "#edd4a4" : "#f9e5ba");
    box(ctx, x - 2, y - 1, 4, 1, duck ? "#c5a47c" : "#d9b58d");
    box(ctx, x + 1, y - (duckOrPeck ? 4 : 6), 3, 3, duck ? "#79a38c" : "#f1d9ac");
    box(ctx, x + 3, y - (duckOrPeck ? 3 : 5), 2, 1, "#c77949");
    if (!duck) box(ctx, x + 2, y - (duckOrPeck ? 5 : 7), 2, 1, "#ad6959");
  }

  function fishingLine(ctx, player, elapsed, fishing, tugging, offset) {
    const y = player.y + offset + Math.sin(elapsed * (tugging ? 17 : 4)) * (tugging ? 3 : 1) + (fishing === "bite" ? 2 : 0);
    line(ctx, [[player.x + 3, player.y - 7], [player.x + 12, player.y - 19]], "#e6bd80");
    line(ctx, [[player.x + 12, player.y - 19], [player.x + 17, y - 8], [player.x + 12, y]], "#f4e9c5aa");
    oval(ctx, player.x + 12, y, fishing === "bite" ? 6 : 4, 2, "#bde9dc8c");
    box(ctx, player.x + 11, y - 2, 3, 3, fishing === "bite" ? "#ffd079" : "#e78158");
  }

  function paintEastBay(ctx, land, projects, elapsed) {
    if (projects.includes("east-bay")) {
      polygon(ctx, eastBay, "#a4eeda55", 5, 4);
      polygon(ctx, eastBay, "#82d8b95b", 3, 2);
      polygon(land, eastBay, "#a47654", 0, 2);
      polygon(land, eastBay, "#efd295");
      polygon(land, [[319, 214], [355, 213], [379, 217], [397, 232], [386, 246],
        [361, 245], [342, 234]], "#91a46c");
      box(land, 352, 235, 57, 11, "#946b50");
      box(land, 352, 235, 57, 8, "#d6a977");
      for (let x = 357; x < 409; x += 6) box(land, x, 235, 1, 9, "#946b50");
      Archipelago.boat(land, 403, 251 + Math.sin(elapsed * 2) * .7, .66);
      if (projects.includes("fishing-club")) {
        box(land, 350, 219, 34, 14, "#b47d58");
        box(land, 351, 224, 32, 2, "#dda472");
        box(land, 365, 221, 9, 12, "#674d45");
        box(land, 355, 221, 7, 5, "#a9d3bf");
        box(land, 376, 221, 6, 5, "#a9d3bf");
        polygon(land, [[347, 221], [353, 211], [381, 211], [388, 221]], "#3d7779");
        box(land, 354, 213, 26, 1, "#82b6a7");
        box(land, 357, 217, 8, 1, "#82b6a7");
      }
    }
  }

  function paintTerraceShore(ctx, ground) {
    polygon(ctx, tideTerrace, "#77ddca58", 0, 4);
    polygon(ctx, tideTerrace, "#b4edcf66", 0, 2);
    polygon(ground, tideTerrace, "#a97b57", 0, 1);
    polygon(ground, tideTerrace, "#edc88e", 0, -1);
    line(ground, [[76, 258], [86, 267], [100, 271], [121, 274], [151, 274], [174, 272], [196, 267]], "#f8e4ae");
    for (const [x, y] of [[79, 248], [87, 263], [116, 271], [165, 272], [197, 259], [192, 265]]) {
      box(ground, x, y, 3, 1, "#b78c62");
      box(ground, x + 1, y - 1, 3, 1, "#ffe0a5");
    }
  }

  function paintTerraceDeck(ctx) {
    const deck = [[85, 236], [110, 232], [131, 234], [140, 230], [150, 234], [151, 239],
      [183, 239], [195, 246], [198, 257], [191, 267], [177, 270],
      [107, 270], [93, 265], [83, 256]];
    polygon(ctx, deck, "#937057", 0, 2);
    polygon(ctx, deck, "#d2a279");
    polygon(ctx, [[87, 237], [110, 234], [131, 236], [140, 232], [148, 235], [149, 242],
      [181, 242], [193, 247], [195, 254], [189, 265], [174, 268], [109, 268], [94, 263], [86, 255]], "#dab186");
    for (const [y, left, right] of [[241, 86, 178], [246, 85, 192], [251, 84, 196], [256, 86, 197],
      [261, 92, 193], [266, 104, 185]]) {
      box(ctx, left, y, right - left, 1, "#a67a60");
      box(ctx, left + 1, y - 1, right - left - 2, .5, "#eed0a4");
      box(ctx, left + 17 + (y % 4) * 5, y - 4, 1, 4, "#b48366");
      box(ctx, right - 15 - (y % 3) * 8, y - 4, 1, 4, "#b48366");
    }
    line(ctx, [[87, 254], [94, 262], [108, 268], [177, 268], [190, 265], [195, 259]], "#704e49");
    for (const [x, y] of [[88, 254], [96, 262], [119, 268], [184, 266], [194, 260]]) {
      box(ctx, x, y - 4, 2, 6, "#805958");
      box(ctx, x, y - 4, 2, 1, "#f2c18a");
    }
  }

  function paintRestaurant(ctx, dark, open, elapsed) {
    oval(ctx, 107, 246, 28, 5, "#6e584c65");
    box(ctx, 84, 224, 42, 23, "#6e4e49");
    box(ctx, 86, 227, 37, 18, "#bd8565");
    box(ctx, 85, 243, 40, 4, "#926951");
    for (const y of [232, 238, 242]) box(ctx, 86, y, 37, 1, "#a6745b");
    box(ctx, 103, 231, 10, 15, "#69484b");
    box(ctx, 105, 233, 6, 12, "#a87256");
    box(ctx, 109, 239, 1, 2, "#f3d092");
    for (const x of [89, 116]) {
      box(ctx, x - 1, 233, 9, 9, "#744c48");
      box(ctx, x, 234, 7, 6, dark ? "#ffda8c" : "#93c4bc");
      box(ctx, x + 3, 234, 1, 6, "#785c4e");
      box(ctx, x + 1, 235, 2, 1, dark ? "#fff0b4" : "#d0e4c4");
      box(ctx, x - 1, 241, 9, 1, "#e2ac79");
    }
    polygon(ctx, [[76, 226], [87, 213], [95, 208], [116, 208], [122, 211], [132, 224], [130, 229], [78, 229]], "#76494d");
    polygon(ctx, [[79, 225], [91, 212], [96, 209], [115, 209], [121, 212], [129, 224]], "#c77b62");
    polygon(ctx, [[83, 223], [94, 211], [116, 211], [120, 213], [97, 214], [89, 223]], "#e6a17a");
    for (const [y, x, width] of [[214, 92, 29], [218, 88, 36], [222, 84, 43]]) {
      box(ctx, x, y, width, 1, "#a45c54");
      for (let tile = x + 4; tile < x + width - 2; tile += 6) box(ctx, tile, y - 1, 1, 2, "#a45c54");
    }
    box(ctx, 113, 206, 5, 8, "#915b53");
    box(ctx, 112, 205, 7, 2, "#d08f6e");
    if (open && elapsed) {
      const drift = elapsed * 6 % 8;
      box(ctx, 114 + drift * .35, 203 - drift, 3, 1, "#f7edcd65");
    }
    box(ctx, 80, 225, 49, 2, "#7c534e");
    for (let i = 0; i < 12; i++) {
      box(ctx, 82 + i * 4, 228, 4, i % 2 ? 4 : 3, i % 2 ? "#b96c5a" : "#f1d392");
    }
    box(ctx, 122, 230, 10, 8, "#704d47");
    box(ctx, 123, 231, 8, 6, open ? "#cce1ab" : "#bfd3aa");
    box(ctx, 125, 233, 4, 2, "#567b63");
    box(ctx, 126, 232, 2, 1, "#567b63");
    box(ctx, 103, 247, 11, 2, "#a3795e");
    box(ctx, 102, 249, 13, 1, "#e8c79b");
    for (const x of [84, 123]) {
      box(ctx, x, 242, 3, 3, "#a46651");
      box(ctx, x - 1, 240, 5, 2, "#6c9063");
    }
  }

  function paintRestaurantTable(ctx, index, lunch, elapsed) {
    const [x, y] = restaurantTables[index];
    const served = lunch?.open && index < lunch.served;
    const seated = lunch?.open && index <= lunch.served;
    oval(ctx, x, y + 3, 8, 3, "#77645850");
    box(ctx, x - 6, y - 3, 2, 5, "#8b6153");
    box(ctx, x + 5, y - 2, 2, 5, "#8b6153");
    if (seated) {
      const nod = Math.sin(elapsed * 2.4 + index) > .82 ? 1 : 0;
      Archipelago.resident(ctx, x + 6, y + 1 + nod, index % 2 ? "#5d787f" : "#66886e", "#d89a72");
    }
    box(ctx, x - 2, y, 5, 4, "#976a55");
    box(ctx, x - 5, y - 3, 11, 4, "#a96c55");
    box(ctx, x - 4, y - 4, 9, 3, "#eed5a2");
    box(ctx, x - 1, y - 3, 3, 2, served ? "#bc6d4b" : "#fff1c6");
    if (index >= 2) return;
    box(ctx, x, y - 13, 1, 10, "#926a56");
    polygon(ctx, [[-11, -11], [-6, -17], [4, -17], [10, -13], [11, -10], [-10, -10]], "#4e8b84", x, y);
    polygon(ctx, [[-8, -12], [-4, -16], [3, -16], [6, -12]], index ? "#e0ad78" : "#b7d4a5", x, y);
    box(ctx, x - 10, y - 10, 21, 1, index ? "#d9aa7b" : "#abd0a6");
  }

  function draw(ctx, scene) {
    const { elapsed, hour, weather, player, harvested, pending, flightSeconds, fishing, target,
      season, crops, showMarket, showShell, showTimber = true, tugging, compostReady, projects = [], animals = [], lunch,
      restaurantPrep, trapPlaced, day } = scene;
    const expanded = projects.includes("expansion");
    const light = daylight(hour, weather, season);
    skyAndSea(ctx, light, hour, weather, elapsed);
    coast(ctx, light, weather, elapsed);
    land.clearRect(0, 0, W, H);
    if (expanded) paintExpansion(ctx, land, season, elapsed);
    paintEastBay(ctx, land, projects, elapsed);
    const terrace = projects.includes("tidal-terrace");
    const restaurant = projects.includes("restaurant");
    if (terrace) paintTerraceShore(ctx, land);
    land.drawImage(terrainLayer(season), 0, 0, W, H);
    if (terrace) paintTerraceDeck(land);
    if (expanded) paintExpansionBridge(land);
    castShadows(land, hour);
    beds.slice(0, expanded ? beds.length : basePlotCount).forEach(([x, y], plot) => garden(land, x, y, crops[plot]));
    Archipelago.boat(land, 352, 192 + Math.sin(elapsed * 2) * .8, .78);
    pier(land);
    if (showShell) ancientShell(land, 105, 223, elapsed);
    const objects = [
      { y: 153, paint: () => cabin(land, hour < 6 || hour > 18.7, season) },
      { y: 167, paint: () => Archipelago.resident(land, 351, 167, "#356c72", "#ebbb80") },
      { y: compostBin.y - 3, paint: () => paintCompostBin(land, compostReady, projects.includes("shed")) },
      ...timberSpots.filter(spot => showTimber && !harvested(spot.id)).map(spot =>
        ({ y: spot.y, paint: () => driftwood(land, spot.x, spot.y) })),
      ...trees.map(tree => ({ y: tree.y, paint: () => palm(land, tree, tree.id && !harvested(tree.id), Math.sin(elapsed * (weather === "storm" ? 6 : 1.6) + tree.x) * (weather === "storm" ? 4 : .9), season) })),
      ...berryTrees.map(tree => ({ y: tree.y, paint: () => berries(land, tree, !harvested(tree.id), season) }))
    ];
    if (restaurant) {
      const dark = hour < 6 || hour > 18.7;
      objects.push({ y: restaurantFootprint.bottom, paint: () => paintRestaurant(land, dark, lunch?.open || restaurantPrep, elapsed) });
      restaurantTables.forEach(([, y], index) => {
        objects.push({ y: y + 1, paint: () => paintRestaurantTable(land, index, lunch, elapsed) });
      });
    }
    if (player) objects.push({ y: player.y, paint: () => avatar(land, player, elapsed, tugging ? 1 : 0) });
    if (showMarket) objects.push({ y: 203, paint: () => vendor(land) });
    if (projects.includes("bench")) objects.push({ y: benchSpot.y, paint: () => paintBench(land, benchSpot.x, benchSpot.y) });
    if (expanded) {
      objects.push({ y: 188, paint: () => paintCoop(land, projects.includes("coop-expansion")) });
      animals.forEach((animal, index) => {
        objects.push({ y: livestockPerches[index][1], paint: () => paintLivestock(land, animal, index, elapsed, day) });
      });
    }
    objects.sort((a, b) => a.y - b.y).forEach(object => object.paint());
    if (!harvested("drift-fruit")) {
      const y = 253 + Math.sin(elapsed * 2.6) * 1.6;
      oval(land, 222, y + 3, 6, 1.5, "#f4efd477");
      fruitSprite(land, 222, y);
    }
    if (light.alpha > 0.01) {
      land.globalCompositeOperation = "source-atop";
      box(land, 0, 0, W, H, rgb(light.shade, light.alpha));
      land.globalCompositeOperation = "source-over";
    }
    ctx.drawImage(land.canvas, 0, 0, W, H);
    if (trapPlaced) {
      const bob = Math.sin(elapsed * 2) * .7;
      oval(ctx, 240, 257 + bob, 8, 3, "#174f6190");
      box(ctx, 236, 249 + bob, 10, 6, "#5c5e4b");
      box(ctx, 236, 249 + bob, 10, 1, "#edd29a");
      for (const x of [237, 240, 243, 245]) box(ctx, x, 250 + bob, 1, 5, "#c7a773");
      box(ctx, 237, 252 + bob, 8, 1, "#c7a773");
      line(ctx, [[240, 249 + bob], [245, 246 + bob]], "#f4d990");
      box(ctx, 245, 245 + bob, 4, 2, "#e47958");
    }
    if (hour < 6 || hour > 18.7) {
      oval(ctx, 246, 143, 9, 6, "#ffd08124");
      box(ctx, 244, 140, 2, 3, "#ffd37c");
      if (restaurant) for (const x of [92, 119]) {
        oval(ctx, x, 237, 10, 7, "#ffcb7933");
        box(ctx, x + 1, 235, 1, 2, "#ffdd9a");
      }
    }
    if (target) {
      oval(ctx, target.x, target.y, 4, 2, "#fff3d496");
      oval(ctx, target.x, target.y, 2, 1, "#e4aa6299");
    }
    if (pending === "home") gull(ctx, 412, 145);
    if (pending === "depart") gull(ctx, 412 - flightSeconds * 77, 145 - flightSeconds * 23, Math.cos(elapsed * 13));
    if (pending === "return") gull(ctx, 412 - (6 - flightSeconds) * 77, 145 - (6 - flightSeconds) * 23, Math.cos(elapsed * 13));
    const wildX = (elapsed * 17 + 235) % (W + 30) - 15;
    gull(ctx, wildX, 43 + Math.sin(elapsed * 1.1) * 2, Math.cos(elapsed * 8), .48);
    gull(ctx, wildX - 13, 48 + Math.sin(elapsed * 1.1 + 1) * 2, Math.cos(elapsed * 8 + 1), .38);
    if (fishing) fishingLine(ctx, player, elapsed, fishing, tugging, 27);
    weatherAir(ctx, season, weather, elapsed);
  }

  function weatherAir(ctx, season, weather, elapsed) {
    seasonalAir(ctx, season, weather, elapsed);
    if (weather === "rain" || weather === "storm") {
      const gale = weather === "storm";
      for (const [x, y, r] of rain) {
        const dx = (x + elapsed * (gale ? 295 : 67)) % (W + 80) - 35;
        const dy = (y + elapsed * ((gale ? 205 : 153) + r * 50)) % (H + 15) - 6;
        line(ctx, [[dx, dy], [dx + (gale ? 11 : 2), dy + 4 + r * 3]], rgb([180, 232, 236], .23 + r * .28));
        if (gale && r > .73) box(ctx, dx - 8, dy + 3, 5, 1, "#b3d5bb58");
      }
    }
  }

  const resetImpact = { x: 222, y: 149 };
  const resetEntry = { x: 461, y: 9 };
  const resetAngle = Math.atan2(resetImpact.y - resetEntry.y, resetImpact.x - resetEntry.x);
  const resetRandom = random(117);
  const resetParticles = Array.from({ length: 38 }, () => ({
    angle: resetRandom() * Math.PI * 2, distance: 28 + resetRandom() * 94, size: 2 + Math.floor(resetRandom() * 4)
  }));
  const resetCloud = [[-11, -1], [-8, -1], [-8, -7], [-3, -7], [-3, -11], [4, -11], [4, -8], [9, -8],
    [9, -4], [13, -4], [13, 4], [7, 4], [7, 7], [-6, 7], [-6, 5], [-12, 5], [-12, 0]];

  function resetMissile(ctx, progress) {
    const x = resetEntry.x + (resetImpact.x - resetEntry.x) * progress;
    const y = resetEntry.y + (resetImpact.y - resetEntry.y) * progress;
    for (let i = 12; i > 0; i--) {
      const at = Math.max(0, progress - i * .027);
      const px = resetEntry.x + (resetImpact.x - resetEntry.x) * at;
      const py = resetEntry.y + (resetImpact.y - resetEntry.y) * at;
      polygon(ctx, resetCloud, rgb([216, 211, 180], .67 - i * .043), px, py, .38 + i * .036);
    }
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(resetAngle);
    polygon(ctx, [[-29, -2], [-22, -4], [-13, -3], [-13, 3], [-22, 4]], "#ce7955");
    polygon(ctx, [[-27, 0], [-18, -2], [-12, -1], [-12, 2], [-20, 2]], "#ffe09a");
    polygon(ctx, [[-15, -8], [-8, -4], [6, -4], [14, 0], [6, 4], [-8, 4], [-15, 8]], "#293d4b");
    polygon(ctx, [[-13, -5], [-8, -3], [6, -3], [12, 0], [6, 2], [-13, 2]], "#cbd1bf");
    polygon(ctx, [[4, -3], [7, -3], [13, 0], [7, 3], [4, 3]], "#d58a61");
    box(ctx, -9, -2, 12, 1, "#eef0d7");
    ctx.restore();
  }

  function resetBlast(ctx, progress) {
    const { x, y } = resetImpact;
    const growth = 1 - (1 - progress) ** 3;
    const ring = Array.from({ length: 13 }, (_, index) => {
      const a = index * Math.PI / 6;
      return [x + Math.cos(a) * (19 + growth * 117), y + Math.sin(a) * (10 + growth * 50)];
    });
    line(ctx, ring, rgb([247, 209, 141], .68 * (1 - progress)), 2);
    for (const particle of resetParticles) {
      const spread = particle.distance * growth;
      const px = x + Math.cos(particle.angle) * spread;
      const py = y + Math.sin(particle.angle) * spread * .55 - progress * 7;
      box(ctx, px, py, particle.size, particle.size, rgb([245, 164, 91], .87 * (1 - progress)));
    }
    const smoke = [
      { x: -38, y: 6, scale: 1.65 }, { x: 35, y: 8, scale: 1.8 }, { x: -16, y: -14, scale: 2.1 },
      { x: 18, y: -28, scale: 2.05 }, { x: -1, y: 2, scale: 2.75 }
    ];
    for (const puff of smoke) {
      polygon(ctx, resetCloud, rgb([75, 82, 84], .86), x + puff.x * growth, y + puff.y * growth, .42 + puff.scale * growth);
      polygon(ctx, resetCloud, rgb([164, 136, 107], .77), x + puff.x * growth - 4, y + puff.y * growth - 4,
        .55 + puff.scale * growth * .64);
    }
    if (progress < .64) {
      polygon(ctx, resetCloud, rgb([223, 138, 77], .65 * (1 - progress / .64)), x, y, 1 + growth * 2.9);
      polygon(ctx, resetCloud, rgb([255, 211, 133], .8 * (1 - progress / .64)), x, y, .55 + growth * 1.7);
    }
  }

  function drawReset(ctx, backdrop, progress, reduced) {
    ctx.drawImage(backdrop, 0, 0, W, H);
    box(ctx, 0, 0, W, H, rgb([15, 30, 42], .18));
    const impact = .46;
    if (reduced) resetBlast(ctx, .43);
    else if (progress < impact) resetMissile(ctx, (progress / impact) ** 1.36);
    else resetBlast(ctx, (progress - impact) / (1 - impact));
    const fade = Math.min(1, Math.max(0, (progress - .72) / .20));
    if (fade) box(ctx, 0, 0, W, H, rgb([14, 27, 35], fade));
  }

  return { W, H, sceneContext, draw, drawReset, walkable, spots, plotCount: beds.length, art: { box, polygon, line, oval, tint, rgb, random, daylight, avatar, avatarColors,
    inside, skyAndSea, palm, berries, fruitSprite, tuft, stone, weatherAir, fishingLine, driftwood } };
})();

const Archipelago = (() => {
  const { W, H } = Island;
  const {
    box, polygon, line, oval, inside, random, daylight, avatar, skyAndSea,
    palm, berries, stone, tuft, weatherAir, fishingLine, driftwood
  } = Island.art;
  const routes = {
    tidal: {
      name: "潮生岛", fare: 2, minutes: 35, chart: [143, 118], kind: "资源岛",
      note: "退潮后的礁池里有海藻与古贝，往里走还能摘椰子和海岛果。",
      coast: [[113, 182], [121, 164], [135, 158], [141, 137], [169, 121], [195, 118],
        [206, 99], [245, 94], [266, 105], [291, 104], [304, 118], [332, 124], [351, 142],
        [366, 145], [378, 166], [378, 184], [364, 196], [359, 219], [340, 235], [314, 241],
        [294, 231], [277, 239], [249, 241], [225, 237], [210, 247], [186, 243], [169, 230],
        [147, 224], [124, 215], [117, 201]],
      greens: ["#6f9d67", "#83b66f"],
      palms: [[154, 164, .9], [304, 153, 1.03], [333, 200, .78], [230, 204, 1.16], [276, 124, .82]],
      berries: [212, 151], stones: [[140, 211, .82], [325, 218, .59], [365, 183, .72], [250, 116, .60]],
      resources: [
        { x: 212, y: 160, id: "tidal-fruit", type: "fruit", label: "采海岛果", top: 119, left: 194, right: 230 },
        { x: 304, y: 162, id: "tidal-coconut", type: "coconut", label: "摘椰子", top: 105, left: 286, right: 325 },
        { x: 162, y: 214, id: "tidal-seaweed-west", type: "seaweed", label: "捡海藻" },
        { x: 284, y: 222, id: "tidal-seaweed-east", type: "seaweed", label: "捡海藻" },
        { x: 328, y: 222, id: "tidal-shell", type: "resource-shell", label: "拾起古贝" },
        { x: 142, y: 205, id: "tidal-timber-west", type: "timber", label: "捡浮木" },
        { x: 343, y: 188, id: "tidal-timber-east", type: "timber", label: "捡浮木" }
      ],
      obstacles: []
    },
    beacon: {
      name: "灯塔岛", fare: 3, minutes: 55, chart: [220, 46], kind: "阿澄",
      note: "阿澄卖鱼汤、堆肥和海岛果，也会收古贝。",
      coast: [[112, 182], [128, 163], [149, 151], [157, 136], [176, 126], [181, 104], [204, 89],
        [228, 82], [254, 87], [269, 98], [300, 106], [307, 121], [341, 128], [360, 147],
        [368, 169], [363, 186], [380, 201], [375, 220], [355, 227], [332, 227], [306, 237],
        [277, 236], [251, 248], [229, 248], [210, 240], [195, 240], [178, 227], [145, 226],
        [129, 213], [117, 209]],
      greens: ["#799871", "#93ae77"],
      palms: [[285, 135, .86], [325, 212, .95], [166, 200, .86]],
      stones: [[170, 154, .68], [185, 212, 1.1], [227, 214, .69], [307, 132, 1], [358, 210, .70]],
      shop: { x: 249, y: 171, left: 228, right: 270, top: 148, label: "和阿澄说话", jacket: "#6a739e", hat: "#e4c894" },
      obstacles: [[197, 115, 226, 154], [258, 140, 302, 163]]
    },
    headland: {
      name: "北岬岛", fare: 3, minutes: 65, chart: [333, 63], kind: "老纪",
      note: "老纪卖蓝鳍鱼和当季鱼货，收海藻和渔获。",
      coast: [[108, 185], [116, 161], [130, 154], [142, 131], [161, 124], [169, 103],
        [193, 94], [205, 101], [223, 90], [248, 93], [259, 104], [286, 106], [295, 124],
        [324, 131], [327, 151], [353, 168], [374, 179], [381, 197], [376, 211], [350, 224],
        [326, 224], [312, 237], [275, 241], [252, 231], [233, 237], [207, 233], [191, 242],
        [171, 233], [159, 216], [131, 213], [117, 205]],
      greens: ["#648c73", "#82a17c"],
      palms: [[151, 181, .83], [292, 162, .89], [328, 212, .81]],
      stones: [[163, 133, 1.13], [183, 138, .85], [196, 157, 1.35], [196, 111, .78],
        [349, 195, .97], [167, 218, .83], [263, 226, .66]],
      shop: { x: 251, y: 178, left: 231, right: 273, top: 152, label: "和老纪说话", jacket: "#3e7680", hat: "#cb8c61" },
      fishing: { id: "headland-fishing", x: 371, y: 205, top: 193, left: 364, right: 386, markY: 184,
        type: "fish", label: "在北岬抛竿", reach: 20 },
      obstacles: [[249, 121, 305, 149]]
    },
    windbell: {
      name: "风铃岛", fare: 4, minutes: 45, chart: [344, 134], kind: "小满",
      note: "小满卖当季种子、堆肥和椰子，也收水果、作物和岛上采集物。",
      coast: [[112, 177], [134, 162], [143, 144], [163, 139], [172, 124], [191, 119],
        [208, 101], [235, 99], [254, 109], [280, 99], [307, 111], [318, 127], [338, 130],
        [348, 151], [366, 158], [367, 177], [387, 195], [383, 210], [360, 222], [343, 225],
        [324, 237], [299, 232], [283, 240], [257, 240], [244, 231], [222, 235], [209, 246],
        [183, 239], [169, 225], [147, 226], [127, 211], [114, 203]],
      greens: ["#78a263", "#98b873"],
      palms: [[154, 168, .8], [312, 149, .87], [334, 209, .96], [212, 221, .77]],
      stones: [[199, 133, .63], [180, 203, .77], [304, 213, .83], [352, 196, .68]],
      shop: { x: 253, y: 181, left: 226, right: 281, top: 154, label: "和小满说话", jacket: "#b37470", hat: "#dab9a3" },
      obstacles: [[213, 120, 285, 154]]
    },
    qishi: {
      name: "歧石岛", fare: 4, minutes: 75, chart: [119, 40], kind: "建筑工阿岩",
      note: "阿岩的工坊靠着一片灰岩台地。带着居民的介绍信来，可以商量西岸扩岛。",
      coast: [[108, 187], [119, 166], [141, 162], [145, 145], [174, 134], [174, 115],
        [194, 98], [219, 91], [236, 103], [260, 96], [288, 105], [299, 120], [330, 127],
        [333, 151], [349, 167], [366, 179], [369, 198], [355, 218], [331, 226],
        [308, 223], [285, 237], [262, 242], [231, 235], [211, 239], [192, 230],
        [177, 231], [152, 216], [131, 218], [120, 209]],
      greens: ["#7e9370", "#a2a77b"],
      palms: [[142, 182, .72], [326, 177, .89]],
      stones: [[165, 154, .9], [177, 144, 1.16], [190, 126, 1.37], [314, 142, .88], [332, 153, 1], [315, 210, .79], [199, 219, .68]],
      shop: { x: 256, y: 178, left: 232, right: 278, top: 151, label: "找建筑工阿岩", jacket: "#6d7d75", hat: "#e7af5f" },
      resources: [{ x: 324, y: 215, id: "qishi-floatwood", type: "timber", label: "捡浮木" }],
      obstacles: [[187, 113, 229, 148], [239, 124, 293, 158]]
    },
    research: {
      name: "洄湾研究岛", fare: 3, minutes: 45, chart: [211, 145], kind: "水产专家林澜",
      note: "研究所的林澜正在观察群岛水产。可以在她那里接任务、提交新捕获的样本。",
      coast: [[107, 184], [122, 169], [127, 148], [152, 137], [171, 117], [196, 109], [220, 95], [254, 100],
        [278, 112], [305, 112], [334, 125], [344, 147], [366, 157], [381, 181], [376, 205], [351, 217],
        [331, 235], [296, 245], [264, 237], [226, 247], [190, 236], [159, 224], [131, 219], [117, 204]],
      greens: ["#6c9c87", "#8cb096"],
      palms: [[149, 169, .78], [326, 149, 1.05], [293, 221, .75]],
      stones: [[167, 197, .71], [315, 204, .79], [229, 219, .58], [182, 138, .7]],
      shop: { x: 251, y: 176, left: 232, right: 270, top: 151, label: "找水产专家林澜", jacket: "#517e91", hat: "#c9dfcc" },
      fishing: { id: "research-fishing", x: 356, y: 190, top: 184, left: 344, right: 373, markY: 181,
        type: "fish", label: "在洄湾抛竿", reach: 18 },
      obstacles: [[217, 123, 286, 157]]
    }
  };

  function boat(ctx, x, y, scale) {
    polygon(ctx, [[-19, 1], [-15, 9], [12, 9], [18, 4], [22, -2], [11, 0]], "#193a50", x, y, scale);
    polygon(ctx, [[-19, -1], [-16, 5], [11, 5], [18, 1], [20, -2]], "#dc8857", x, y, scale);
    polygon(ctx, [[-17, 3], [-14, 7], [10, 7], [16, 4]], "#b8584d", x, y, scale);
    polygon(ctx, [[-17, -2], [13, -2], [19, -5], [20, -2], [12, 1], [-18, 1]], "#f4c285", x, y, scale);
    polygon(ctx, [[-9, -3], [-8, -13], [9, -13], [12, -3]], "#467982", x, y, scale);
    polygon(ctx, [[-10, -13], [-6, -17], [7, -17], [11, -13]], "#fae4b4", x, y, scale);
    box(ctx, x - 6 * scale, y - 11 * scale, Math.ceil(5 * scale), Math.ceil(5 * scale), "#9ac1ad");
    box(ctx, x + 2 * scale, y - 11 * scale, Math.ceil(5 * scale), Math.ceil(5 * scale), "#274f62");
    line(ctx, [[x + 10 * scale, y - 5 * scale], [x + 10 * scale, y - 20 * scale]], "#e5bd85");
    polygon(ctx, [[10, -20], [18, -18], [10, -16]], "#eb9078", x, y, scale);
    box(ctx, x - 14 * scale, y - 4 * scale, 4 * scale, Math.max(1, 2 * scale), "#734f42");
  }

  function resident(ctx, x, y, jacket, hat) {
    oval(ctx, x, y + 1, 7, 3, "#2c414f68");
    box(ctx, x - 4, y - 6, 9, 7, "#273a4a");
    box(ctx, x - 4, y - 7, 9, 5, jacket);
    box(ctx, x - 4, y - 13, 9, 6, "#714b49");
    box(ctx, x - 3, y - 12, 7, 5, "#eed0a1");
    box(ctx, x - 2, y - 10, 1, 1, "#483e47");
    box(ctx, x + 2, y - 10, 1, 1, "#483e47");
    box(ctx, x - 5, y - 14, 11, 2, hat);
    box(ctx, x - 3, y - 16, 7, 2, hat);
    box(ctx, x - 2, y - 16, 5, 1, "#ffe4ae");
  }

  function quay(ctx, elapsed) {
    box(ctx, 68, 173, 69, 17, "#5c4c48");
    box(ctx, 68, 172, 69, 14, "#c18f69");
    box(ctx, 68, 171, 69, 2, "#ebbd82");
    for (let x = 70; x < 136; x += 6) {
      box(ctx, x, 173, 1, 13, "#8e694f");
      box(ctx, x + 2, 176 + (x % 4), 2, 1, "#e2ac78");
    }
    for (const x of [70, 96, 118]) {
      box(ctx, x, 168, 3, 26, "#735950");
      box(ctx, x, 168, 3, 2, "#e4b685");
    }
    boat(ctx, 77, 203 + Math.sin(elapsed * 2) * 1.2, .82);
  }

  function hut(ctx, x, y, roof, wall, awning = false) {
    oval(ctx, x + 4, y + 1, 35, 6, "#3d4e5a66");
    box(ctx, x - 26, y - 31, 53, 32, "#644c46");
    box(ctx, x - 24, y - 29, 47, 28, wall);
    for (let sy = y - 25; sy < y - 2; sy += 5) box(ctx, x - 24, sy, 47, 1, "#63494e50");
    polygon(ctx, [[-32, -29], [-23, -39], [17, -40], [29, -30], [27, -26], [-31, -25]], "#67505b", x, y);
    polygon(ctx, [[-31, -30], [-22, -38], [17, -38], [27, -31], [26, -28], [-30, -28]], roof, x, y);
    line(ctx, [[x - 22, y - 37], [x + 16, y - 37], [x + 23, y - 32]], "#fff0c04f");
    for (const dx of [-18, 13]) {
      box(ctx, x + dx, y - 22, 9, 10, "#53474e");
      box(ctx, x + dx + 1, y - 21, 7, 7, "#e7c787");
      box(ctx, x + dx + 4, y - 21, 1, 7, "#6e5951");
    }
    box(ctx, x - 5, y - 17, 12, 17, "#5d5357");
    box(ctx, x - 3, y - 15, 8, 15, "#9e7358");
    if (awning) {
      box(ctx, x - 23, y - 23, 46, 5, "#eac5a4");
      for (let dx = -22; dx < 23; dx += 8) box(ctx, x + dx, y - 23, 4, 5, roof);
      box(ctx, x - 24, y - 18, 48, 2, "#8d5b67");
    }
  }

  function lighthouse(ctx, hour, elapsed) {
    const x = 211;
    const y = 153;
    oval(ctx, x, y, 25, 7, "#3b535663");
    polygon(ctx, [[-14, 0], [-10, -51], [9, -51], [14, 0]], "#d2a692", x, y);
    polygon(ctx, [[-12, -1], [-8, -50], [5, -50], [8, 0]], "#f2dcbd", x, y);
    for (const dy of [-45, -25]) {
      box(ctx, x - 9, y + dy, 19, 5, "#c97b71");
      box(ctx, x - 7, y + dy, 10, 1, "#e6a08b");
    }
    box(ctx, x - 5, y - 14, 9, 13, "#424155");
    box(ctx, x - 3, y - 12, 6, 10, "#8a6b68");
    box(ctx, x - 13, y - 54, 25, 4, "#574958");
    box(ctx, x - 10, y - 65, 20, 12, "#66575e");
    box(ctx, x - 8, y - 63, 16, 8, "#ffdaa0");
    for (const dx of [-7, 0, 7]) box(ctx, x + dx, y - 63, 1, 8, "#59505a");
    polygon(ctx, [[-14, -65], [-6, -74], [4, -74], [13, -66], [11, -64], [-12, -64]], "#ad625e", x, y);
    if (hour < 6 || hour > 18.4) {
      const reach = Math.cos(elapsed * 1.8) * 105;
      polygon(ctx, [[0, -61], [reach, -87], [reach, -55]], "#ffe29e39", x, y);
    }
  }

  function landmark(ctx, id, hour, elapsed) {
    if (id === "beacon") {
      lighthouse(ctx, hour, elapsed);
      hut(ctx, 284, 160, "#a17c76", "#b68c70");
    } else if (id === "headland") {
      hut(ctx, 274, 147, "#5e8b8c", "#9c9380");
      for (const x of [200, 216]) {
        box(ctx, x, 164, 2, 16, "#805a4b");
        box(ctx, x + 10, 164, 2, 16, "#805a4b");
        box(ctx, x, 165, 12, 2, "#caa478");
        box(ctx, x + 2, 168, 8, 4, "#b4c2b5");
        box(ctx, x + 4, 171, 1, 3, "#7c8d87");
      }
      boat(ctx, 347, 249, .69);
    } else if (id === "windbell") {
      hut(ctx, 250, 154, "#aa7186", "#ddaa84", true);
      for (let x = 209; x < 288; x += 8) {
        box(ctx, x, 201 + x % 7, 7, 4, "#578650");
        box(ctx, x + 1, 199 + x % 7, 3, 3, x % 3 ? "#ec9f9b" : "#ffce85");
      }
      const ring = Math.sin(elapsed * 2.1);
      line(ctx, [[283, 126], [284 + ring * 2, 137]], "#e5c395");
      box(ctx, 282 + ring * 2, 137, 5, 2, "#f5ce91");
    } else if (id === "qishi") {
      polygon(ctx, [[176, 146], [180, 124], [196, 105], [218, 111], [231, 121], [227, 147]], "#64757a");
      polygon(ctx, [[178, 134], [194, 110], [220, 113], [230, 126], [213, 131], [195, 129]], "#b7b5a1");
      line(ctx, [[179, 136], [197, 139], [214, 137], [228, 137]], "#87938c", 2);
      hut(ctx, 265, 159, "#7b8b85", "#bd9b72");
      box(ctx, 291, 144, 3, 28, "#865f48");
      box(ctx, 291, 144, 26, 3, "#ac7951");
      line(ctx, [[293, 155], [304, 146]], "#dbb477", 2);
      line(ctx, [[314, 146], [314, 160]], "#765a4e");
      box(ctx, 309, 161, 10, 7, "#848781");
      box(ctx, 309, 160, 10, 2, "#c0bcaa");
    } else if (id === "research") {
      hut(ctx, 251, 157, "#4d8692", "#c9b691");
      box(ctx, 252, 118, 2, 13, "#6c6867");
      box(ctx, 254, 119, 8, 5, "#99d4c7");
      for (const [x, y] of [[186, 196], [300, 174], [308, 190]]) {
        box(ctx, x - 8, y - 3, 17, 10, "#646b63");
        box(ctx, x - 7, y - 4, 15, 8, "#458a94");
        box(ctx, x - 6, y - 3, 13, 2, "#94d5c5");
        box(ctx, x - 2, y + 1, 5, 1, "#e0d598");
      }
    } else {
      for (const [x, y, scale] of [[158, 212, 1], [287, 218, .85]]) {
        oval(ctx, x, y, 18 * scale, 6 * scale, "#599b99");
        oval(ctx, x, y, 13 * scale, 4 * scale, "#84c7ba");
        box(ctx, x - 6, y - 1, 9, 1, "#d4ead1");
        box(ctx, x - 3 + Math.sin(elapsed * 2) * 3, y + 2, 6, 1, "#6eaeb0");
      }
    }
  }

  function makeTerrain(stop, index) {
    const ctx = Island.sceneContext();
    const { coast, greens, stones } = stop;
    polygon(ctx, coast, "#ae835f", 0, 4);
    polygon(ctx, coast, "#edc58f");
    polygon(ctx, coast, "#f8dda7", 0, -2);
    const center = [242, 174];
    polygon(ctx, coast.map(([x, y]) => [center[0] + (x - center[0]) * .88, center[1] + (y - center[1]) * .83]), greens[0]);
    polygon(ctx, coast.map(([x, y]) => [224 + (x - center[0]) * .67, 163 + (y - center[1]) * .62]), greens[1]);
    if (stop.shop) polygon(ctx, [[121, 175], [147, 174], [182, 167], [213, 173],
      [249, 171], [279, 182], [304, 184], [310, 195], [279, 193], [250, 180], [210, 182],
      [183, 176], [148, 183], [122, 184]], "#c8b389");

    const rng = random(801 + index * 29);
    for (let j = 0; j < 310; j++) {
      const x = Math.round(112 + rng() * 272);
      const y = Math.round(94 + rng() * 149);
      if (!inside(x, y, coast)) continue;
      const shaded = rng() > .5;
      box(ctx, x, y, rng() > .7 ? 4 : 2, 1, shaded ? "#58795b47" : "#ffe8a855");
      if (rng() > .92 && inside(242 + (x - 242) * 1.2, 174 + (y - 174) * 1.2, coast)) tuft(ctx, x, y, j % 3);
    }
    for (const [x, y, size] of stones) stone(ctx, x, y, size);
    return ctx.canvas;
  }

  function resource(ctx, spot) {
    const { x, y, type } = spot;
    if (type === "timber") {
      driftwood(ctx, x, y);
    } else if (type === "seaweed") {
      box(ctx, x - 4, y + 1, 9, 2, "#3b746d");
      box(ctx, x - 1, y - 5, 2, 6, "#3c815d");
      box(ctx, x - 4, y - 3, 4, 2, "#87b66c");
      box(ctx, x + 1, y - 5, 4, 2, "#9ac974");
      box(ctx, x + 2, y - 2, 3, 2, "#64a667");
    } else if (type === "resource-shell") {
      polygon(ctx, [[-4, 1], [-5, -2], [-3, -5], [1, -6], [5, -3], [5, 1], [2, 3]], "#e9aa92", x, y);
      box(ctx, x - 3, y - 3, 6, 2, "#ffe5b3");
      box(ctx, x, y, 3, 1, "#af7c72");
    }
  }

  function makeMap(id, stop, index) {
    const { coast } = stop;
    const dock = { id: `${id}-dock`, x: 96, y: 179, markY: 207, top: 151, bottom: 213, left: 62, right: 113,
      type: "harbor", label: "回自己的岛", markerBelow: true, reach: 14 };
    const spots = stop.fishing ? [dock, stop.fishing] : [dock];
    if (stop.shop) spots.push({ ...stop.shop, id: `${id}-shop`, type: "resident-shop", markY: stop.shop.top, reach: 18 });
    for (const spot of stop.resources ?? []) spots.push({ top: spot.y - 8, left: spot.x - 10, right: spot.x + 10,
      markY: spot.y - 12, reach: 15, ...spot });
    const arrival = { x: 114, y: 181, facing: "right" };
    let terrain;
    const field = Island.sceneContext();
    const walkable = (x, y) => (
      (x >= 70 && x <= 140 && y >= 173 && y <= 186) || inside(x, y, coast)
    ) && !stop.obstacles.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2);

    function draw(ctx, scene) {
      const { player, hour, weather, elapsed, harvested, season, target, fishing, tugging } = scene;
      const light = daylight(hour, weather, season);
      skyAndSea(ctx, light, hour, weather, elapsed);
      const ring = coast.map(([x, y]) => [242 + (x - 242) * 1.13, 174 + (y - 174) * 1.16]);
      polygon(ctx, ring, "#6bc8b36a", 0, 1 + Math.sin(elapsed * 1.8) * 2);
      polygon(ctx, coast.map(([x, y]) => [242 + (x - 242) * 1.055, 174 + (y - 174) * 1.08]), "#b3dec292", 0, 3);
      for (let i = 0; i < ring.length; i++) {
        if (Math.sin(i * 1.67 + elapsed * 1.9) > -.33) line(ctx, [ring[i], ring[(i + 1) % ring.length]], "#cbf3d780");
      }
      field.clearRect(0, 0, W, H);
      terrain ??= makeTerrain(stop, index);
      field.drawImage(terrain, 0, 0, W, H);
      quay(field, elapsed);
      if (stop.fishing) {
        const { x, y } = stop.fishing;
        box(field, x - 4, y - 8, 2, 10, "#8c6657");
        box(field, x - 6, y - 9, 7, 3, "#dbb282");
        box(field, x - 5, y - 8, 4, 1, "#f0ceb1");
      }
      const objects = [
        { y: id === "tidal" ? 135 : 159, render: () => landmark(field, id, hour, elapsed) },
        { y: 177, render: () => resident(field, dock.x, 177, "#356c72", "#ebbb80") },
        ...stop.palms.map(([x, y, size], i) => ({
          y, render: () => palm(field, { x, y, size, wind: i % 2 ? 1 : -1 },
            id === "tidal" && x === 304 && !harvested("tidal-coconut"), Math.sin(elapsed * 1.8 + i) * 1.3, season)
        })),
        { y: player.y, render: () => avatar(field, player, elapsed) }
      ];
      if (stop.berries) {
        const [x, y] = stop.berries;
        objects.push({ y, render: () => berries(field, { x, y }, !harvested("tidal-fruit"), season) });
      }
      if (stop.shop) {
        const { x, y, jacket, hat } = stop.shop;
        objects.push({ y: y - 4, render: () => resident(field, x, y - 4, jacket, hat) });
      }
      for (const spot of stop.resources ?? []) if (!harvested(spot.id)) {
        objects.push({ y: spot.y, render: () => resource(field, spot) });
      }
      objects.sort((a, b) => a.y - b.y).forEach(object => object.render());
      if (light.alpha > .01) {
        field.globalCompositeOperation = "source-atop";
        box(field, 0, 0, W, H, Island.art.rgb(light.shade, light.alpha));
        field.globalCompositeOperation = "source-over";
      }
      ctx.drawImage(field.canvas, 0, 0, W, H);
      if (target) {
        oval(ctx, target.x, target.y, 4, 2, "#fff3d496");
        oval(ctx, target.x, target.y, 2, 1, "#e4aa6299");
      }
      if (fishing) fishingLine(ctx, player, elapsed, fishing, tugging, 22);
      weatherAir(ctx, season, weather, elapsed);
    }

    return { spots, dock, arrival, walkable, draw };
  }

  const maps = Object.fromEntries(Object.entries(routes).map(([id, stop], index) => [id, makeMap(id, stop, index)]));

  function drawVoyage(ctx, scene, progress) {
    const { elapsed, hour, weather, season } = scene;
    const light = daylight(hour, weather, season);
    skyAndSea(ctx, light, hour, weather, elapsed * 2.7);
    // The departure pier falls away as a new shore comes into frame.
    const start = Math.max(0, 1 - progress / .38);
    const finish = Math.max(0, (progress - .59) / .41);
    if (start) {
      const shift = 120 * (1 - start);
      polygon(ctx, [[0, 148], [32, 150], [64, 164], [65, 182], [45, 207], [0, 228]], "#a0ba82", -shift);
      polygon(ctx, [[0, 154], [32, 155], [60, 166], [62, 181], [45, 202], [0, 220]], "#e5c590", -shift);
      box(ctx, -shift, 171, 122, 15, "#80604f");
      box(ctx, -shift, 170, 124, 9, "#c28e62");
      for (let x = 4; x < 124; x += 8) box(ctx, x - shift, 172, 1, 8, "#93654f");
    }
    if (finish) {
      const shift = 145 * (1 - finish);
      polygon(ctx, [[319, 160], [360, 134], [401, 129], [448, 135], [448, 243],
        [393, 244], [354, 218], [331, 208], [317, 185]], "#74b9a687", shift);
      polygon(ctx, [[328, 165], [369, 139], [403, 136], [448, 141], [448, 234],
        [395, 232], [360, 211], [340, 200], [325, 184]], "#eed19b", shift);
      polygon(ctx, [[348, 167], [376, 149], [404, 148], [448, 157], [448, 221],
        [395, 218], [366, 207], [345, 181]], "#86a86b", shift);
      box(ctx, 292 + shift, 175, 115, 14, "#6c5249");
      box(ctx, 291 + shift, 174, 116, 9, "#cc9568");
      for (let x = 295; x < 406; x += 8) box(ctx, x + shift, 175, 1, 8, "#9e7158");
    }
    const glide = progress * progress * (3 - 2 * progress);
    const x = 105 + glide * 220;
    const y = 196 + Math.sin(elapsed * 5.8) * 2 + Math.sin(progress * Math.PI) * 12;
    const wakeStrength = Math.sin(progress * Math.PI);
    for (let i = 0; i < 13; i++) {
      const spread = i * 1.3;
      const dx = (i * 6 + elapsed * 20) % 76;
      const width = 3 + (i % 4);
      const color = i % 3 ? "#b8e7dc9e" : "#f6f2cca3";
      box(ctx, x - 21 - dx, y + 5 - spread * wakeStrength * .43, width, 1, color);
      box(ctx, x - 22 - dx, y + 8 + spread * wakeStrength * .61, width, 1, color);
    }
    boat(ctx, x, y, 1.24);
    weatherAir(ctx, season, weather, elapsed);
  }

  const chartPoints = { island: [43, 85], ...Object.fromEntries(Object.entries(routes).map(([id, stop]) => [id, stop.chart])) };

  function drawChart(ctx, origin, destination, reveal, elapsed, openRoutes) {
    box(ctx, 0, 0, 384, 176, "#153a49");
    for (let x = 8; x < 384; x += 24) box(ctx, x, 0, 1, 176, "#59818822");
    for (let y = 8; y < 176; y += 20) box(ctx, 0, y, 384, 1, "#59818822");
    for (let index = 0; index < 60; index++) {
      const x = index * 63 % 378;
      const y = (index * 39) % 173;
      box(ctx, x, y, 3 + index % 4, 1, index % 3 ? "#5993954c" : "#b5c6a44f");
    }
    for (const [id, [x, y]] of Object.entries(chartPoints)) {
      if (id !== "island" && id !== origin && !openRoutes.includes(id)) continue;
      const spot = routes[id];
      const edge = spot ? spot.coast.map(([sx, sy]) => [(sx - 240) * .13, (sy - 178) * .16]) :
        [[-14, -2], [-8, -10], [2, -12], [11, -7], [15, 1], [11, 7], [0, 10], [-11, 5]];
      polygon(ctx, edge, "#51aa9d66", x, y, 1.23);
      polygon(ctx, edge, "#e2bf81", x, y);
      polygon(ctx, edge, spot ? spot.greens[0] : "#6f9b69", x, y, .74);
      if (id === origin) oval(ctx, x, y, 3, 3, "#efe2ad");
    }
    const from = chartPoints[origin];
    const to = chartPoints[destination];
    const [sx, sy] = from;
    const [tx, ty] = to;
    const bend = Math.sign(tx - sx) * 18;
    const sample = t => [sx + (tx - sx) * t, sy + (ty - sy) * t - Math.sin(t * Math.PI) * bend];
    for (let t = .025; t < Math.min(.965, reveal); t += .037) {
      line(ctx, [sample(t), sample(Math.min(t + .017, reveal))], "#f3cb80", 1.5);
    }
    const [x, y] = sample(.026 + ((elapsed * .36) % 1) * .91 * reveal);
    box(ctx, x - 2, y, 5, 2, "#ffe0a0");
    box(ctx, x - 1, y - 2, 3, 2, "#e48b6e");
    box(ctx, 22, 23, 1, 14, "#a1bcb0");
    box(ctx, 16, 30, 13, 1, "#a1bcb0");
    polygon(ctx, [[22, 19], [19, 27], [25, 27]], "#f0d89a");
  }

  const portraits = {
    0: { sky: "#a1b0bc", coat: "#6a739e", shoulder: "#4c5c84", skin: "#edbd91", hair: "#514656" },
    1: { sky: "#94b3ac", coat: "#3e7680", shoulder: "#305666", skin: "#dba27d", hair: "#79665f" },
    3: { sky: "#d9ab99", coat: "#b37470", shoulder: "#895768", skin: "#f1c29a", hair: "#744756" },
    4: { sky: "#b9bd9a", coat: "#789274", shoulder: "#526d62", skin: "#e6b089", hair: "#714951" },
    5: { sky: "#acb6c0", coat: "#64738a", shoulder: "#495469", skin: "#dbaa84", hair: "#61515a" },
    6: { sky: "#dfbc99", coat: "#b78b5e", shoulder: "#8d695a", skin: "#f1c49c", hair: "#ab654b" },
    7: { sky: "#aab8b4", coat: "#6d7d75", shoulder: "#4a5d61", skin: "#e6b490", hair: "#5e574f" }
  };

  function portrait(id) {
    const canvas = document.createElement("canvas");
    canvas.width = 36;
    canvas.height = 36;
    const ctx = canvas.getContext("2d");
    const theme = portraits[id];
    box(ctx, 0, 0, 36, 36, theme.sky);
    box(ctx, 0, 27, 36, 9, "#2c535446");
    polygon(ctx, [[1, 36], [4, 30], [10, 27], [26, 27], [32, 31], [35, 36]], theme.shoulder);
    polygon(ctx, [[5, 36], [8, 31], [14, 28], [24, 28], [28, 31], [31, 36]], theme.coat);
    if (id === 3 || id === 4 || id === 6) {
      polygon(ctx, [[8, 12], [11, 7], [24, 6], [28, 12], [28, 28], [22, 29], [13, 29], [7, 26]], theme.hair);
    } else {
      polygon(ctx, [[9, 12], [12, 7], [24, 7], [27, 12], [26, 22], [10, 22]], theme.hair);
    }
    box(ctx, 15, 23, 7, 7, "#ab776c");
    polygon(ctx, [[10, 13], [26, 13], [26, 21], [23, 25], [20, 27], [15, 26], [11, 23]], theme.skin);
    box(ctx, 15, 14, 8, 5, "#f4c49d");
    box(ctx, 13, 17, 2, 2, "#3f3b4b");
    box(ctx, 22, 17, 2, 2, "#3f3b4b");
    box(ctx, 11, 21, 3, 1, "#d08273");
    box(ctx, 23, 21, 2, 1, "#d08273");
    box(ctx, 17, 23, 4, 1, "#a15b56");
    if (id === 0) {
      box(ctx, 8, 11, 21, 3, "#4b536d");
      box(ctx, 11, 6, 15, 6, "#efdaa6");
      box(ctx, 10, 10, 18, 2, "#a89675");
      box(ctx, 17, 7, 3, 3, "#77969b");
    } else if (id === 1) {
      polygon(ctx, [[7, 13], [9, 9], [14, 5], [23, 5], [28, 9], [28, 13]], "#ae6b56");
      box(ctx, 6, 11, 24, 2, "#e6a375");
      polygon(ctx, [[11, 22], [14, 24], [17, 22], [22, 23], [26, 21], [24, 26], [16, 29], [12, 27]], "#93847b");
      box(ctx, 17, 23, 3, 1, "#5e4b4b");
    } else if (id === 3) {
      box(ctx, 10, 9, 17, 3, "#d69291");
      box(ctx, 9, 12, 5, 4, theme.hair);
      box(ctx, 23, 12, 5, 3, theme.hair);
      box(ctx, 25, 8, 4, 4, "#f2c990");
      box(ctx, 26, 7, 2, 6, "#f3dca7");
    } else if (id === 4) {
      polygon(ctx, [[8, 13], [12, 7], [22, 7], [26, 11], [23, 13], [19, 11], [13, 15], [9, 19]], "#86575a");
      box(ctx, 9, 24, 3, 5, "#62494e");
      polygon(ctx, [[12, 29], [24, 29], [22, 33], [22, 36], [14, 36], [14, 33]], "#edd0a6");
    } else if (id === 5) {
      box(ctx, 12, 7, 13, 5, "#8d7e7e");
      box(ctx, 11, 11, 4, 5, "#aa9a8f");
      box(ctx, 23, 11, 3, 5, "#aa9a8f");
      line(ctx, [[11, 17], [16, 17], [16, 20], [11, 20], [11, 17], [24, 17], [24, 20], [20, 20], [20, 17]], "#4c5863");
    } else if (id === 7) {
      box(ctx, 7, 11, 23, 3, "#bb7e4c");
      box(ctx, 10, 7, 16, 5, "#e6a95a");
      box(ctx, 13, 5, 9, 2, "#f1c47f");
      box(ctx, 11, 28, 2, 8, "#d4ad66");
      box(ctx, 24, 28, 2, 8, "#d4ad66");
    } else {
      box(ctx, 8, 20, 4, 7, "#b97654");
      box(ctx, 25, 20, 4, 7, "#b97654");
      box(ctx, 9, 24, 3, 1, "#e3b781");
      box(ctx, 25, 24, 3, 1, "#e3b781");
      polygon(ctx, [[9, 12], [11, 8], [15, 5], [23, 6], [28, 10], [31, 13], [26, 14], [20, 12]], "#648ba4");
      box(ctx, 17, 7, 5, 2, "#b8cfcc");
    }
    return canvas.toDataURL();
  }

  return { routes, maps, boat, resident, drawVoyage, chartPoints, drawChart, portrait };
})();
