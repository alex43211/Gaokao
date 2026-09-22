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
        <span class="pulse"></span>🤖
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
