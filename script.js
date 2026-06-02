const scenes = [...document.querySelectorAll(".scene")];
const sceneCounter = document.querySelector("#sceneCounter");
const sceneTransition = document.querySelector("#sceneTransition");
const backButton = document.querySelector("#backButton");
const backButtonImage = backButton.querySelector("img");
const nextButton = document.querySelector("#nextButton");
const petalLayer = document.querySelector(".petal-layer");
const statList = document.querySelector("#statList");
const npcLayer = document.querySelector("#npcLayer");
const memoryModal = document.querySelector("#memoryModal");
const closeModal = document.querySelector("#closeModal");
const modalTitle = document.querySelector("#modalTitle");
const modalEpisode = document.querySelector("#modalEpisode");
const saveMemory = document.querySelector("#saveMemory");
const memoryRate = document.querySelector("#memoryRate");
const memoryBar = document.querySelector("#memoryBar");
const currentGoalName = document.querySelector("#currentGoalName");
const achievementDeck = document.querySelector("#achievementDeck");
const awardButton = document.querySelector("#awardButton");
const stamp = document.querySelector("#stamp");
const toast = document.querySelector("#toast");
const canvas = document.querySelector("#confettiCanvas");
const ctx = canvas.getContext("2d");

const stats = [
  { name: "사회생활", from: 1, to: 87, bar: 87 },
  { name: "업무능력", from: 3, to: 82, bar: 82 },
  { name: "싹싹함", from: 80, to: 100, bar: 96 },
  { name: "리액션", from: 80, to: 200, bar: 100 },
  { name: "미모", from: 100, to: 100, bar: 100 },
  { name: "책상정리", from: 0, to: 0, bar: 0 },
];

const memories = [
  ["소현", "입사 첫날 어색한 공기 속에서도 밝게 인사하던 채연님의 시작 지점. 연구소 막내 퀘스트가 여기서 열렸습니다."],
  ["예찬", "작은 요청에도 빠르게 반응하고 마지막에는 꼭 양손 엄지척을 남기던 든든한 동료였습니다."],
  ["리나", "모르는 것을 그냥 넘기지 않고 묻고, 적고, 다시 해보던 순간들이 채연님의 레벨업 로그가 되었습니다."],
  ["소은", "회의 중 '와 너무 좋아요'가 등장하면 분위기가 부드러워졌습니다. 진심과 당황이 공존하는 전설의 리액션."],
  ["은주", "책상 위 아이템은 많았지만 필요한 자료는 신기하게 찾아냈습니다. 정리정돈은 Lv0, 탐색력은 Lv999."],
  ["은숙", "힘든 순간에도 웃으면서 다시 시도하던 끈기. 연구소 생존왕 칭호가 이 구간에서 획득되었습니다."],
  ["정헌", "점점 업무를 이해하고, 어느 순간에는 설명을 다시 해주는 사람이 되어 있었습니다. 막내의 성장 이벤트 완료."],
  ["하나", "누구에게나 싹싹하고 고맙다는 말을 아끼지 않던 태도는 연구소의 하루를 조금 더 환하게 만들었습니다."],
  ["영진", "730일의 여정을 모두 회수했습니다. 이제 채연님의 다음 챕터를 위한 최종 졸업식이 해금됩니다."],
];

const npcPositions = [
  [18, 70], [34, 58], [25, 38], [48, 66], [58, 42],
  [70, 56], [62, 24], [84, 31], [83, 68],
];

const achievements = [
  "싹싹함의 화신",
  "연구소 생존왕",
  "리액션 마스터",
  "맥시멀리스트",
  "영혼없는 와 너무 좋아요",
];

let activeMemoryIndex = 0;
let savedCount = 0;
let currentSceneIndex = 0;
let isSceneChanging = false;
let confettiPieces = [];
let confettiRunning = false;

function createPetals() {
  Array.from({ length: 38 }, (_, index) => {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${8 + Math.random() * 8}s`;
    petal.style.animationDelay = `${Math.random() * -10}s`;
    petal.style.setProperty("--drift", `${(Math.random() - .5) * 240}px`);
    petal.style.opacity = `${.35 + Math.random() * .55}`;
    petalLayer.append(petal);
  });
}

function renderStats() {
  statList.innerHTML = stats.map(({ name, from, to, bar }) => `
    <div class="stat-row">
      <strong>${name}</strong>
      <span>${from}점</span>
      <div class="stat-track"><i class="stat-fill" data-to="${bar}"></i></div>
      <span class="stat-target">${to}점</span>
    </div>
  `).join("");
}

function animateStats() {
  document.querySelectorAll(".stat-fill").forEach((bar, index) => {
    setTimeout(() => {
      bar.style.width = `${bar.dataset.to}%`;
    }, index * 160);
  });
}

function renderNpcs() {
  npcLayer.innerHTML = memories.map(([name], index) => {
    const [x, y] = npcPositions[index];
    const locked = index > savedCount;
    const current = index === savedCount;
    const finalNpc = index === memories.length - 1;
    return `
      <button class="npc ${locked ? "is-locked" : ""} ${current ? "is-current" : ""} ${finalNpc ? "is-final-npc" : ""}" style="--x:${x}%; --y:${y}%;" data-index="${index}" type="button" aria-label="${index + 1}. ${name} 추억 확인">
        <img src="assets/npc-default.png?v=20260602-1656" alt="">
        <span>${index + 1}. ${name}</span>
      </button>
    `;
  }).join("");
}

function updateQuest() {
  const percent = Math.round((savedCount / memories.length) * 100);
  memoryRate.textContent = `${percent}%`;
  memoryBar.style.width = `${percent}%`;
  currentGoalName.textContent = savedCount >= memories.length ? "졸업식장" : memories[savedCount][0];
  document.querySelectorAll(".npc").forEach((npc, index) => {
    npc.classList.toggle("is-locked", index > savedCount);
    npc.classList.toggle("is-current", index === savedCount);
    npc.classList.toggle("is-done", index < savedCount);
  });
}

function openMemory(index) {
  if (index > savedCount) {
    showToast("아직 잠겨 있는 추억입니다. 앞 NPC의 기억을 먼저 저장하세요.");
    return;
  }
  activeMemoryIndex = index;
  const [name, episode] = memories[index];
  const isFinalNpc = index === memories.length - 1;
  memoryModal.classList.toggle("is-final-memory", isFinalNpc);
  modalTitle.textContent = isFinalNpc ? "최종 졸업식 해금" : `${name}이 기억하는 채연`;
  modalEpisode.textContent = episode;
  saveMemory.textContent = index < savedCount ? "저장 완료" : isFinalNpc ? "졸업식 해금하기" : "기억 저장하기";
  saveMemory.disabled = index < savedCount;
  memoryModal.showModal();
}

function saveActiveMemory() {
  if (activeMemoryIndex === savedCount) {
    savedCount += 1;
    updateQuest();
    showToast(activeMemoryIndex === memories.length - 1 ? "최종 졸업식이 해금되었습니다." : `추억 조각 ${savedCount}/${memories.length} 저장 완료`);
    memoryModal.close();
    if (savedCount === memories.length) {
      showToast("성장 여정 회수 완료. 졸업식장으로 이동하세요.");
    }
  }
}

function renderAchievements() {
  achievementDeck.innerHTML = achievements.map(title => `
    <article class="achievement"><strong>${title}</strong></article>
  `).join("");
}

function unlockAchievements() {
  document.querySelectorAll(".achievement").forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("is-unlocked");
      showToast(`업적 획득: ${achievements[index]}`);
    }, index * 620);
  });
}

function updateNav() {
  backButton.classList.toggle("is-hidden", currentSceneIndex === 0);
  nextButton.classList.toggle("is-hidden", currentSceneIndex === scenes.length - 1);
  awardButton.classList.toggle("is-hidden", currentSceneIndex !== 6);
  if (currentSceneIndex === scenes.length - 1) {
    backButtonImage.src = "assets/first-button.png?v=20260602-1711";
    backButtonImage.alt = "처음으로";
    backButton.setAttribute("aria-label", "처음 화면으로 이동");
  } else {
    backButtonImage.src = "assets/back-button.png?v=20260602-1656";
    backButtonImage.alt = "이전";
    backButton.setAttribute("aria-label", "이전 장면으로 이동");
  }
  sceneCounter.textContent = `${currentSceneIndex + 1} / ${scenes.length}`;
}

function runSceneEffects(sceneNumber) {
  if (sceneNumber === 3) {
    animateStats();
  }

  if (sceneNumber === 6 && !achievementDeck.dataset.unlocked) {
    achievementDeck.dataset.unlocked = "true";
    unlockAchievements();
  }
}

function setActiveScene(nextIndex, direction = "next") {
  if (isSceneChanging || nextIndex < 0 || nextIndex >= scenes.length || nextIndex === currentSceneIndex) return;

  isSceneChanging = true;
  pressNav(direction);
  sceneTransition.classList.add("is-active");

  setTimeout(() => {
    scenes[currentSceneIndex].classList.remove("is-active");
    currentSceneIndex = nextIndex;
    scenes[currentSceneIndex].classList.add("is-active");
    updateNav();
    runSceneEffects(currentSceneIndex + 1);

    setTimeout(() => {
      sceneTransition.classList.remove("is-active");
      isSceneChanging = false;
    }, 130);
  }, 260);
}

function goNext() {
  if (currentSceneIndex >= scenes.length - 1) return;
  setActiveScene(currentSceneIndex + 1, "next");
}

function goBack() {
  if (currentSceneIndex === scenes.length - 1) {
    restartGame();
    return;
  }
  if (currentSceneIndex <= 0) return;
  setActiveScene(currentSceneIndex - 1, "back");
}

function pressNav(direction) {
  const button = direction === "back" ? backButton : nextButton;
  button.classList.add("is-pressed");
  setTimeout(() => button.classList.remove("is-pressed"), 160);
}

function restartGame() {
  if (isSceneChanging) return;
  isSceneChanging = true;
  pressNav("back");
  sceneTransition.classList.add("is-active");
  petalLayer.classList.add("is-bursting");

  setTimeout(() => {
    resetGameState();
    scenes[currentSceneIndex].classList.remove("is-active");
    currentSceneIndex = 0;
    scenes[currentSceneIndex].classList.add("is-active");
    updateNav();
    runSceneEffects(1);

    setTimeout(() => {
      sceneTransition.classList.remove("is-active");
      petalLayer.classList.remove("is-bursting");
      isSceneChanging = false;
    }, 360);
  }, 420);
}

function resetGameState() {
  activeMemoryIndex = 0;
  savedCount = 0;
  memoryModal.classList.remove("is-final-memory");
  memoryModal.close();
  stamp.classList.remove("is-stamped");
  achievementDeck.dataset.unlocked = "";
  document.querySelectorAll(".achievement").forEach(card => card.classList.remove("is-unlocked"));
  renderNpcs();
  updateQuest();
}

function setupCardFlip() {
  document.querySelectorAll(".dex-card").forEach(card => {
    card.addEventListener("click", () => card.classList.toggle("is-flipped"));
  });
}

function setupButtons() {
  nextButton.addEventListener("click", goNext);
  backButton.addEventListener("click", goBack);

  npcLayer.addEventListener("click", event => {
    const npc = event.target.closest(".npc");
    if (npc) openMemory(Number(npc.dataset.index));
  });

  closeModal.addEventListener("click", () => memoryModal.close());
  saveMemory.addEventListener("click", saveActiveMemory);

  awardButton.addEventListener("click", () => {
    stamp.classList.remove("is-stamped");
    stamp.offsetHeight;
    stamp.classList.add("is-stamped");
    burstConfetti();
    showToast("졸업장 수여 완료. 엔딩 크레딧이 열립니다.");
    setTimeout(() => setActiveScene(7, "next"), 1800);
  });

  window.addEventListener("keydown", event => {
    if (memoryModal.open) return;
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      goNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goBack();
    }
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, rect.width * window.devicePixelRatio);
  canvas.height = Math.max(1, rect.height * window.devicePixelRatio);
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function burstConfetti() {
  resizeCanvas();
  const colors = ["#ffb74d", "#fff3d6", "#8b6be8", "#ff6f91", "#7bd88f"];
  confettiPieces = Array.from({ length: 180 }, () => ({
    x: canvas.clientWidth / 2,
    y: canvas.clientHeight * .42,
    vx: (Math.random() - .5) * 11,
    vy: -Math.random() * 9 - 3,
    gravity: .18 + Math.random() * .09,
    size: 5 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    spin: (Math.random() - .5) * 18,
    life: 120 + Math.random() * 60,
  }));

  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(drawConfetti);
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  confettiPieces.forEach(piece => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += piece.gravity;
    piece.rotation += piece.spin;
    piece.life -= 1;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation * Math.PI / 180);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * .65);
    ctx.restore();
  });

  confettiPieces = confettiPieces.filter(piece => piece.life > 0 && piece.y < canvas.clientHeight + 40);

  if (confettiPieces.length) {
    requestAnimationFrame(drawConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }
}

function setupParallax() {
  window.addEventListener("pointermove", event => {
    const x = (event.clientX / window.innerWidth - .5) * 18;
    const y = (event.clientY / window.innerHeight - .5) * 12;
    const activeScene = scenes[currentSceneIndex];
    if (activeScene.classList.contains("scene-bg")) {
      activeScene.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    }
  }, { passive: true });
}

function bootGame() {
  scenes.forEach(scene => scene.classList.remove("is-active"));
  scenes[0].classList.add("is-active");
  updateNav();
  runSceneEffects(1);
}

window.addEventListener("resize", resizeCanvas);

createPetals();
renderStats();
renderNpcs();
renderAchievements();
updateQuest();
setupCardFlip();
setupButtons();
setupParallax();
bootGame();
