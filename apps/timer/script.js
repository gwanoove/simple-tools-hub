const canvas = document.getElementById("progressCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const STUDY_TIME = 50 * 60; // 50분
const BREAK_TIME = 10 * 60; // 10분
const studyLogs = [];
const center = canvas.width / 2;
const radius = center - 10;

let totalSeconds = STUDY_TIME;
let remainingSeconds = totalSeconds;
let interval = null;
let mode = "study";
let isPaused = false;
let currentStudyMinutes = 50;

drawProgress();

/* 공부 시작 */
function startStudy() {
  if (interval) return; // 이미 실행 중이면 무시

  isPaused = false;
  pauseBtn.innerText = "일시정지";
  startInterval(); // ✅ 타이머 시작
}

function handleStart() {
  if (interval) return;

  if (mode === "study") {
    startStudy();
  } else if (mode === "break") {
    startBreak();
  }
}

function startBreak() {
  isPaused = false;
  pauseBtn.innerText = "일시정지";
  startInterval();
}

/* 일시정지 / 다시시작 토글 */
function togglePause() {
  if (!interval && !isPaused) return; // 아직 시작 안 했을 때

  if (isPaused) {
    // ▶️ 다시 시작
    startInterval();
    pauseBtn.innerText = "일시정지";
    isPaused = false;
  } else {
    // ⏸ 일시정지
    clearInterval(interval);
    interval = null;
    pauseBtn.innerText = "다시 시작";
    isPaused = true;
  }
}

function finishStudySession() {
  const now = new Date();

  studyLogs.push({
    time: now.toLocaleTimeString(),
    duration: currentStudyMinutes,
    memo: "공부",
    isEditing: false
  });

  renderLogs();
}

function renderLogs() {
  const list = document.getElementById("logList");
  list.innerHTML = "";

  studyLogs.forEach((log, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "6px";
    li.style.marginBottom = "10px";

    const info = document.createElement("span");
    info.textContent = `${index + 1}회차 · ${log.duration}분`;
    info.style.fontWeight = "600";

    li.appendChild(info);

    if (!log.isEditing) {
      // 🔒 보기 모드
      const text = document.createElement("span");
      text.textContent = log.memo;
      text.style.flex = "1";

      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.style.fontSize = "12px";

      editBtn.onclick = () => {
        log.isEditing = true;
        renderLogs();
      };

      li.appendChild(text);
      li.appendChild(editBtn);

    } else {
      // ✏️ 수정 모드
      const input = document.createElement("input");
      input.type = "text";
      input.value = log.memo;
      input.style.flex = "1";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "저장";
      saveBtn.style.fontSize = "12px";

      saveBtn.onclick = () => {
        log.memo = input.value.trim() || "공부";
        log.isEditing = false;
        renderLogs();
      };

      li.appendChild(input);
      li.appendChild(saveBtn);
    }

    list.appendChild(li);
  });
}


function generateShareText() {
  let text = "";
  let total = 0;

  studyLogs.forEach((log, i) => {
    text += `${i + 1}. ${log.duration}분 · ${log.memo} (${log.time})\n`;
    total += log.duration;
  });

  text += `\n총 공부 시간: ${total}분`;
  return text;
}

function shareToday() {
  const text = generateShareText();

  if (navigator.share) {
    navigator.share({
      title: "📚 오늘의 공부 기록",
      text: text
    });
  } else {
    alert("이 브라우저에서는 공유 기능이 지원되지 않습니다.");
  }
}

function startInterval() {
  interval = setInterval(() => {
    remainingSeconds--;
    drawProgress();

    if (remainingSeconds <= 0) {
      clearInterval(interval);
      interval = null;
      isPaused = false;
      pauseBtn.innerText = "일시정지";

      if (mode === "study") {
        finishStudySession();
        mode = "break";
        totalSeconds = BREAK_TIME;
        remainingSeconds = totalSeconds;
        
        startBtn.innerText = "휴식 시작";
        alert(`${currentStudyMinutes}분 공부완료! 휴식 시작 버튼을 눌러주세요`);
      } else {
        mode = "study";
        totalSeconds = currentStudyMinutes * 60;
        remainingSeconds = totalSeconds;
        
        startBtn.innerText = "공부 시작";
        alert("휴식 종료! 다시 공부하세요");
      }

      drawProgress();
    }
  }, 1000);
}

function setCustomMinutes(minutes) {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  isPaused = false;
  pauseBtn.innerText = "일시정지";

  mode = "study";
  currentStudyMinutes = minutes;
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;

  drawProgress();
}

function onWheelChange() {
  const select = document.getElementById("minuteWheel");
  const minutes = Number(select.value);
  setCustomMinutes(minutes);
}

function enterEditMode(index, li) {
  const log = studyLogs[index];
  li.innerHTML = "";

  // 고정 텍스트 (시간은 수정 불가)
  const fixedText = document.createElement("span");
  fixedText.textContent = `${log.duration}분 공부 · `;
  fixedText.style.fontWeight = "600";

  // 공부 내용 입력
  const memoInput = document.createElement("input");
  memoInput.type = "text";
  memoInput.placeholder = "무슨 공부를 했나요?";
  memoInput.value = log.memo;
  memoInput.style.marginLeft = "4px";

  // 저장 버튼
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "저장";
  saveBtn.style.marginLeft = "6px";
  saveBtn.style.fontSize = "12px";

  saveBtn.onclick = () => {
    log.memo = memoInput.value.trim();
    renderLogs();
  };

  li.appendChild(fixedText);
  li.appendChild(memoInput);
  li.appendChild(saveBtn);
}

function drawProgress() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const progress = remainingSeconds / totalSeconds;
  const angle = progress * 2 * Math.PI;

  const center = canvas.width / 2;
  const radius = center - 10;

  // 배경 원
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 10;
  ctx.stroke();

  // 진행 바
  ctx.beginPath();
  ctx.arc(
    center,
    center,
    radius,
    -Math.PI / 2,
    -Math.PI / 2 + angle
  );
  ctx.strokeStyle = "#1f3c88";
  ctx.lineWidth = 10;
  ctx.stroke();

  // 시간 표시
  const min = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const sec = String(remainingSeconds % 60).padStart(2, "0");
  document.getElementById("timeText").innerText = `${min}:${sec}`;
}