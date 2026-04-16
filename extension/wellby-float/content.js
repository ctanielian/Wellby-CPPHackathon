(function mountWellbyLauncher() {
  const CALMING_QUOTES = [
    "One steady step is enough for right now.",
    "You do not have to finish everything at once.",
    "A calmer pace can still be a strong pace.",
    "Small progress still counts as progress.",
    "Take the next task, not the whole week.",
    "Breathe first. Then choose one thing."
  ];

  const EXTENSION_THEME_TOKENS = {
    warm: {
      light: {
        panelBg: "rgba(255, 250, 244, 0.99)",
        panelBgSoft: "rgba(255, 255, 255, 0.78)",
        railBg: "rgba(255, 250, 244, 0.98)",
        text: "#4b3423",
        muted: "#8e7158",
        border: "#ddcdbd",
        borderSoft: "#eadccf",
        accent: "#8e7158",
        accentStrong: "#4b3423",
        accentText: "#fff7ee",
        shadow: "rgba(75, 52, 35, 0.14)"
      },
      dark: {
        panelBg: "rgba(24, 17, 13, 0.98)",
        panelBgSoft: "rgba(34, 24, 18, 0.9)",
        railBg: "rgba(24, 17, 13, 0.97)",
        text: "#ede4d6",
        muted: "#b5967e",
        border: "#5a3d2b",
        borderSoft: "#3d2b1f",
        accent: "#b5967e",
        accentStrong: "#b5967e",
        accentText: "#1a1210",
        shadow: "rgba(0, 0, 0, 0.28)"
      }
    },
    cool: {
      light: {
        panelBg: "rgba(248, 251, 255, 0.99)",
        panelBgSoft: "rgba(255, 255, 255, 0.8)",
        railBg: "rgba(248, 251, 255, 0.98)",
        text: "#1e3a5f",
        muted: "#5c84ad",
        border: "#c9d9ee",
        borderSoft: "#dce8f5",
        accent: "#3a6ea8",
        accentStrong: "#1e3a5f",
        accentText: "#f4f7fb",
        shadow: "rgba(30, 58, 95, 0.14)"
      },
      dark: {
        panelBg: "rgba(12, 26, 41, 0.98)",
        panelBgSoft: "rgba(20, 35, 56, 0.9)",
        railBg: "rgba(12, 26, 41, 0.97)",
        text: "#dde9f5",
        muted: "#7aaed4",
        border: "#2d5080",
        borderSoft: "#1e3a5f",
        accent: "#7aaed4",
        accentStrong: "#7aaed4",
        accentText: "#0d1b2a",
        shadow: "rgba(0, 0, 0, 0.28)"
      }
    },
    dark: {
      light: {
        panelBg: "rgba(247, 249, 251, 0.99)",
        panelBgSoft: "rgba(255, 255, 255, 0.8)",
        railBg: "rgba(247, 249, 251, 0.98)",
        text: "#1c2128",
        muted: "#6f8296",
        border: "#d0d8e0",
        borderSoft: "#dde4ea",
        accent: "#5a8a6a",
        accentStrong: "#1c2128",
        accentText: "#e8f4ec",
        shadow: "rgba(28, 33, 40, 0.14)"
      },
      dark: {
        panelBg: "rgba(13, 17, 23, 0.98)",
        panelBgSoft: "rgba(28, 33, 40, 0.9)",
        railBg: "rgba(13, 17, 23, 0.97)",
        text: "#c8d8e8",
        muted: "#7ab890",
        border: "#2d3748",
        borderSoft: "#1c2128",
        accent: "#7ab890",
        accentStrong: "#7ab890",
        accentText: "#0d1117",
        shadow: "rgba(0, 0, 0, 0.3)"
      }
    },
    pastel: {
      light: {
        panelBg: "rgba(250, 247, 255, 0.99)",
        panelBgSoft: "rgba(255, 255, 255, 0.8)",
        railBg: "rgba(250, 247, 255, 0.98)",
        text: "#3a2860",
        muted: "#7b6ba8",
        border: "#ddd6f0",
        borderSoft: "#e8e1f5",
        accent: "#7b6ba8",
        accentStrong: "#4a3870",
        accentText: "#ede8f8",
        shadow: "rgba(74, 56, 112, 0.14)"
      },
      dark: {
        panelBg: "rgba(15, 13, 24, 0.98)",
        panelBgSoft: "rgba(26, 21, 48, 0.9)",
        railBg: "rgba(15, 13, 24, 0.97)",
        text: "#ede8f8",
        muted: "#9a8ac0",
        border: "#2a2040",
        borderSoft: "#1a1530",
        accent: "#9a8ac0",
        accentStrong: "#9a8ac0",
        accentText: "#0f0d18",
        shadow: "rgba(0, 0, 0, 0.28)"
      }
    }
  };

  if (window.top !== window.self) {
    return;
  }

  const isWellbyPage =
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.port === "3000";

  if (isWellbyPage) {
    let lastDeliveredMoodAt = 0;
    let lastTaskValue = "";
    let lastTaskListValue = "[]";
    let lastPlannerTaskValue = "[]";

    function syncThemeFromStorage() {
      const nextTheme = String(window.localStorage.getItem("wellby-theme") || "warm");
      const nextMode = String(window.localStorage.getItem("wellby-mode") || "light");

      chrome.storage.local.set({
        wellbyExtensionTheme: nextTheme,
        wellbyExtensionMode: nextMode
      });
    }

    function deliverCheckInSync(moodScore, stressLevel, intent, updatedAt) {
      const nextUpdatedAt = Number(updatedAt) || Date.now();
      if (nextUpdatedAt <= lastDeliveredMoodAt) {
        return;
      }

      lastDeliveredMoodAt = nextUpdatedAt;
      window.localStorage.setItem(
        "wellbyExtensionCheckIn",
        JSON.stringify({
          moodScore: Number(moodScore),
          stressLevel: Number(stressLevel),
          intent: intent ?? "open",
          updatedAt: nextUpdatedAt
        })
      );

      window.postMessage(
        {
          source: "wellby-extension",
          type: "MOOD_SYNC",
          moodScore: Number(moodScore),
          stressLevel: Number(stressLevel),
          intent: intent ?? "open",
          updatedAt: nextUpdatedAt
        },
        window.location.origin
      );
    }

    function syncStoredMood() {
      chrome.storage.local
        .get([
          "wellbyExtensionMoodScore",
          "wellbyExtensionStressLevel",
          "wellbyExtensionIntent",
          "wellbyExtensionUpdatedAt"
        ])
        .then((stored) => {
          if (
            !Number.isFinite(Number(stored.wellbyExtensionMoodScore)) &&
            !Number.isFinite(Number(stored.wellbyExtensionStressLevel))
          ) {
            return;
          }

          deliverCheckInSync(
            stored.wellbyExtensionMoodScore,
            stored.wellbyExtensionStressLevel,
            stored.wellbyExtensionIntent,
            stored.wellbyExtensionUpdatedAt
          );
        });
    }

    function syncCurrentTaskFromStorage() {
      const nextTaskValue = String(window.localStorage.getItem("wellbyCurrentTask") || "");
      if (nextTaskValue !== lastTaskValue) {
        lastTaskValue = nextTaskValue;
        chrome.storage.local.set({
          wellbyCurrentTask: nextTaskValue
        });
      }

      const nextTaskListValue = String(window.localStorage.getItem("wellbyActiveTasks") || "[]");
      if (nextTaskListValue === lastTaskListValue) {
        return;
      }

      lastTaskListValue = nextTaskListValue;

      try {
        const parsedTasks = JSON.parse(nextTaskListValue);
        chrome.storage.local.set({
          wellbyActiveTasks: Array.isArray(parsedTasks) ? parsedTasks : []
        });
      } catch {
        chrome.storage.local.set({
          wellbyActiveTasks: []
        });
      }

      const nextPlannerTaskValue = String(window.localStorage.getItem("wellbyPlannerTasks") || "[]");
      if (nextPlannerTaskValue === lastPlannerTaskValue) {
        return;
      }

      lastPlannerTaskValue = nextPlannerTaskValue;

      try {
        const parsedPlannerTasks = JSON.parse(nextPlannerTaskValue);
        chrome.storage.local.set({
          wellbyPlannerTasks: Array.isArray(parsedPlannerTasks) ? parsedPlannerTasks : []
        });
      } catch {
        chrome.storage.local.set({
          wellbyPlannerTasks: []
        });
      }
    }

    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin || event.data?.source !== "wellby-app") {
        return;
      }

      if (event.data?.type === "SETTINGS_SYNC") {
        chrome.storage.local.set({
          wellbyPromptIntervalMinutes: Number(event.data.extensionPromptInterval) || 5,
          wellbyExtensionTheme: String(event.data.theme || "warm"),
          wellbyExtensionMode: String(event.data.mode || "light")
        });
        return;
      }

      if (event.data?.type === "TASK_SYNC") {
        chrome.storage.local.set({
          wellbyCurrentTask: String(event.data.currentTask || ""),
          wellbyActiveTasks: Array.isArray(event.data.activeTasks) ? event.data.activeTasks : [],
          wellbyPlannerTasks: Array.isArray(event.data.plannerTasks) ? event.data.plannerTasks : []
        });
      }
    });

    window.addEventListener("focus", syncStoredMood);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        syncStoredMood();
        syncCurrentTaskFromStorage();
        syncThemeFromStorage();
      }
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type !== "SET_WELLBY_CHECKIN") {
        return false;
      }

      deliverCheckInSync(message.moodScore, message.stressLevel, message.intent, message.updatedAt);
      sendResponse({ ok: true });
      return false;
    });

    syncStoredMood();
    syncCurrentTaskFromStorage();
    syncThemeFromStorage();
    window.setInterval(syncCurrentTaskFromStorage, 750);
    window.setInterval(syncThemeFromStorage, 1500);
    return;
  }

  if (document.getElementById("wellby-floating-launcher")) {
    return;
  }

  const host = document.createElement("div");
  host.id = "wellby-floating-launcher";

  const railButton = document.createElement("button");
  railButton.type = "button";
  railButton.className = "wellby-rail-button";
  railButton.setAttribute("aria-label", "Open Wellby mood check");
  railButton.title = "Wellby mood check";

  const leafIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  leafIcon.setAttribute("viewBox", "0 0 24 24");
  leafIcon.setAttribute("width", "20");
  leafIcon.setAttribute("height", "20");
  leafIcon.setAttribute("aria-hidden", "true");
  leafIcon.classList.add("wellby-launcher-leaf");

  const leafCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  leafCircle.setAttribute("cx", "12");
  leafCircle.setAttribute("cy", "12");
  leafCircle.setAttribute("r", "11");
  leafCircle.setAttribute("fill", "var(--wellby-ext-accent)");

  const leafPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  leafPath.setAttribute(
    "d",
    "M12 3 C16 5.5,18.5 8,18 12 C17.5 16,15 18,12 18 C9 18,6.5 16,6 12 C5.5 8,8 5.5,12 3Z"
  );
  leafPath.setAttribute("fill", "var(--wellby-ext-accent-text)");

  leafIcon.appendChild(leafCircle);
  leafIcon.appendChild(leafPath);

  const text = document.createElement("span");
  text.className = "wellby-launcher-text";
  text.textContent = "Wellby";

  railButton.appendChild(leafIcon);
  railButton.appendChild(text);

  const panel = document.createElement("div");
  panel.className = "wellby-mood-panel";
  panel.hidden = true;

  const panelHeader = document.createElement("div");
  panelHeader.className = "wellby-panel-header";

  const panelTitle = document.createElement("div");
  panelTitle.className = "wellby-panel-title";
  panelTitle.textContent = "Quick mood + stress check";

  const headerActions = document.createElement("div");
  headerActions.className = "wellby-header-actions";

  const dragHint = document.createElement("button");
  dragHint.type = "button";
  dragHint.className = "wellby-drag-handle";
  dragHint.textContent = "Drag";

  const viewToggle = document.createElement("button");
  viewToggle.type = "button";
  viewToggle.className = "wellby-view-toggle";
  viewToggle.textContent = "Tasks only";

  headerActions.appendChild(viewToggle);
  headerActions.appendChild(dragHint);
  panelHeader.appendChild(panelTitle);
  panelHeader.appendChild(headerActions);

  const panelBody = document.createElement("div");
  panelBody.className = "wellby-panel-body";
  panelBody.textContent = "Share both so Wellby can keep your app check-in in sync.";

  const taskLine = document.createElement("div");
  taskLine.className = "wellby-task-line";

  const taskLabel = document.createElement("span");
  taskLabel.className = "wellby-task-label";
  taskLabel.textContent = "Current task:";

  const taskValue = document.createElement("span");
  taskValue.className = "wellby-task-value";
  taskValue.textContent = "No active task";

  taskLine.appendChild(taskLabel);
  taskLine.appendChild(taskValue);

  const taskPanel = document.createElement("div");
  taskPanel.className = "wellby-task-panel";

  const taskPanelLabel = document.createElement("div");
  taskPanelLabel.className = "wellby-task-panel-label";
  taskPanelLabel.textContent = "Planner tasks";

  const taskList = document.createElement("div");
  taskList.className = "wellby-task-list";

  const quote = document.createElement("div");
  quote.className = "wellby-quote";

  taskPanel.appendChild(taskPanelLabel);
  taskPanel.appendChild(taskList);
  taskPanel.appendChild(quote);

  const moodSection = document.createElement("section");
  moodSection.className = "wellby-check-section";

  const moodHeader = document.createElement("div");
  moodHeader.className = "wellby-check-header";

  const moodTitleWrap = document.createElement("div");
  const moodLabel = document.createElement("div");
  moodLabel.className = "wellby-section-label";
  moodLabel.textContent = "Mood";
  const moodHint = document.createElement("div");
  moodHint.className = "wellby-section-hint";
  moodHint.textContent = "1 = low mood, 5 = feeling great";
  moodTitleWrap.appendChild(moodLabel);
  moodTitleWrap.appendChild(moodHint);

  const moodToggle = document.createElement("button");
  moodToggle.type = "button";
  moodToggle.className = "wellby-section-toggle";
  moodToggle.hidden = true;
  moodToggle.textContent = "Change";

  moodHeader.appendChild(moodTitleWrap);
  moodHeader.appendChild(moodToggle);

  const moodSummary = document.createElement("div");
  moodSummary.className = "wellby-section-summary";
  moodSummary.hidden = true;

  const moodRow = document.createElement("div");
  moodRow.className = "wellby-mood-row";

  moodSection.appendChild(moodHeader);
  moodSection.appendChild(moodSummary);
  moodSection.appendChild(moodRow);

  const stressSection = document.createElement("section");
  stressSection.className = "wellby-check-section";

  const stressHeader = document.createElement("div");
  stressHeader.className = "wellby-check-header";

  const stressTitleWrap = document.createElement("div");
  const stressLabel = document.createElement("div");
  stressLabel.className = "wellby-section-label";
  stressLabel.textContent = "Stress";
  const stressHint = document.createElement("div");
  stressHint.className = "wellby-section-hint";
  stressHint.textContent = "1 = calm, 5 = overloaded";
  stressTitleWrap.appendChild(stressLabel);
  stressTitleWrap.appendChild(stressHint);

  const stressToggle = document.createElement("button");
  stressToggle.type = "button";
  stressToggle.className = "wellby-section-toggle";
  stressToggle.hidden = true;
  stressToggle.textContent = "Change";

  stressHeader.appendChild(stressTitleWrap);
  stressHeader.appendChild(stressToggle);

  const stressSummary = document.createElement("div");
  stressSummary.className = "wellby-section-summary";
  stressSummary.hidden = true;

  const stressRow = document.createElement("div");
  stressRow.className = "wellby-mood-row";

  stressSection.appendChild(stressHeader);
  stressSection.appendChild(stressSummary);
  stressSection.appendChild(stressRow);

  const feedback = document.createElement("div");
  feedback.className = "wellby-feedback";
  feedback.hidden = true;

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "wellby-action-button";
  actionButton.hidden = true;
  actionButton.textContent = "Open Wellby";

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.className = "wellby-dismiss-button";
  dismissButton.hidden = true;
  dismissButton.textContent = "Close";

  const actionRow = document.createElement("div");
  actionRow.className = "wellby-action-row";
  actionRow.hidden = true;

  let selectedMoodScore = 3;
  let selectedStressLevel = 3;
  let selectedIntent = "open";
  let promptTimerId = null;
  let promptIntervalMinutes = 5;
  let currentTheme = "warm";
  let currentMode = "light";
  let moodAnswered = false;
  let stressAnswered = false;
  let moodCollapsed = false;
  let stressCollapsed = false;
  let dragState = null;
  let suppressNextRailClick = false;
  let checkInHidden = false;

  function updateTaskValue(nextTask) {
    const trimmedTask = String(nextTask || "").trim();
    taskValue.textContent = trimmedTask || "No active task";
    taskValue.title = trimmedTask || "No active task";
  }

  function formatTaskTime(isoValue) {
    if (!isoValue) {
      return "";
    }

    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function updateTaskList(tasks) {
    taskList.replaceChildren();

    const normalizedTasks = Array.isArray(tasks) ? tasks : [];

    if (!normalizedTasks.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "wellby-task-empty";
      emptyState.textContent = "No active tasks yet.";
      taskList.appendChild(emptyState);
      return;
    }

    normalizedTasks.forEach((task, index) => {
      const item = document.createElement("div");
      item.className = "wellby-task-item";
      const title = typeof task === "string" ? task : String(task?.title || "").trim();
      const dueAt = typeof task === "object" ? task?.dueAt : null;
      const completedAt = typeof task === "object" ? task?.completedAt : null;
      const overdue = dueAt && !completedAt && new Date(dueAt).getTime() < Date.now();

      item.classList.toggle("is-complete", Boolean(completedAt));
      item.classList.toggle("is-overdue", Boolean(overdue));
      item.title = title;

      const titleLine = document.createElement("div");
      titleLine.className = "wellby-task-item-title";
      titleLine.textContent = `${index + 1}. ${title}`;

      const metaLine = document.createElement("div");
      metaLine.className = "wellby-task-item-meta";
      metaLine.textContent = completedAt
        ? `Completed ${formatTaskTime(completedAt)}`
        : dueAt
          ? `${overdue ? "Overdue since" : "Due"} ${formatTaskTime(dueAt)}`
          : "No due date";

      item.appendChild(titleLine);
      item.appendChild(metaLine);
      taskList.appendChild(item);
    });
  }

  function updateQuote() {
    const nextQuote = CALMING_QUOTES[Math.floor(Math.random() * CALMING_QUOTES.length)];
    quote.textContent = `"${nextQuote}"`;
  }

  function resolveThemeTokens(theme, mode) {
    const themeConfig = EXTENSION_THEME_TOKENS[theme] || EXTENSION_THEME_TOKENS.warm;
    return themeConfig[mode] || themeConfig.light || EXTENSION_THEME_TOKENS.warm.light;
  }

  function applyTheme(theme, mode) {
    currentTheme = theme || "warm";
    currentMode = mode || "light";
    const tokens = resolveThemeTokens(currentTheme, currentMode);

    host.style.setProperty("--wellby-ext-panel-bg", tokens.panelBg);
    host.style.setProperty("--wellby-ext-panel-bg-soft", tokens.panelBgSoft);
    host.style.setProperty("--wellby-ext-rail-bg", tokens.railBg);
    host.style.setProperty("--wellby-ext-text", tokens.text);
    host.style.setProperty("--wellby-ext-muted", tokens.muted);
    host.style.setProperty("--wellby-ext-border", tokens.border);
    host.style.setProperty("--wellby-ext-border-soft", tokens.borderSoft);
    host.style.setProperty("--wellby-ext-accent", tokens.accent);
    host.style.setProperty("--wellby-ext-accent-strong", tokens.accentStrong);
    host.style.setProperty("--wellby-ext-accent-text", tokens.accentText);
    host.style.setProperty("--wellby-ext-shadow", tokens.shadow);
  }

  function closePanel() {
    panel.hidden = true;
    host.classList.remove("is-open");
  }

  function openPanel() {
    panel.hidden = false;
    host.classList.add("is-open");
    updateQuote();
  }

  function clampPosition(left, top) {
    const panelRect = host.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - panelRect.width - 8);
    const maxTop = Math.max(8, window.innerHeight - panelRect.height - 8);
    return {
      left: Math.min(Math.max(8, left), maxLeft),
      top: Math.min(Math.max(8, top), maxTop)
    };
  }

  function applyLauncherPosition(position) {
    if (!position || !Number.isFinite(position.left) || !Number.isFinite(position.top)) {
      host.style.left = "";
      host.style.top = "";
      host.style.right = "10px";
      host.style.transform = "translateY(-50%)";
      return;
    }

    const next = clampPosition(position.left, position.top);
    host.style.right = "auto";
    host.style.left = `${next.left}px`;
    host.style.top = `${next.top}px`;
    host.style.transform = "none";
  }

  function persistLauncherPosition(left, top) {
    chrome.storage.local.set({
      wellbyLauncherPosition: {
        left: Math.round(left),
        top: Math.round(top)
      }
    });
  }

  function startDragging(event) {
    event.preventDefault();
    const rect = host.getBoundingClientRect();
    applyLauncherPosition({ left: rect.left, top: rect.top });
    dragState = {
      source: event.currentTarget === railButton ? "rail" : "panel",
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
  }

  function handlePointerMove(event) {
    if (!dragState) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(deltaX, deltaY) > 5) {
      dragState.moved = true;
      host.classList.add("is-dragging");
    }

    if (!dragState.moved) {
      return;
    }

    const next = clampPosition(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
    host.style.left = `${next.left}px`;
    host.style.top = `${next.top}px`;
    host.style.right = "auto";
    host.style.transform = "none";
  }

  function handlePointerUp() {
    if (!dragState) {
      return;
    }

    if (dragState.moved) {
      const rect = host.getBoundingClientRect();
      persistLauncherPosition(rect.left, rect.top);
      if (dragState.source === "rail") {
        suppressNextRailClick = true;
        window.setTimeout(() => {
          suppressNextRailClick = false;
        }, 0);
      }
    }

    host.classList.remove("is-dragging");
    dragState = null;
  }

  function resetPromptTimer() {
    if (promptTimerId) {
      window.clearTimeout(promptTimerId);
    }

    promptTimerId = window.setTimeout(() => {
      openPanel();
      resetPromptTimer();
    }, promptIntervalMinutes * 60 * 1000);
  }

  function applyPromptInterval(nextIntervalMinutes) {
    promptIntervalMinutes = Math.max(1, Number(nextIntervalMinutes) || 5);
    resetPromptTimer();
  }

  function setFeedback() {
    if (checkInHidden) {
      feedback.hidden = true;
      actionRow.hidden = true;
      actionButton.hidden = true;
      dismissButton.hidden = true;
      return;
    }

    feedback.hidden = false;
    actionRow.hidden = false;
    actionButton.hidden = false;
    dismissButton.hidden = false;

    if (selectedStressLevel >= 4) {
      feedback.textContent = "We recommend taking a break.";
      actionButton.textContent = "Take a Wellby break";
      selectedIntent = "break";
      return;
    }

    if (selectedStressLevel === 3 || selectedMoodScore <= 2) {
      feedback.textContent = "A short reset might help if this keeps building.";
      actionButton.textContent = "Open Wellby";
      selectedIntent = "check-in";
      return;
    }

    feedback.textContent = "You seem steady. Keep going if things still feel manageable.";
    actionButton.textContent = "Open Wellby";
    selectedIntent = "open";
  }

  function updateSectionState() {
    panelTitle.textContent = checkInHidden ? "Planner snapshot" : "Quick mood + stress check";
    panelBody.textContent = checkInHidden
      ? "Your synced Wellby planner stays here while you browse."
      : "Share both so Wellby can keep your app check-in in sync.";
    viewToggle.textContent = checkInHidden ? "Show check-in" : "Tasks only";
    moodSection.hidden = checkInHidden;
    stressSection.hidden = checkInHidden;

    moodSummary.hidden = !(moodAnswered && moodCollapsed);
    moodRow.hidden = moodAnswered && moodCollapsed;
    moodHint.hidden = moodAnswered && moodCollapsed;
    moodToggle.hidden = !moodAnswered;
    moodToggle.textContent = moodCollapsed ? "Edit" : "Hide";
    moodSummary.textContent = `Mood saved: ${selectedMoodScore}/5`;
    moodSection.classList.toggle("is-collapsed", moodAnswered && moodCollapsed);

    stressSummary.hidden = !(stressAnswered && stressCollapsed);
    stressRow.hidden = stressAnswered && stressCollapsed;
    stressHint.hidden = stressAnswered && stressCollapsed;
    stressToggle.hidden = !stressAnswered;
    stressToggle.textContent = stressCollapsed ? "Edit" : "Hide";
    stressSummary.textContent = `Stress saved: ${selectedStressLevel}/5`;
    stressSection.classList.toggle("is-collapsed", stressAnswered && stressCollapsed);
    setFeedback();
  }

  function createScaleButton(level, row, applySelection, title, onAnswered) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wellby-mood-option";
    button.textContent = String(level);
    button.title = title;

    if (level === 3) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => {
      row.querySelectorAll(".wellby-mood-option").forEach((buttonElement) => {
        buttonElement.classList.remove("is-selected");
      });
      button.classList.add("is-selected");
      applySelection(level);
      onAnswered();
      setFeedback();
      updateSectionState();
      chrome.runtime.sendMessage({
        type: "SYNC_WELLBY_CHECKIN",
        moodScore: selectedMoodScore,
        stressLevel: selectedStressLevel,
        intent: selectedIntent
      });
    });

    return button;
  }

  [1, 2, 3, 4, 5].forEach((level) => {
    moodRow.appendChild(
      createScaleButton(
        level,
        moodRow,
        (selectedLevel) => {
          selectedMoodScore = selectedLevel;
        },
        `Mood level ${level}`,
        () => {
          moodAnswered = true;
          moodCollapsed = true;
        }
      )
    );

    stressRow.appendChild(
      createScaleButton(
        level,
        stressRow,
        (selectedLevel) => {
          selectedStressLevel = selectedLevel;
        },
        `Stress level ${level}`,
        () => {
          stressAnswered = true;
          stressCollapsed = true;
        }
      )
    );
  });

  setFeedback();
  updateSectionState();

  moodToggle.addEventListener("click", () => {
    moodCollapsed = !moodCollapsed;
    updateSectionState();
  });

  stressToggle.addEventListener("click", () => {
    stressCollapsed = !stressCollapsed;
    updateSectionState();
  });

  viewToggle.addEventListener("click", () => {
    checkInHidden = !checkInHidden;
    chrome.storage.local.set({ wellbyHideCheckIn: checkInHidden });
    updateSectionState();
  });

  railButton.addEventListener("click", () => {
    if (suppressNextRailClick) {
      suppressNextRailClick = false;
      return;
    }

    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  actionButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "OPEN_WELLBY",
      moodScore: selectedMoodScore,
      stressLevel: selectedStressLevel,
      intent: selectedIntent
    });
  });

  dismissButton.addEventListener("click", () => {
    closePanel();
    resetPromptTimer();
  });

  dragHint.addEventListener("pointerdown", startDragging);
  railButton.addEventListener("pointerdown", startDragging);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  document.addEventListener("click", (event) => {
    if (!host.contains(event.target)) {
      closePanel();
    }
  });

  chrome.storage.local
    .get([
      "wellbyPromptIntervalMinutes",
      "wellbyCurrentTask",
      "wellbyPlannerTasks",
      "wellbyExtensionTheme",
      "wellbyExtensionMode",
      "wellbyLauncherPosition",
      "wellbyHideCheckIn"
    ])
    .then((stored) => {
      applyPromptInterval(stored.wellbyPromptIntervalMinutes);
      updateTaskValue(stored.wellbyCurrentTask);
      updateTaskList(stored.wellbyPlannerTasks);
      applyTheme(stored.wellbyExtensionTheme, stored.wellbyExtensionMode);
      applyLauncherPosition(stored.wellbyLauncherPosition);
      checkInHidden = Boolean(stored.wellbyHideCheckIn);
      updateQuote();
      updateSectionState();
    });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    if (changes.wellbyPromptIntervalMinutes) {
      applyPromptInterval(changes.wellbyPromptIntervalMinutes.newValue);
    }

    if (changes.wellbyCurrentTask) {
      updateTaskValue(changes.wellbyCurrentTask.newValue);
    }

    if (changes.wellbyPlannerTasks) {
      updateTaskList(changes.wellbyPlannerTasks.newValue);
    }

    if (changes.wellbyExtensionTheme || changes.wellbyExtensionMode) {
      applyTheme(
        changes.wellbyExtensionTheme ? changes.wellbyExtensionTheme.newValue : currentTheme,
        changes.wellbyExtensionMode ? changes.wellbyExtensionMode.newValue : currentMode
      );
    }

    if (changes.wellbyLauncherPosition) {
      applyLauncherPosition(changes.wellbyLauncherPosition.newValue);
    }

    if (changes.wellbyHideCheckIn) {
      checkInHidden = Boolean(changes.wellbyHideCheckIn.newValue);
      updateSectionState();
    }
  });

  panel.appendChild(panelHeader);
  panel.appendChild(panelBody);
  panel.appendChild(taskLine);
  panel.appendChild(taskPanel);
  panel.appendChild(moodSection);
  panel.appendChild(stressSection);
  panel.appendChild(feedback);
  actionRow.appendChild(actionButton);
  actionRow.appendChild(dismissButton);
  panel.appendChild(actionRow);
  host.appendChild(railButton);
  host.appendChild(panel);
  document.documentElement.appendChild(host);
})();
