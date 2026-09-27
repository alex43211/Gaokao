/* ============================================================
   小艾助手 · 聊天浮窗组件（注入所有页面）
   使用 window.XIAOAI.reply() 本地引擎回复（1.0 演示）
   ============================================================ */
(function () {
  function initChat() {
    if (document.getElementById("xiaoai-root")) return;
    const host = document.createElement("div");
    host.id = "xiaoai-root";
    host.innerHTML = `
      <button class="chat-fab" id="xiaoai-fab" title="问小艾 · 高考志愿助手" aria-label="打开小艾助手">
        <span class="pulse"></span>
        <svg class="fab-cat" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M12 15 L8 5 L17 11 Z" fill="#fff"/>
          <path d="M36 15 L40 5 L31 11 Z" fill="#fff"/>
          <path d="M12 15 L9.5 8.5 L15.5 12 Z" fill="#ffb08a"/>
          <path d="M36 15 L38.5 8.5 L32.5 12 Z" fill="#ffb08a"/>
          <ellipse cx="24" cy="26" rx="14" ry="12.5" fill="#fff"/>
          <ellipse cx="19" cy="24.5" rx="2.1" ry="2.6" fill="#3a2418"/>
          <ellipse cx="29" cy="24.5" rx="2.1" ry="2.6" fill="#3a2418"/>
          <ellipse cx="19.6" cy="23.6" rx=".75" ry=".85" fill="#fff"/>
          <ellipse cx="29.6" cy="23.6" rx=".75" ry=".85" fill="#fff"/>
          <path d="M24 28.5 l-1.7 1.7 a2.4 2.4 0 0 0 3.4 0 Z" fill="#ff8f9c"/>
          <path d="M24 30.5 v1.6 M24 32.1 q-2.6 2.2 -4.6 .4 M24 32.1 q2.6 2.2 4.6 .4"
                fill="none" stroke="#3a2418" stroke-width="1.15" stroke-linecap="round"/>
          <path d="M8.5 24.5 h-4 M8.5 28.5 h-3.5 M39.5 24.5 h4 M39.5 28.5 h3.5"
                fill="none" stroke="#ffd9c6" stroke-width="1.1" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="chat-panel" id="xiaoai-panel">
        <div class="chat-head">
          <div class="chat-avatar">👩‍🎓</div>
          <div>
            <div class="nm">小艾 · 志愿规划助手</div>
            <div class="st"><span class="dot"></span> 在线 · 张雪峰式思维内核</div>
          </div>
          <button class="chat-close" id="xiaoai-close" title="关闭">✕</button>
        </div>
        <div class="chat-body" id="xiaoai-body"></div>
        <div class="chat-quick" id="xiaoai-quick"></div>
        <div class="chat-input">
          <input id="xiaoai-input" placeholder="输入问题，如：计算机专业怎么样？" maxlength="200">
          <button id="xiaoai-send" title="发送">➤</button>
        </div>
      </div>`;
    document.body.appendChild(host);

    const fab = host.querySelector("#xiaoai-fab");
    const panel = host.querySelector("#xiaoai-panel");
    const close = host.querySelector("#xiaoai-close");
    const body = host.querySelector("#xiaoai-body");
    const input = host.querySelector("#xiaoai-input");
    const send = host.querySelector("#xiaoai-send");
    const quickBox = host.querySelector("#xiaoai-quick");

    let firstOpen = true;
    function open() { panel.classList.add("open"); fab.style.display = "none"; setTimeout(() => input.focus(), 80); }
    function closePanel() { panel.classList.remove("open"); fab.style.display = "grid"; }
    fab.addEventListener("click", () => { open(); if (firstOpen) { firstOpen = false; pushBot(OPENERS[0], true); } });
    close.addEventListener("click", closePanel);

    function pushBot(text, instant) {
      const d = document.createElement("div");
      d.className = "chat-msg bot";
      const who = document.createElement("div");
      who.className = "who"; who.textContent = "小艾";
      d.appendChild(who);
      body.appendChild(d);
      if (instant) {
        d.innerHTML = esc(text).replace(/\n/g, "<br>");
      } else {
        const ty = document.createElement("span");
        ty.className = "typing";
        ty.innerHTML = "<i></i><i></i><i></i>";
        d.appendChild(ty);
        setTimeout(() => {
          ty.remove();
          d.innerHTML = esc(text).replace(/\n/g, "<br>");
          body.scrollTop = body.scrollHeight;
        }, 550 + Math.random() * 500);
      }
      body.scrollTop = body.scrollHeight;
    }
    function pushUser(text) {
      const d = document.createElement("div");
      d.className = "chat-msg user";
      const who = document.createElement("div");
      who.className = "who"; who.textContent = "我";
      d.appendChild(who);
      d.appendChild(document.createTextNode(text));
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function ask(text) {
      text = String(text || "").trim();
      if (!text) return;
      pushUser(text);
      input.value = "";
      const reply = (window.XIAOAI && window.XIAOAI.reply) ? window.XIAOAI.reply(text) : "小艾暂时走神了，稍后再试～";
      pushBot(reply);
    }
    send.addEventListener("click", () => ask(input.value));
    input.addEventListener("keydown", e => { if (e.key === "Enter") ask(input.value); });

    // 快捷按钮
    const qs = (window.XIAOAI && window.XIAOAI.quicks) || [];
    qs.forEach(q => {
      const b = document.createElement("button");
      b.textContent = q;
      b.addEventListener("click", () => ask(q));
      quickBox.appendChild(b);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initChat);
  else initChat();
})();
