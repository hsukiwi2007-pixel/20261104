// ==========================================
// 國小四年級自然科學互動測驗系統 (含語音朗讀) - sketch.js
// ==========================================

// ── 全域變數宣告 ──
let currentQuestion = 0;      // 當前題目索引 (0~5)
let score = 0;                // 總得分 (答對一題加1分)
let gameState = 'QUIZ';       // 遊戲狀態：'QUIZ' (測驗中), 'SUBMIT' (顯示交卷按鈕), 'RESULT' (結算成績)
let userAnswers = [];         // 記錄使用者每一題選的答案索引
let lastSpokenQuestion = -1;  // 用於控制語音不重複播放的追蹤變數

// 動畫與特效相關
let poppingBalloons = [];     // 儲存氣球破裂粒子效果
let confettiParticles = [];   // 儲存結算時的彩帶粒子

// 國小四年級自然科學測驗題目資料庫 (共六題，動畫圖形精確對應正確答案)
const quizData = [
  {
    question: "1. 下列哪一種植物屬於漂浮生水生植物，葉柄常有膨大的氣室？",
    options: ["布袋蓮", "大萍", "荷花", "睡蓮"],
    correct: 0 // 正確答案：布袋蓮
  },
  {
    question: "2. 農曆每個月的初一，我們在夜空中看到的月亮形狀稱為什麼？",
    options: ["滿月", "上弦月", "新月(朔)", "下弦月"],
    correct: 2 // 正確答案：新月(朔)
  },
  {
    question: "3. 將燈泡與電池串聯時，若其中一個燈泡壞掉斷路，另一個燈泡會怎樣？",
    options: ["變得更亮", "不會亮", "不受影響", "閃爍發光"],
    correct: 1 // 正確答案：不會亮
  },
  {
    question: "4. 夜晚觀星時，要找出北方的位置，最常利用哪一個星座來尋找北極星？",
    options: ["獵戶座", "天鵝座", "大熊座(北斗七星)", "天蠍座"],
    correct: 2 // 正確答案：大熊座(北斗七星)
  },
  {
    question: "5. 當我們使用彈簧測驗計來測量力的大小與重量時，單位通常使用下列哪一個？",
    options: ["公克重 (gw)", "公分 (cm)", "攝氏度 (°C)", "毫升 (mL)"],
    correct: 0 // 正確答案：公克重 (gw)
  },
  {
    question: "6. 當氣象觀測天空中的雲量占了全部天空的 3/4 (75%) 以上時，氣象上稱為什麼天氣？",
    options: ["晴天", "多雲時陰", "陰天", "晴時多雲"],
    correct: 2 // 正確答案：陰天
  }
];

// 氣球顏色配置 (紅、藍、綠、黃)
const balloonColors = [
  { main: '#FF595E', highlight: '#FF888B' },
  { main: '#1982C4', highlight: '#54ACDF' },
  { main: '#8AC926', highlight: '#B5E26A' },
  { main: '#FFCA3A', highlight: '#FFE185' }
];

// ==========================================
// 1. p5.js 初始化階段 (Setup)
// ==========================================
function setup() {
  // 建立全螢幕響應式畫布
  createCanvas(windowWidth, windowHeight);
  
  // 禁用瀏覽器預設的右鍵選單，使「按右鍵破氣球」流暢運作
  document.addEventListener('contextmenu', event => event.preventDefault());

  // 設置文字預設對齊方式
  textAlign(CENTER, CENTER);
}

// ==========================================
// 2. 視窗尺寸變更時自動調整 (全螢幕響應式)
// ==========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==========================================
// 3. p5.js 主要繪製迴圈 (Draw Loop)
// ==========================================
function draw() {
  // 繪製背景 (溫和淺藍色底)
  background('#EAF2F8');

  if (gameState === 'QUIZ') {
    drawQuizScreen();
  } else if (gameState === 'SUBMIT') {
    drawSubmitScreen();
  } else if (gameState === 'RESULT') {
    drawResultScreen();
  }

  // 繪製氣球破裂爆破粒子效果
  updateAndDrawPoppingParticles();

  // 若得分高於 80% (>= 5 題)，在結果頁繪製歡慶彩帶飄落效果
  if (gameState === 'RESULT' && (score / quizData.length) >= 0.8) {
    updateAndDrawConfetti();
  }
}

// ==========================================
// 4. 畫面階段繪製函式
// ==========================================

// ── 繪製測驗主畫面 (QUIZ) ──
function drawQuizScreen() {
  let q = quizData[currentQuestion];

  // 當進入新題目時，自動觸發語音朗讀題目內容
  if (lastSpokenQuestion !== currentQuestion) {
    speakQuestionText(q.question);
    lastSpokenQuestion = currentQuestion;
  }

  // A. 顯示頂部進度條與題目 (居中對齊)
  fill('#2C3E50');
  textSize(min(width * 0.022, 20));
  textStyle(BOLD);
  text(`🌱 四年級自然科學測驗：第 ${currentQuestion + 1} / ${quizData.length} 題`, width / 2, height * 0.06);

  textSize(min(width * 0.028, 24));
  fill('#1B4F72');
  text(q.question, width / 2, height * 0.12);

  // B. 顯示中間題目圖像區 (置中居中對齊)
  let imgBoxWidth = min(width * 0.45, 380);
  let imgBoxHeight = min(height * 0.32, 220);
  let centerX = width / 2;
  let centerY = height * 0.35;

  // 繪製圖片外框容器 (以 CENTER 模式繪製，確保 100% 居中)
  push();
  rectMode(CENTER);
  stroke('#AED6F1');
  strokeWeight(3);
  fill(255);
  rect(centerX, centerY, imgBoxWidth, imgBoxHeight, 15);
  pop();

  // 繪製與正確答案對應的動態圖像 (完美置於白框中央)
  drawCorrectAnswerAnimation(currentQuestion, centerX, centerY, imgBoxWidth, imgBoxHeight);

  // C. 操作提示文字 (提示語音功能)
  fill('#C0392B');
  textSize(min(width * 0.018, 15));
  textStyle(NORMAL);
  text("🔊 系統正在朗讀題目... 將滑鼠移到對應選項氣球上「按滑鼠右鍵」擊破氣球！", width / 2, height * 0.57);

  // D. 繪製下方四顆氣球選項
  let balloonY = height * 0.74;
  let spacing = width / 5;

  for (let i = 0; i < 4; i++) {
    let balloonX = spacing * (i + 1);
    drawBalloon(balloonX, balloonY, i, q.options[i]);
  }
}

// ── 瀏覽器語音朗讀函式 (Web Speech API) ──
function speakQuestionText(text) {
  if ('speechSynthesis' in window) {
    // 停止前面尚未講完的語音，避免重疊
    window.speechSynthesis.cancel();
    
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW'; // 設定為繁體中文
    utterance.rate = 0.95;    // 語速微調稍慢，適合小朋友聆聽
    utterance.pitch = 1.0;    // 語調正常
    
    window.speechSynthesis.speak(utterance);
  }
}

// ── 繪製氣球與選項 ──
function drawBalloon(x, y, index, optionText) {
  let balloonSize = min(width * 0.1, 100);
  
  // 判斷滑鼠是否懸停在氣球範圍內
  let d = dist(mouseX, mouseY, x, y);
  let isHovered = d < balloonSize / 2;
  
  // 懸停時氣球微幅放大
  let currentSize = isHovered ? balloonSize * 1.1 : balloonSize;
  let colorTheme = balloonColors[index];

  push();
  translate(x, y);

  // 1. 氣球繩子
  stroke('#7F8C8D');
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(0, currentSize / 2);
  quadraticVertex(sin(frameCount * 0.1 + index) * 10, currentSize / 2 + 25, 0, currentSize / 2 + 45);
  endShape();

  // 2. 氣球本體
  noStroke();
  fill(colorTheme.main);
  ellipse(0, 0, currentSize, currentSize * 1.2);

  // 3. 氣球高光反射
  fill(colorTheme.highlight);
  ellipse(-currentSize * 0.25, -currentSize * 0.3, currentSize * 0.25, currentSize * 0.35);

  // 4. 氣球底部打結處
  fill(colorTheme.main);
  triangle(-6, currentSize * 0.6, 6, currentSize * 0.6, 0, currentSize * 0.55);

  // 5. 下方選項文字方塊
  rectMode(CENTER);
  fill(isHovered ? '#F1C40F' : '#FFFFFF');
  stroke('#BDC3C7');
  strokeWeight(2);
  rect(0, currentSize * 0.6 + 35, currentSize * 1.3, 34, 8);

  fill('#2C3E50');
  noStroke();
  textSize(min(width * 0.018, 16));
  textStyle(BOLD);
  text(optionText, 0, currentSize * 0.6 + 35);

  pop();
}

// ── 繪製交卷看成績按鈕畫面 (SUBMIT) ──
function drawSubmitScreen() {
  fill('#2C3E50');
  textSize(min(width * 0.04, 36));
  textStyle(BOLD);
  text("🎉 太棒了！你已經完成所有測驗題目囉！", width / 2, height * 0.38);

  // 交卷按鈕位置與懸停判定
  let btnW = 240;
  let btnH = 65;
  let btnX = width / 2;
  let btnY = height * 0.55;
  let isHover = abs(mouseX - btnX) < btnW / 2 && abs(mouseY - btnY) < btnH / 2;

  push();
  translate(btnX, btnY);
  rectMode(CENTER);

  fill(isHover ? '#27AE60' : '#2ECC71');
  stroke('#27AE60');
  strokeWeight(3);
  rect(0, 0, btnW, btnH, 30);

  fill(255);
  noStroke();
  textSize(24);
  textStyle(BOLD);
  text("交卷看成績 📊", 0, 0);
  pop();
}

// ── 繪製結算與成績畫面 (RESULT) ──
function drawResultScreen() {
  let percent = (score / quizData.length) * 100;
  let isPassed = percent >= 80;

  // 結算數據框
  fill(255, 245);
  stroke('#BDC3C7');
  strokeWeight(3);
  rectMode(CENTER);
  rect(width / 2, height / 2, min(width * 0.7, 550), min(height * 0.6, 420), 25);

  // 標題與分數
  fill('#2C3E50');
  textSize(min(width * 0.04, 34));
  textStyle(BOLD);
  text("自然科學測驗結果", width / 2, height * 0.3);

  fill(isPassed ? '#27AE60' : '#E67E22');
  textSize(min(width * 0.07, 60));
  text(`${score} / ${quizData.length} 題`, width / 2, height * 0.42);

  fill('#34495E');
  textSize(min(width * 0.03, 24));
  text(`正確率：${nf(percent, 1, 0)}%`, width / 2, height * 0.52);

  // 鼓勵評語
  textSize(min(width * 0.025, 20));
  if (isPassed) {
    fill('#27AE60');
    text("🌟 太厲害了！你是小小自然科學家！", width / 2, height * 0.62);
  } else {
    fill('#E67E22');
    text("💪 再接再厲，複習一下課本一定會拿滿分！", width / 2, height * 0.62);
  }

  // 再測驗一次按鈕
  let btnW = 180;
  let btnH = 50;
  let btnX = width / 2;
  let btnY = height * 0.73;
  let isHover = abs(mouseX - btnX) < btnW / 2 && abs(mouseY - btnY) < btnH / 2;

  push();
  translate(btnX, btnY);
  rectMode(CENTER);
  fill(isHover ? '#2980B9' : '#3498DB');
  noStroke();
  rect(0, 0, btnW, btnH, 20);

  fill(255);
  textSize(18);
  textStyle(BOLD);
  text("再測驗一次 🔄", 0, 0);
  pop();
}

// ==========================================
// 5. 繪製對應正解的動態視覺圖像 (以白框中心為原點 0,0)
// ==========================================
function drawCorrectAnswerAnimation(qIdx, cX, cY, w, h) {
  push();
  translate(cX, cY); // 將座標原點移至白色容器正中心

  if (qIdx === 0) {
    // 【第 1 題正解：布袋蓮 (氣室膨大的漂浮水生植物)】
    fill('#A9CCE3'); noStroke();
    rectMode(CENTER);
    rect(0, 30, w - 30, 45, 0, 0, 10, 10);

    let floatY = sin(frameCount * 0.08) * 5;
    fill('#27AE60');
    ellipse(0, 15 + floatY, 70, 45); 
    fill('#2ECC71');
    beginShape();
    vertex(0, -10 + floatY);
    bezierVertex(-40, -45 + floatY, -20, -70 + floatY, 0, -40 + floatY);
    bezierVertex(20, -70 + floatY, 40, -45 + floatY, 0, -10 + floatY);
    endShape(CLOSE);
    
    fill('#1B4F72'); textSize(14); textStyle(BOLD);
    text("布袋蓮 (氣室葉柄)", 0, 70);

  } else if (qIdx === 1) {
    // 【第 2 題正解：新月/朔 (黑暗夜空)】
    fill('#1B4F72'); noStroke();
    rectMode(CENTER);
    rect(0, 0, w - 20, h - 20, 10);
    fill(255, 150 + sin(frameCount * 0.15) * 105);
    ellipse(-70, -40, 4); ellipse(65, -35, 5); ellipse(-50, 40, 4); ellipse(75, 30, 6);
    fill(40); stroke(100); strokeWeight(2);
    ellipse(0, -10, 75);
    fill(255); noStroke(); textSize(14); textStyle(BOLD);
    text("新月 (朔) - 夜空無亮光", 0, 55);

  } else if (qIdx === 2) {
    // 【第 3 題正解：串聯燈泡壞掉斷路 -> 不會亮】
    stroke('#7F8C8D'); strokeWeight(4); noFill();
    beginShape(); vertex(-80, 20); vertex(-80, -20); vertex(-25, -20); endShape();
    beginShape(); vertex(80, 20); vertex(80, -20); vertex(25, -20); endShape();
    fill(210); stroke(140);
    ellipse(0, -20, 35);
    stroke('#C0392B'); strokeWeight(3);
    line(-10, -30, 10, -10); line(10, -30, -10, -10);
    fill('#C0392B'); noStroke(); textSize(15); textStyle(BOLD);
    text("串聯斷路：燈泡不會亮！", 0, 45);

  } else if (qIdx === 3) {
    // 【第 4 題正解：大熊座/北斗七星】
    fill('#1B4F72'); noStroke();
    rectMode(CENTER);
    rect(0, 0, w - 20, h - 20, 10);
    let stars = [
      {x: -70, y: -25}, {x: -45, y: -15}, {x: -20, y: -10}, {x: 5, y: 10},
      {x: 30, y: 5}, {x: 50, y: -20}, {x: 70, y: -10}
    ];
    stroke('#F1C40F'); strokeWeight(2); noFill();
    beginShape();
    for (let s of stars) { vertex(s.x, s.y); }
    endShape();
    for (let s of stars) {
      fill(255); noStroke();
      ellipse(s.x, s.y, 7);
    }
    fill(255); textSize(13); textStyle(BOLD);
    text("大熊座 (北斗七星)", 0, 55);

  } else if (qIdx === 4) {
    // 【第 5 題正解：公克重 gw (彈簧測驗計)】
    fill(255); stroke(180); strokeWeight(2);
    rectMode(CENTER);
    rect(0, -35, 34, 65, 5);
    let stretch = sin(frameCount * 0.1) * 6;
    stroke('#E67E22'); strokeWeight(2); noFill();
    beginShape();
    for (let i = -20; i < 12 + stretch; i += 6) {
      vertex(-8, i); vertex(8, i + 3);
    }
    endShape();
    fill('#34495E'); noStroke();
    rect(0, 30 + stretch, 65, 26, 5);
    fill(255); textSize(13); textStyle(BOLD);
    text("gw (公克重)", 0, 30 + stretch);

  } else if (qIdx === 5) {
    // 【第 6 題正解：陰天 (雲量 ≥ 3/4)】
    fill('#85C1E9'); noStroke();
    rectMode(CENTER);
    rect(0, 0, w - 20, h - 20, 10);
    let cloudShift = sin(frameCount * 0.05) * 8;
    fill(220);
    ellipse(-35 + cloudShift, -20, 65, 45);
    ellipse(15 + cloudShift, -30, 75, 50);
    ellipse(5 + cloudShift, 5, 90, 50);
    fill(170);
    ellipse(-15 + cloudShift, 10, 70, 40);
    fill('#2C3E50'); textSize(15); textStyle(BOLD);
    text("陰天 (雲量 ≥ 3/4)", 0, 55);
  }
  pop();
}

// ==========================================
// 6. 事件處理 (右鍵擊破氣球與按鈕互動)
// ==========================================
function mousePressed() {
  if (gameState === 'QUIZ') {
    // 檢查是否點擊「滑鼠右鍵」
    if (mouseButton === RIGHT) {
      let q = quizData[currentQuestion];
      let balloonY = height * 0.74;
      let spacing = width / 5;
      let balloonSize = min(width * 0.1, 100);

      for (let i = 0; i < 4; i++) {
        let balloonX = spacing * (i + 1);
        let d = dist(mouseX, mouseY, balloonX, balloonY);

        // 點擊命中氣球
        if (d < balloonSize / 2) {
          userAnswers.push(i);
          if (i === q.correct) {
            score++;
          }

          // 停止當前語音
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }

          // 觸發氣球爆破粒子特效
          createPoppingEffect(balloonX, balloonY, balloonColors[i].main);

          // 前往下一題或進入交卷狀態
          if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
          } else {
            gameState = 'SUBMIT';
          }
          break;
        }
      }
    }
  } else if (gameState === 'SUBMIT') {
    // 交卷按鈕判定
    let btnW = 240;
    let btnH = 65;
    let btnX = width / 2;
    let btnY = height * 0.55;

    if (abs(mouseX - btnX) < btnW / 2 && abs(mouseY - btnY) < btnH / 2) {
      gameState = 'RESULT';
      if ((score / quizData.length) >= 0.8) {
        initConfetti();
      }
    }
  } else if (gameState === 'RESULT') {
    // 重測按鈕判定
    let btnW = 180;
    let btnH = 50;
    let btnX = width / 2;
    let btnY = height * 0.73;

    if (abs(mouseX - btnX) < btnW / 2 && abs(mouseY - btnY) < btnH / 2) {
      resetQuiz();
    }
  }
}

// 重新開始測驗
function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  lastSpokenQuestion = -1; // 重設語音追蹤
  confettiParticles = [];
  gameState = 'QUIZ';
}

// ==========================================
// 7. 粒子動畫系統 (爆破特效與歡慶彩帶)
// ==========================================

// ── 建立氣球爆破粒子 ──
function createPoppingEffect(x, y, colorHex) {
  for (let i = 0; i < 25; i++) {
    let angle = random(TWO_PI);
    let speed = random(3, 9);
    poppingBalloons.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(6, 14),
      color: colorHex,
      alpha: 255
    });
  }
}

// ── 更新與繪製氣球爆破粒子 ──
function updateAndDrawPoppingParticles() {
  for (let i = poppingBalloons.length - 1; i >= 0; i--) {
    let p = poppingBalloons[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 8;

    noStroke();
    let c = color(p.color);
    c.setAlpha(p.alpha);
    fill(c);
    ellipse(p.x, p.y, p.size);

    if (p.alpha <= 0) {
      poppingBalloons.splice(i, 1);
    }
  }
}

// ── 初始化彩帶飄落效果 (得分 > 80%) ──
function initConfetti() {
  confettiParticles = [];
  let colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      size: random(8, 16),
      color: random(colors),
      speedY: random(2, 6),
      speedX: random(-2, 2),
      rotation: random(TWO_PI),
      rotSpeed: random(-0.1, 0.1)
    });
  }
}

// ── 更新與繪製彩帶粒子 ──
function updateAndDrawConfetti() {
  for (let p of confettiParticles) {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotSpeed;

    if (p.y > height) {
      p.y = random(-50, -10);
      p.x = random(width);
    }

    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    fill(p.color);
    noStroke();
    rect(0, 0, p.size, p.size * 0.6);
    pop();
  }
}