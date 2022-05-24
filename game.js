kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

let coin = "wbKxhcd.png";
let brick = "pogC9x5.png";
let goomba = "KPO3fR9.png";
let block = "M6rwarW.png";
let mario = "Wb1qfhK.png";
let mushroom = "0wMd92p.png";
let surprise = "gesQ1KP.png";
let unboxed = "bdrLpi6.png";
let pipeTL = "ReTPiWY.png";
let pipeTR = "hj2GK4n.png";
let pipeBL = "c1cYSbt.png";
let pipeBR = "nqQ79eI.png";

loadRoot("https://i.imgur.com/");
loadSprite("coin", coin);
loadSprite("goomba", goomba);
loadSprite("brick", brick);
loadSprite("block", block);
loadSprite("mario", mario);
loadSprite("mushroom", mushroom);
loadSprite("surprise", surprise);
loadSprite("unboxed", unboxed);
loadSprite("pipe-top-left", pipeTL);
loadSprite("pipe-top-right", pipeTR);
loadSprite("pipe-bottom-left", pipeBL);
loadSprite("pipe-bottom-right", pipeBR);

scene("game", ({ score }) => {
  layers(["bg", "obj", "ui"], "obj");

  const map = [
    "                                               ",
    "                                               ",
    "                                               ",
    "                                               ",
    "                                               ",
    "     %     =*=%=                               ",
    "                                               ",
    "                            -+                 ",
    "                   ^    ^   ()                 ",
    "==============================     ============",
  ];

  const levelCfg = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid()],
    $: [sprite("coin"), "coin"],
    "^": [sprite("goomba"), solid(), "dangerous"],
    "%": [sprite("surprise"), solid(), "coin-surprise"],
    "*": [sprite("surprise"), solid(), "mushroom-surprise"],
    "}": [sprite("unboxed"), solid()],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
    "-": [sprite("pipe-top-left"), solid(), scale(0.5)],
    "+": [sprite("pipe-top-right"), solid(), scale(0.5)],
    "#": [sprite("mushroom"), solid(), "mushroom", body()],
  };

  const gameLevel = addLevel(map, levelCfg);

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer("ui"),
    { value: score },
  ]);

  function big() {
    let timer = 0;
    let isBig = false;

    return {
      update() {
        if (isBig) {
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        this.scale = vec2(1);
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        timer = 0;
        isBig = false;
      },
      biggify(time) {
        this.scale = vec2(2);
        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
        timer = time;
        isBig = true;
      },
    };
  }

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin("bot"),
  ]);

  action("mushroom", (m) => {
    m.move(10, 0);
  });

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("#", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
  });

  const MOVE_SPEED = 120;
  const JUMP_FORCE = 440;
  const BIG_JUMP_FORCE = 660;
  let CURRENT_JUMP_FORCE = JUMP_FORCE;
  let isJumping = true;
  const fall_death = 400;

  player.collides("mushroom", (m) => {
    destroy(m);
    player.biggify(4000);
  });

  player.collides("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  action("dangerous", (d) => {
    d.move(-20, 0);
  });

  player.collides("dangerous", (d) => {
    if (isJumping) {
      destroy(d);
    } else {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= fall_death) {
      go("lose", { score: scoreLabel.value });
    }
  });

  keyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
  });

  keyDown("right", () => {
    player.move(MOVE_SPEED, 0);
  });

  player.action(() => {
    if (player.grounded()) {
      isJumping = false;
    }
  });

  keyPress("space", () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(CURRENT_JUMP_FORCE);
    }
  });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

start("game", { score: 0 });
