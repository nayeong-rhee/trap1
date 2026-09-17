let particles = [];
let fly = { x: 0, y: 0, speed: 0, size: 22 };
let timeLeft = 30.0;
let gameState = 'PLAYING'; // 'PLAYING', 'GAMEOVER', 'CLEAR'
let struggleIntensity = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fly.x = width / 2;
  fly.y = height / 2;

  // 꿀 냄새 입자 45개 생성
  for (let i = 0; i < 45; i++) {
    particles.push(new ScentParticle());
  }
}

function draw() {
  background(11, 17, 14, 55); // 잔상 효과

  // 1. 마우스 속도(발버둥) 계산
  let currentSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
  fly.speed = lerp(fly.speed, currentSpeed, 0.3);
  fly.x = mouseX;
  fly.y = mouseY;

  // 2. 발버둥 수치 제어
  if (fly.speed > 16) {
    struggleIntensity = min(struggleIntensity + 0.05, 1.0);
  } else {
    struggleIntensity = max(struggleIntensity - 0.02, 0.0);
  }

  // 화면 붉은 펄스 (위험 경고)
  if (struggleIntensity > 0 && gameState === 'PLAYING') {
    fill(235, 60, 60, struggleIntensity * 40);
    noStroke();
    rect(0, 0, width, height);
  }

  // 3. 파리지옥 잎 내부 경계선 가이드
  drawTrapBoundary();

  // 4. 입자 업데이트 및 렌더링
  for (let p of particles) {
    if (gameState === 'PLAYING') {
      p.update(fly);
    }
    p.display();

    // 충돌 체크
    if (gameState === 'PLAYING') {
      let d = dist(fly.x, fly.y, p.x, p.y);
      if (d < p.radius + fly.size * 0.3) {
        handleGameOver();
      }
    }
  }

  // 5. 파리(플레이어 커서) 렌더링
  drawFly(fly.x, fly.y, fly.speed);

  // 6. 타이머 루프
  if (gameState === 'PLAYING') {
    updateTimer();
  }
}

// 냄새 입자 객체
class ScentParticle {
  constructor() {
    this.init();
  }

  init() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-0.8, 0.8);
    this.vy = random(-0.8, 0.8);
    this.radius = random(10, 22);
  }

  update(targetFly) {
    this.x += this.vx;
    this.y += this.vy;

    // 화면 밖 순환
    if (this.x < -30) this.x = width + 30;
    if (this.x > width + 30) this.x = -30;
    if (this.y < -30) this.y = height + 30;
    if (this.y > height + 30) this.y = -30;

    // 발버둥 칠수록 입자가 파리 쪽으로 수축
    let d = dist(this.x, this.y, targetFly.x, targetFly.y);
    let attractionRadius = 380;

    if (targetFly.speed > 16 && d < attractionRadius) {
      let force = map(targetFly.speed, 16, 60, 0.015, 0.075, true);
      this.x = lerp(this.x, targetFly.x, force);
      this.y = lerp(this.y, targetFly.y, force);
    }
  }

  display() {
    noStroke();
    // 꿀빛 글로우
    fill(230, 200, 90, 30);
    ellipse(this.x, this.y, this.radius * 2.8);
    fill(245, 215, 110, 180);
    ellipse(this.x, this.y, this.radius * 1.4);
  }
}

// 파리 커서 그리기
function drawFly(x, y, speed) {
  push();
  translate(x, y);

  let bodyColor = lerpColor(color(140, 240, 165), color(255, 75, 75), map(speed, 10, 45, 0, 1, true));

  noStroke();
  fill(bodyColor);
  ellipse(0, 0, fly.size, fly.size * 0.75);

  let wingOffset = sin(frameCount * 0.8) * 4;
  fill(255, 255, 255, 130);
  ellipse(-6, -8 + wingOffset, 14, 7);
  ellipse(6, -8 + wingOffset, 14, 7);

  pop();
}

function drawTrapBoundary() {
  noFill();
  stroke(30, 48, 38, 120);
  strokeWeight(2);
  rect(16, 16, width - 32, height - 32, 24);
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft -= deltaTime / 1000;
    document.getElementById('timer').innerText = max(0, timeLeft).toFixed(2);
  } else {
    handleClear();
  }
}

function handleGameOver() {
  gameState = 'GAMEOVER';
  document.body.style.cursor = 'default';

  let modal = document.getElementById('game-over-modal');
  document.getElementById('modal-title').innerText = 'CAPTURED';
  document.getElementById('modal-title').style.color = '#ff6b6b';
  document.getElementById('modal-desc').innerText = '발버둥 치는 바람에 유혹의 입자가 엉겨 붙었습니다.';
  modal.classList.remove('hidden');
}

function handleClear() {
  gameState = 'CLEAR';
  document.body.style.cursor = 'default';

  let modal = document.getElementById('game-over-modal');
  document.getElementById('modal-title').innerText = 'FREEDOM';
  document.getElementById('modal-title').style.color = '#8af0a1';
  document.getElementById('modal-desc').innerText = '침묵과 정적으로 유혹을 흘려보내고 탈출했습니다.';
  modal.classList.remove('hidden');
}

function resetGame() {
  timeLeft = 30.0;
  gameState = 'PLAYING';
  struggleIntensity = 0;
  document.body.style.cursor = 'none';
  document.getElementById('game-over-modal').classList.add('hidden');

  for (let p of particles) {
    p.init();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}