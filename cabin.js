"use strict";

const Cabin = (() => {
  const { W, H } = Island;
  const { box, polygon, line, oval, tint, rgb, random, daylight, avatar, avatarColors } = Island.art;
  const entrance = { x: 219, y: 225, facing: "up" };
  const spots = [
    { id: "bed", x: 122, y: 169, left: 83, right: 148, top: 107, markY: 111, type: "rest", label: "休息到天亮" },
    { id: "desk", x: 224, y: 147, left: 174, right: 274, top: 111, markY: 111, type: "desk", label: "使用书桌" },
    { id: "stove", x: 331, y: 157, left: 285, right: 375, top: 102, markY: 103, type: "cook", label: "用灶台" },
    { id: "exit", x: 219, y: 245, left: 190, right: 249, top: 238, markY: 239, reach: 19, type: "exit", label: "回到岛上" }
  ];
  const exterior = [[52, 35], [393, 35], [411, 54], [411, 243], [394, 260], [52, 260], [36, 243], [36, 51]];

  function walkable(x, y) {
    return x >= 61 && x <= 386 && y >= 113 && y <= 249 &&
      !(x < 150 && x > 80 && y < 164) &&
      !(x > 171 && x < 276 && y < 142) &&
      !(x > 282 && y < 152);
  }

  const base = Island.sceneContext();
  const props = Island.sceneContext();
  const rng = random(536);

  function room(ctx) {
    box(ctx, 0, 0, W, H, "#14232c");
    polygon(ctx, exterior, "#0c1922", 0, 5);
    polygon(ctx, exterior, "#553e3c");
    box(ctx, 50, 41, 346, 199, "#704d43");
    box(ctx, 61, 47, 325, 71, "#b77d56");
    for (let y = 47; y < 119; y += 11) {
      box(ctx, 61, y, 325, 1, "#8b5c49");
      box(ctx, 61, y + 1, 325, 1, "#d49a67");
      box(ctx, 70 + Math.round(rng() * 48), y + 6, 27 + rng() * 44, 1, "#a36b4d");
      box(ctx, 289 + Math.round(rng() * 35), y + 4, 17 + rng() * 38, 1, "#a56d4e");
    }
    box(ctx, 61, 106, 325, 7, "#6e4c43");
    box(ctx, 61, 106, 325, 1, "#dd9c64");
    const plank = ["#ad7650", "#bc8557", "#b17b56", "#c08a5e", "#aa795a"];
    for (let y = 113, row = 0; y < 247; y += 11, row++) {
      box(ctx, 60, y, 328, 11, plank[row % plank.length]);
      box(ctx, 60, y, 328, 1, "#795441");
      box(ctx, 60, y + 1, 328, 1, "#e3a874");
      for (let x = 61 + (row % 3) * 20; x < 386; x += 58) {
        box(ctx, x, y + 1, 1, 10, "#865a47");
        box(ctx, x + 5, y + 5, 3, 1, "#94634c");
        const grain = Math.min(7 + Math.round(rng() * 18), 386 - x - 21);
        if (grain > 0) box(ctx, x + 21, y + 7, grain, 1, "#e9b78555");
      }
    }
    for (let i = 0; i < 93; i++) {
      box(ctx, 63 + rng() * 323, 115 + rng() * 128, 1 + Math.floor(rng() * 5), 1,
        i % 3 ? "#67403438" : "#f4ba7a60");
    }
    for (const x of [47, 387]) {
      box(ctx, x, 39, 13, 208, "#68473d");
      box(ctx, x + 2, 42, 3, 203, "#a16a4b");
      for (let y = 49; y < 244; y += 13) box(ctx, x + 3, y, 7, 1, "#443438");
    }
    box(ctx, 48, 37, 352, 9, "#64443a");
    box(ctx, 58, 39, 331, 2, "#b97952");
    box(ctx, 48, 248, 139, 9, "#64443a");
    box(ctx, 253, 248, 147, 9, "#64443a");
    box(ctx, 48, 248, 139, 2, "#cf945f");
    box(ctx, 253, 248, 147, 2, "#cf945f");
    box(ctx, 189, 245, 62, 13, "#8b5a48");
    box(ctx, 196, 247, 48, 9, "#d7a46d");
    box(ctx, 196, 253, 48, 2, "#9c674e");
    polygon(ctx, [[216, 248], [224, 248], [224, 251], [227, 251], [220, 256], [213, 251], [216, 251]], "#774f42");
    rug(ctx);
  }

  function rug(ctx) {
    const outline = [[159, 174], [277, 174], [286, 183], [286, 221], [278, 229], [158, 229], [150, 221], [150, 183]];
    polygon(ctx, outline, "#593f43", 0, 2);
    polygon(ctx, outline, "#ead09d");
    box(ctx, 157, 178, 122, 47, "#ad5c52");
    box(ctx, 166, 183, 105, 37, "#8c504e");
    box(ctx, 171, 187, 95, 29, "#347976");
    box(ctx, 174, 190, 89, 23, "#4a8980");
    for (let x = 163; x < 275; x += 7) {
      box(ctx, x, 180, 3, 1, "#f8d78e");
      box(ctx, x, 223, 3, 1, "#f8d78e");
    }
    for (const x of [187, 217, 247]) {
      polygon(ctx, [[0, -11], [12, 0], [0, 11], [-12, 0]], "#e4b674", x, 201);
      polygon(ctx, [[0, -7], [8, 0], [0, 7], [-8, 0]], "#356e70", x, 201);
      box(ctx, x - 2, 199, 4, 4, "#f8ce86");
      box(ctx, x - 1, 197, 2, 8, "#f8ce86");
    }
    for (let y = 186; y <= 220; y += 4) {
      box(ctx, 147, y, 6, 1, "#dec393");
      box(ctx, 285, y, 6, 1, "#dec393");
    }
  }

  function vessel(ctx, x, y, color, light) {
    box(ctx, x + 3, y, 8, 2, "#513940");
    polygon(ctx, [[0, 6], [2, 2], [12, 2], [14, 7], [12, 13], [2, 13]], color, x, y);
    box(ctx, x + 4, y + 4, 3, 5, light);
    box(ctx, x + 2, y + 9, 11, 1, "#e5b879");
  }

  function details(ctx) {
    // Window trim and shelves.
    box(ctx, 160, 48, 125, 63, "#644238");
    box(ctx, 166, 52, 113, 54, "#dca96b");
    box(ctx, 169, 55, 107, 48, "#704e44");
    box(ctx, 159, 106, 127, 4, "#edbb7c");
    box(ctx, 158, 110, 129, 2, "#72503e");
    box(ctx, 77, 80, 54, 5, "#694539");
    box(ctx, 77, 80, 54, 1, "#e5ad76");
    vessel(ctx, 81, 66, "#4d7468", "#83a07c");
    vessel(ctx, 100, 66, "#b55a4a", "#e18b67");
    box(ctx, 120, 70, 6, 10, "#d7955b");
    box(ctx, 318, 72, 52, 5, "#694539");
    box(ctx, 318, 72, 52, 1, "#e5ad76");
    vessel(ctx, 323, 58, "#bb694b", "#f49f63");
    vessel(ctx, 343, 58, "#72885c", "#a1ae73");
    line(ctx, [[306, 64], [306, 92]], "#6c4e3e");
    for (let y = 70; y <= 89; y += 4) {
      box(ctx, 302 + y % 3, y, 7, 2, "#788c50");
      box(ctx, 305, y + 1, 5, 1, "#b3a46b");
    }
    // Bed with a stitched quilt and pillow.
    oval(ctx, 115, 160, 35, 7, "#533c4260");
    box(ctx, 85, 109, 59, 52, "#68433f");
    box(ctx, 85, 108, 59, 8, "#844e40");
    box(ctx, 85, 108, 59, 2, "#dd965e");
    box(ctx, 89, 116, 51, 39, "#e6bf88");
    box(ctx, 94, 118, 40, 13, "#fce5bb");
    box(ctx, 96, 129, 36, 2, "#cca58a");
    box(ctx, 89, 134, 51, 21, "#40827b");
    box(ctx, 92, 136, 45, 15, "#5ea08d");
    for (let x = 96; x < 137; x += 8) {
      box(ctx, x, 139, 2, 8, "#78b09b");
      box(ctx, x - 2, 142, 6, 2, "#b6c896");
    }
    box(ctx, 89, 152, 51, 3, "#326a68");
    box(ctx, 85, 157, 59, 4, "#a36248");
    box(ctx, 86, 160, 5, 4, "#4e3739");
    box(ctx, 139, 160, 5, 4, "#4e3739");
    // Writing desk, folded letter, ink and stool.
    oval(ctx, 223, 140, 52, 6, "#513d4260");
    box(ctx, 173, 118, 101, 18, "#8a5341");
    box(ctx, 179, 131, 6, 10, "#694235");
    box(ctx, 263, 131, 6, 10, "#694235");
    box(ctx, 171, 114, 105, 13, "#d59d65");
    box(ctx, 171, 114, 105, 2, "#f6c289");
    box(ctx, 173, 126, 101, 2, "#a36947");
    box(ctx, 207, 117, 24, 7, "#80554d");
    box(ctx, 209, 116, 20, 7, "#f5deac");
    line(ctx, [[209, 117], [219, 121], [228, 117]], "#bf9b71");
    box(ctx, 218, 121, 3, 2, "#bd6957");
    box(ctx, 192, 118, 12, 8, "#5b675a");
    box(ctx, 191, 117, 12, 7, "#6f8b73");
    box(ctx, 192, 118, 2, 5, "#a3b185");
    box(ctx, 197, 119, 4, 2, "#e9c98f");
    box(ctx, 237, 118, 5, 5, "#354850");
    box(ctx, 238, 117, 3, 2, "#99ada2");
    line(ctx, [[240, 119], [247, 111], [250, 111]], "#fae5ba");
    vessel(ctx, 185, 104, "#4b8879", "#8abd9e");
    box(ctx, 215, 143, 18, 5, "#7e5245");
    box(ctx, 217, 147, 3, 4, "#6b463c");
    box(ctx, 229, 147, 3, 4, "#6b463c");
    box(ctx, 215, 142, 18, 2, "#d79463");
    // Iron stove, pot and stacked firewood.
    oval(ctx, 333, 152, 41, 6, "#513d4260");
    box(ctx, 321, 79, 9, 30, "#3d4145");
    box(ctx, 322, 81, 2, 27, "#72746c");
    box(ctx, 293, 107, 75, 40, "#685454");
    box(ctx, 295, 113, 71, 31, "#556368");
    box(ctx, 295, 113, 71, 2, "#89948b");
    box(ctx, 292, 144, 76, 4, "#3a4048");
    box(ctx, 297, 147, 6, 5, "#4c3c40");
    box(ctx, 358, 147, 6, 5, "#4c3c40");
    box(ctx, 313, 121, 33, 19, "#323b43");
    box(ctx, 316, 123, 27, 14, "#593d40");
    box(ctx, 318, 126, 23, 9, "#ad6347");
    box(ctx, 316, 134, 26, 3, "#ed9260");
    box(ctx, 349, 127, 5, 3, "#c2aa7e");
    box(ctx, 297, 118, 11, 2, "#859389");
    box(ctx, 309, 101, 42, 4, "#354149");
    polygon(ctx, [[0, 0], [32, 0], [30, 9], [24, 11], [7, 11], [2, 8]], "#608785", 314, 99);
    box(ctx, 316, 100, 28, 2, "#aac6a7");
    box(ctx, 318, 101, 3, 5, "#81a797");
    box(ctx, 314, 97, 32, 2, "#3d5758");
    box(ctx, 320, 95, 20, 2, "#83a69b");
    box(ctx, 327, 93, 7, 3, "#405b59");
    for (const [x, y] of [[366, 151], [362, 156], [371, 156]]) {
      box(ctx, x, y, 14, 5, "#725046");
      box(ctx, x, y, 5, 5, "#c99262");
      box(ctx, x + 1, y + 1, 2, 2, "#e9ad72");
    }
    // Lamp, chest, and boots by the door.
    box(ctx, 70, 178, 34, 23, "#725040");
    box(ctx, 70, 175, 34, 9, "#a5704d");
    box(ctx, 70, 175, 34, 2, "#d39a60");
    box(ctx, 84, 183, 5, 4, "#e0b174");
    box(ctx, 361, 180, 20, 6, "#63443b");
    box(ctx, 364, 166, 12, 14, "#5c4746");
    box(ctx, 367, 168, 6, 9, "#ffd589");
    box(ctx, 363, 164, 14, 3, "#b98d65");
    box(ctx, 271, 235, 8, 8, "#624844");
    box(ctx, 281, 235, 8, 8, "#624844");
    box(ctx, 271, 235, 8, 2, "#b77751");
    box(ctx, 281, 235, 8, 2, "#b77751");
  }

  room(base);
  details(props);

  function windowView(ctx, palette, hour, weather, elapsed) {
    const horizon = 81;
    const sunset = Math.max(0, 1 - Math.abs(hour - 18.3) / 2.2);
    const night = hour >= 19.3 || hour < 5.2;
    for (let y = 56; y < horizon; y += 2) box(ctx, 171, y, 103, 2, rgb(tint(palette.sky, palette.rim, (y - 56) / 25)));
    if (night) {
      box(ctx, 247, 62, 5, 6, "#f6dba6");
      box(ctx, 249, 61, 4, 4, rgb(palette.sky));
      for (const [x, y] of [[181, 64], [192, 70], [212, 61], [224, 66], [261, 67]]) box(ctx, x, y, 1, 1, "#ddcbb9");
    } else {
      const sunY = Math.round(59 + sunset * 18);
      box(ctx, 245, sunY - 4, 7, 8, rgb([255, 226, 156], weather === "rain" ? .23 : .93));
      box(ctx, 244, sunY - 3, 9, 6, rgb([255, 226, 156], weather === "rain" ? .2 : .84));
      box(ctx, 177, 71, 23, 2, rgb(palette.light, .52));
      box(ctx, 181, 69, 10, 2, rgb(palette.light, .60));
      box(ctx, 208, 77, 19, 1, rgb(palette.light, .42));
    }
    for (let y = horizon; y < 103; y += 2) box(ctx, 171, y, 103, 2, rgb(tint(palette.sea, palette.deep, (y - horizon) / 24)));
    box(ctx, 171, horizon, 103, 1, rgb(palette.light, .65));
    for (let i = 0; i < 23; i++) {
      const x = 173 + (i * 19 % 88) + Math.sin(elapsed + i) * 2;
      box(ctx, x, 84 + (i * 11 % 18), 2 + i % 7, 1, rgb(palette.light, .22 + i % 4 * .1));
    }
    if (weather === "rain" || weather === "storm") for (let i = 0; i < 19; i++) {
      const x = 174 + i * 29 % 95;
      const y = 56 + (i * 13 + elapsed * 90) % 43;
      line(ctx, [[x, y], [x + (weather === "storm" ? 7 : 2), y + 4]], "#bce1dd63");
    }
    if (weather === "snow") for (let i = 0; i < 24; i++) {
      const x = 173 + (i * 29 + elapsed * 6) % 97;
      const y = 57 + (i * 13 + elapsed * 19) % 43;
      box(ctx, x, y, 1 + Number(i % 6 === 0), 1, "#ebf1dcb0");
    }
    box(ctx, 221, 54, 4, 50, "#704b40");
    box(ctx, 221, 55, 1, 47, "#ca925e");
    box(ctx, 169, 79, 107, 3, "#704b40");
    box(ctx, 169, 79, 107, 1, "#cc9b65");
  }

  function sleeper(ctx, elapsed, gender) {
    const colors = avatarColors(gender);
    const breath = Math.round((Math.sin(elapsed * 2.7) + 1) / 2);
    box(ctx, 105, 123, 20, 14, "#af8c715e");
    if (gender === "female") box(ctx, 101, 128, 8, 7, colors.h);
    polygon(ctx, [[0, 5], [2, 1], [11, 0], [16, 4], [17, 11], [13, 14], [5, 14], [1, 10]], colors.h, 103, 120);
    box(ctx, 107, 123, 11, 10, "#e7a778");
    box(ctx, 108, 123, 9, 6, "#f6c694");
    box(ctx, 108, 127, 3, 1, "#654149");
    box(ctx, 115, 127, 3, 1, "#654149");
    box(ctx, 111, 131, 4, 1, "#be7d66");
    box(ctx, 106, 120, gender === "male" ? 9 : 11, 3, colors.H);
    box(ctx, 104, 134 - breath, 19, 7 + breath, colors.B);
    box(ctx, 105, 134 - breath, 17, 2, colors.T);
    for (let i = 0; i < 2; i++) {
      const t = (elapsed * 9 + i * 7) % 18;
      const x = 120 + t;
      const y = 121 - t;
      line(ctx, [[x, y], [x + 4, y], [x, y + 4], [x + 4, y + 4]], rgb([255, 232, 192], .75 - t / 29));
    }
  }

  function cookAnimation(ctx, elapsed, gender) {
    const stir = Math.sin(elapsed * 8);
    const spoonX = 331 + stir * 4;
    line(ctx, [[341, 138], [344, 129], [341 + stir * 2, 122]], avatarColors(gender).B, 4);
    box(ctx, 339 + stir * 2, 121, 4, 4, "#eeb17c");
    line(ctx, [[341 + stir * 2, 122], [spoonX, 101]], "#deb27a", 2);
    box(ctx, spoonX - 1, 100, 4, 3, "#a77550");
    for (let i = 0; i < 5; i++) {
      const rise = (elapsed * 13 + i * 5) % 25;
      const x = 321 + i * 5 + Math.sin(rise * .51) * 3;
      box(ctx, x, 95 - rise, 3, 1, rgb([255, 229, 190], .79 - rise / 36));
      box(ctx, x + 2, 94 - rise, 2, 1, rgb([255, 240, 196], .56 - rise / 51));
    }
    for (let i = 0; i < 6; i++) {
      const height = 2 + (Math.sin(elapsed * 17 + i * 1.9) + 1) * 3;
      box(ctx, 320 + i * 3, 135 - height, 2, Math.round(height), i % 2 ? "#ffbf72" : "#f18a55");
    }
  }

  function draw(ctx, scene) {
    const { hour, weather, elapsed, player, target, cooking, sleeping, sleepProgress, season } = scene;
    const palette = daylight(hour, weather, season);
    const night = Math.max(0, Math.min(1, (palette.alpha - .16) / .34));
    const sun = weather === "storm" ? .07 : weather === "rain" ? .18 : weather === "cloud" ? .67 : 1;
    ctx.drawImage(base.canvas, 0, 0, W, H);
    box(ctx, 48, 39, 352, 217, rgb([54, 42, 68], night * .42));
    const windowLight = sun * (1 - night) * .28;
    polygon(ctx, [[172, 115], [260, 115], [245, 152], [223, 171], [123, 171]], rgb(palette.light, windowLight));
    line(ctx, [[144, 161], [229, 161]], rgb(palette.light, windowLight * 1.3));
    line(ctx, [[215, 117], [178, 171]], rgb([138, 83, 63], windowLight * .65), 2);
    ctx.drawImage(props.canvas, 0, 0, W, H);
    box(ctx, 61, 48, 325, 113, rgb([63, 41, 51], night * .16));
    windowView(ctx, palette, hour, weather, elapsed);
    const flicker = Math.sin(elapsed * 4) * .025;
    oval(ctx, 371, 173, 17, 15, rgb([255, 178, 82], .10 + night * .18 + flicker));
    box(ctx, 368, 170, 4, 5, "#ffe4a2");
    box(ctx, 319, 131, 21, 2, rgb([255, 187, 91], .54 + flicker));
    if (target) {
      oval(ctx, target.x, target.y, 4, 2, "#fff3d496");
      oval(ctx, target.x, target.y, 2, 1, "#e4aa6299");
    }
    if (sleeping) {
      sleeper(ctx, elapsed, player.gender);
      const dim = Math.sin(sleepProgress * Math.PI) ** 1.5 * .45;
      box(ctx, 0, 0, W, H, rgb([16, 25, 48], dim));
    } else {
      avatar(ctx, player, elapsed, cooking ? Math.round(Math.sin(elapsed * 8)) : 0);
      if (cooking) cookAnimation(ctx, elapsed, player.gender);
    }
  }

  return { draw, walkable, spots, entrance };
})();
