// 音乐dom
let bgMusic = document.getElementById('bg-music');
let bombMusic = document.getElementById('bomb-music');
let foodMusic = document.getElementById('food-music');
let scores = JSON.parse(localStorage.getItem('score'));
if (!scores) scores = [];
let scoreRenderMes = [];
// 分数
let score = 0;
// 计时器
let timer = null;
// 蛇移动时间间隔
let time = 100;
// 运动方向
const DIRECTION = {
  LEFT: "LEFT",
  TOP: "TOP",
  RIGHT: "RIGHT",
  BOTTOM: "BOTTOM"
}
// 当前运动方向
let pos = DIRECTION.RIGHT;
// 当前状态
const status = {
  DEADED: "DEADED",
  MOVED: "MOVED",
  EATED: "EATED"
}
// 背景色
const bkgdColor = 'green';
// 墙颜色
const wallColor = 'black';
// 蛇颜色
const snakeColor = 'blue';
// 食物颜色
const foodColor = 'yellow';
// 炸弹颜色
const bombColor = 'red';
/**
 * 蛇坐标构造函数
 * @param {number:1~48} x 
 * @param {number:1~38} y 
 */
function Snake(x, y) {
  this.x = x;
  this.y = y;
  this.change = (x, y) => {
    this.x = x;
    this.y = y;
  }
}
// 蛇坐标
let snakes = [];
/**
 * 食物坐标构造函数
 * @param {number:1~48} x 
 * @param {number:1~38} y 
 */
function Food(x, y) {
  this.x = x;
  this.y = y;
}
// 食物坐标 
let foods = [];
// 食物数量
const foodNum = 2;
/**
 * 炸弹坐标构造函数
 * @param {number:1~48} x 
 * @param {number:1~38} y 
 */
function Bomb(x, y) {
  this.x = x;
  this.y = y;
}
// 炸弹坐标
let bombs = [];
// 炸弹数量
const bombNum = 2;

// 画布高度400, 宽度500, 小方块设计为10*10
// 画布
const canvas = document.getElementById('canvas');
// 2d对象
const ctx = canvas.getContext('2d');
/**
 * 初始化
 */
function init() {
  initData();
  // 画背景
  renderBkgd()
  // 画墙
  renderWall()
  // 画蛇
  renderSnake();
  // 画食物
  renderFood();
  // 画炸弹
  renderBomb();
  // 画评分
  renderScore();
}
/**
 * 初始化数据
 */
function initData() {
  // 初始化分数
  score = 0;
  // 初始化分数显示
  scoreRenderMes = [...scores, score];
  scoreRenderMes.sort((a, b) => b - a);
  scoreRenderMes.splice(3); //保留前3
  // 初始化移动方向
  pos = DIRECTION.RIGHT;
  // 初始化蛇的位置
  snakes = [];
  snakes.push(new Snake(3, 1));
  snakes.push(new Snake(2, 1));
  snakes.push(new Snake(1, 1));
  // 初始化炸弹
  bombs = [];
  for (let i = 0; i < bombNum; i++) {
    let { x, y } = createBomb();
    bombs.push(new Bomb(x, y));
  }
  // 初始化食物
  foods = [];
  for (let i = 0; i < foodNum; i++) {
    let { x, y } = createFood();
    foods.push(new Food(x, y));
  }
}
/**
 * 创建炸弹坐标
 */
function createBomb() {
  let { x, y } = getRandom();
  // 如果该坐标已被使用，重新调用createFood
  for (let snake of snakes) {
    if (snake.x === x && snake.y === y) return createFood();
  }
  for (let bomb of bombs) {
    if (bomb.x === x && bomb.y === y) return createFood();
  }
  return { x, y };
}
/**
 * 创建食物坐标
 */
function createFood() {
  let { x, y } = getRandom();
  // 如果该坐标已被使用，重新调用createFood
  for (let snake of snakes) {
    if (snake.x === x && snake.y === y) return createFood();
  }
  for (let food of foods) {
    if (food.x === x && food.y === y) return createFood();
  }
  for (let bomb of bombs) {
    if (bomb.x === x && bomb.y === y) return createFood();
  }
  return { x, y };
}
/**
 * 蛇动或暂停
 */
function run() {
  if (timer) {
    bgMusic.pause();
    window.removeEventListener('keydown', keydown);
    clearInterval(timer);
    timer = null;
  } else {
    bgMusic.play();
    window.addEventListener('keydown', keydown)
    timer = setInterval(() => {
      next();
    }, time);
  }
}
/**
 * 键盘按钮事件
 */
function keydown(e) {
  if (e.keyCode === 37) {
    // 左
    if (pos !== DIRECTION.RIGHT) {
      pos = DIRECTION.LEFT;
    }
  } else if (e.keyCode === 38) {
    // 上
    if (pos !== DIRECTION.BOTTOM) {
      pos = DIRECTION.TOP;
    }
  } else if (e.keyCode === 39) {
    // 右
    if (pos !== DIRECTION.LEFT) {
      pos = DIRECTION.RIGHT;
    }
  } else if (e.keyCode === 40) {
    // 下
    if (pos !== DIRECTION.TOP) {
      pos = DIRECTION.BOTTOM;
    }
  }
}
/**
 * 下一次蛇移动的操作
 */
function next() {
  let { x, y } = getTarget();
  if (getStatus() === status.MOVED) {
    // 正常移动, 后面的坐标等于前面的坐标
    for (let i = snakes.length - 1; i > 0; i--) {
      snakes[i].change(snakes[i - 1].x, snakes[i - 1].y);
    }
    snakes[0].change(x, y);
  } else if (getStatus() === status.DEADED) {
    // 死了
    clearInterval(timer);
    ctx.fillStyle = 'white';
    ctx.font = '100px Georgia';
    ctx.fillText('游戏结束', 50, 200)
    scoreRenderMes = [...scores, score];
    scoreRenderMes.sort((a, b) => b - a);
    scoreRenderMes.splice(3); //保留前3
    localStorage.setItem('score', JSON.stringify(scoreRenderMes));
    scores = scoreRenderMes;
    initData();
    run();
    return;
  } else {
    // 吃到食物
    score++;
    scoreRenderMes = [...scores, score];
    scoreRenderMes.sort((a, b) => b - a);
    scoreRenderMes.splice(3); //保留前3
    localStorage.setItem('score', JSON.stringify(scoreRenderMes));
    snakes.unshift(new Snake(x, y));
    let food = createFood();
    foods.push(new Food(food.x, food.y));
  }
  renderBkgd();
  renderSnake();
  renderFood();
  renderBomb();
  renderScore();
}
/**
 * 得到下一步蛇头的坐标
 */
function getTarget() {
  let target = {
    x: snakes[0].x,
    y: snakes[0].y
  }
  if (pos === DIRECTION.RIGHT) {
    target.x++;
  } else if (pos === DIRECTION.TOP) {
    target.y--;
  } else if (pos === DIRECTION.BOTTOM) {
    target.y++;
  } else {
    target.x--;
  }
  return target;
}
/**
 * 返回当前状态
 */
function getStatus() {
  let { x, y } = getTarget();
  if (hitWall(x, y)) return status.DEADED;
  if (hitBomb(x, y)) return status.DEADED;
  if (eatSnake(x, y)) return status.DEADED;
  if (eatFood(x, y)) return status.EATED;
  return status.MOVED;
}
/**
 * 判断是否吃到食物
 * @param {number} x 横坐标
 * @param {number} y 纵坐标
 */
function eatFood(x, y) {
  for (let i in foods) {
    food = foods[i];
    if (food.x === x && food.y === y) {
      // 先删除食物
      foods.splice(i, 1);
      foodMusic.play();
      return true;
    }
  }
  return false;
}
/**
 * 判断是否咬到自己
 * @param {number} x 横坐标
 * @param {number} y 纵坐标
 */
function eatSnake(x, y) {
  for (let i in snakes) {
    if (i === snakes.length - 1) break;
    snake = snakes[i];
    if (snake.x === x && snake.y === y) return true;
  }
  return false;
}
/**
 * 判断是否撞墙
 * @param {number} x 横坐标
 * @param {number} y 纵坐标
 */
function hitWall(x, y) {
  if (x === 0 || x === 49 || y === 0 || y === 39) return true;
  return false;
}
/**
 * 判断是否撞到炸弹
 * @param {number} x 横坐标
 * @param {number} y 纵坐标
 */
function hitBomb(x, y) {
  for (let i in bombs) {
    bomb = bombs[i];
    if (bomb.x === x && bomb.y === y) {
      bombMusic.play();
      return true;
    }
  }
  return false;
}
/**
 * 绘制炸弹
 */
function renderBomb() {
  ctx.fillStyle = bombColor;
  for (let bomb of bombs) {
    ctx.fillRect(bomb.x * 10, bomb.y * 10, 10, 10);
  }
}
/**
 * 绘制食物
 */
function renderFood() {
  ctx.fillStyle = foodColor;
  for (let food of foods) {
    ctx.fillRect(food.x * 10, food.y * 10, 10, 10);
  }
}
/**
 * 绘制蛇
 */
function renderSnake() {
  ctx.fillStyle = snakeColor;
  for (let snake of snakes) {
    ctx.fillRect(snake.x * 10, snake.y * 10, 10, 10);
  }
}
/**
 * 绘制背景
 */
function renderBkgd() {
  ctx.fillStyle = bkgdColor;
  ctx.fillRect(10, 10, 480, 380);
}
/**
 * 绘制墙
 */
function renderWall() {
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 0, 10, 400);
  ctx.fillRect(490, 0, 10, 400);
  ctx.fillRect(0, 0, 500, 10);
  ctx.fillRect(0, 390, 500, 10);
}
// 监听空格用来启动、暂停
window.onkeydown = e => {
  if (e.keyCode === 32) {
    // 空格
    run();
  }
}
/**
 * 得到一个坐标的随机数
 */
function getRandom() {
  let x = Math.floor(Math.random() * 48) + 1,
    y = Math.floor(Math.random() * 38) + 1;
  return { x, y }
}

/**
 * 绘制排名和评分信息
 */
function renderScore() {
  ctx.fillStyle = 'white';
  ctx.fillRect(500, 0, 200, 400);
  ctx.font = '50px Georgia';
  ctx.fillStyle = 'black';
  ctx.fillText('排行榜', 520, 50);
  ctx.font = '20px Georgia';
  for (let i = 0; i < 3; i++) {
    let str = (scoreRenderMes[i] === undefined ? 0 : scoreRenderMes[i])
    ctx.fillText(`第${i + 1}名：${str}`, 550, 30 * i + 100);
  }
  ctx.font = '50px Georgia';
  ctx.fillText('当前得分', 500, 240);
  ctx.fillText(`${score}`, 580, 300);
}


init();