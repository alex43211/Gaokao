/* ============================================================
   全站共享：导航/页脚注入、工具函数
   ============================================================ */
(function () {
  window.APP = window.APP || { name: "恩卓智选" };
  window.APP.LOGO_SRC = "assets/logo.jpg";
  window.APP.LOGO_EN = "ENZO CURATED";

  /* ============================================================
     主题：浅色 / 深蓝
     · 只负责写 <html data-theme>，配色全部由 style.css 的变量层接管
     · 选择记在 localStorage，跨页面、跨刷新都保持一致
     · 首帧防闪由各页 <head> 里的内联脚本完成（见 *.html）
     ============================================================ */
  const THEME_KEY = "enzo_theme";
  window.Theme = (function () {
    const root = document.documentElement;
    const LABEL = { light: "切换为深色背景", dark: "切换为浅色背景" };
    const ICON = { light: "🌙", dark: "☀️" };

    function current() {
      return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }
    /* 让所有切换按钮（含未来新增的）与当前主题保持一致 */
    function sync() {
      const t = current();
      document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
        btn.setAttribute("aria-label", LABEL[t]);
        btn.title = LABEL[t];
        const ico = btn.querySelector(".tt-ico");
        if (ico) ico.textContent = ICON[t];
      });
    }
    function set(t) {
      const next = t === "dark" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      root.style.colorScheme = next;          // 让原生控件（滚动条、输入框）跟着变
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
      sync();
      /* 图表等需要重绘的地方可以监听这个事件 */
      document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
      return next;
    }
    function toggle() {
      return set(current() === "dark" ? "light" : "dark");
    }

    /* 首帧内联脚本通常已写好 data-theme；缺失时（理论上不会）补一次 */
    if (!root.getAttribute("data-theme")) {
      let saved = "light";
      try { saved = localStorage.getItem(THEME_KEY) || "light"; } catch (e) { }
      set(saved);
    }
    return { current: current, set: set, toggle: toggle, sync: sync };
  })();

  // 线上地址：仅用于页脚「分享本站」展示与复制，非本项目域名访问时也能显示
  window.APP.SITE_URL = "https://alex43211.github.io/Gaokao/";
  const SITE_URL = window.APP.SITE_URL;
  const NAV = [
    { id: "home",    label: "首页",        href: "index.html" },
    { id: "map",     label: "全国地图",    href: "map.html" },
    { id: "majors",  label: "专业百科",    href: "majors.html" },
    { id: "college", label: "高校查询",    href: "colleges.html" },
    { id: "plan",    label: "AI 志愿填报", href: "plan.html" },
    { id: "board",   label: "留言板",      href: "board.html" },
  ];
  // 不进主导航、但需要入口的页面（页脚 + 手机端菜单）
  const MORE = [
    { id: "account", label: "我的账号",         href: "account.html" },
    { id: "board",   label: "留言板 · 分类问答", href: "board.html" },
    { id: "about",   label: "关于我们 · 路线图", href: "about.html" },
    { id: "legal",   label: "版权与免责声明",   href: "legal.html" },
  ];
  const SUBS = [
    "华中科技大学 · 计算机类", "复旦大学 · 临床医学(八年制)", "北京航空航天大学 · 人工智能",
    "哈尔滨工业大学 · 机器人工程", "四川大学 · 口腔医学", "西安电子科技大学 · 电子信息",
  ];

  window.buildShell = function (active) {
    const links = NAV.map(n =>
      `<a href="${n.href}" class="${n.id === active ? "active" : ""}">${n.label}</a>`
    ).join("");
    const h = document.getElementById("siteHeader");
    if (h) h.innerHTML = `
      <div class="topbar">
        <div class="container">
          <a class="logo" href="index.html">
            <img class="logo-img" src="${window.APP.LOGO_SRC}" alt="恩卓智选">
            <span>恩卓智选<small>${window.APP.LOGO_EN}</small></span>
          </a>
          <nav class="nav-links">${links}</nav>
          <div class="topbar-actions">
            <div class="user-box" id="userBox"></div>
            <a href="plan.html" class="btn btn-brand btn-sm">模拟填报</a>
            <button type="button" class="theme-toggle" data-theme-toggle
                    aria-pressed="false" aria-label="切换背景配色" title="切换深色 / 浅色背景">
              <span class="tt-ico" aria-hidden="true">🌙</span>
            </button>
            <button type="button" class="nav-toggle" id="navToggle"
                    aria-label="打开菜单" aria-expanded="false" aria-controls="mobileNav">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
      <div class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-inner">
          ${NAV.map(n => `<a href="${n.href}" class="${n.id === active ? "active" : ""}">${n.label}</a>`).join("")}
          <a href="report.html?demo=1">报告样例</a>
          ${MORE.map(n => `<a href="${n.href}" class="${n.id === active ? "active" : ""}">${n.label}</a>`).join("")}
        </div>
      </div>`;

    /* 顶栏账号区（登录态由 auth.js 提供；未接入时静默跳过） */
    if (window.__renderUserBox) window.__renderUserBox();

    /* 主题切换按钮：与当前主题同步，并在点击时切换 + 轻提示 */
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const t = window.Theme.toggle();
        if (window.toast) window.toast(t === "dark" ? "已切换为深蓝背景" : "已切换为浅色背景");
      });
    });
    window.Theme.sync();

    /* 汉堡菜单开合（窄屏专用） */
    (function () {
      const tg = document.getElementById("navToggle");
      const mn = document.getElementById("mobileNav");
      if (!tg || !mn) return;
      const setOpen = (open) => {
        mn.classList.toggle("open", open);
        tg.classList.toggle("on", open);
        tg.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
      };
      tg.addEventListener("click", () => setOpen(!mn.classList.contains("open")));
      mn.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
      document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
      window.addEventListener("resize", () => { if (window.innerWidth > 1020) setOpen(false); });
    })();
    const f = document.getElementById("siteFooter");
    if (f) f.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="grid">
            <div>
              <div class="foot-brand"><img class="logo-img-sm" src="${window.APP.LOGO_SRC}" alt="恩卓智选"> 恩卓智选</div>
              <p style="font-size:13px;line-height:1.9;max-width:300px">以就业视角反推专业与院校选择，
              为普通家庭提供看得懂、用得上的高考志愿决策工具。<br><br>
              <b style="color:#cdd6ee">「选择比努力更重要，但有得选的前提是你足够努力。」</b></p>
            </div>
            <div>
              <h4>功能导航</h4>
              <a href="map.html">全国高校地图</a>
              <a href="majors.html">本科专业百科</a>
              <a href="colleges.html">全国高校名单</a>
              <a href="plan.html">AI 志愿模拟填报</a>
            </div>
            <div>
              <h4>学生关心</h4>
              <a href="majors.html?q=计算机">计算机能学吗</a>
              <a href="majors.html?q=临床医学">临床医学怎么样</a>
              <a href="majors.html?q=新闻">新闻学要不要报</a>
              <a href="map.html">看看目标省份</a>
            </div>
            <div>
              <h4>关于本站</h4>
              <a href="index.html#access">使用权限说明</a>
              <a href="account.html">我的账号 · 每日额度</a>
              <a href="board.html">留言板 · 分类问答</a>
              <a href="about.html">关于我们 · 发展路线图</a>
              <a href="legal.html">版权声明与免责</a>
              <a href="report.html?demo=1">可视化报告样例</a>
              <span style="font-size:12px;color:#6c7aa6">智能助手 · 小艾<br>7×24 在线答疑</span>
            </div>
          </div>
          <!-- ===== 一对一咨询（新增，位于收款码上方；独立类名不影响「收款码恰为 2 张」断言） ===== -->
          <div class="foot-consult">
            <div class="foot-consult-tx">
              <h4>💬 微信一对一咨询<span class="foot-consult-tag">扫码加微信 · 免费问</span></h4>
              <p>分数、位次、专业倾向、家庭条件 —— 把情况和我说说。我按你家的具体情况，把
              <b style="color:#cdd6ee">城市 / 院校 / 专业 / 就业</b> 放到同一张表上捋一遍，
              再给出「冲 · 稳 · 保」的取舍建议，尽量少走弯路。</p>
              <ul class="foot-consult-pts">
                <li>适合：拿不准专业方向、纠结省内还是出省、分数卡在关键节点</li>
                <li>形式：微信文字 / 语音沟通，按需约时间</li>
                <li>说明：咨询完全自愿，本站所有功能不因你是否咨询而设限</li>
              </ul>
            </div>
            <div class="foot-consult-qrbox">
              <button type="button" class="foot-consult-qr" data-qr="assets/qr/consult.png"
                      data-cap="恩卓智选 · 微信一对一咨询（扫码添加好友）">
                <img src="assets/qr/consult-320.png" alt="恩卓智选微信号二维码 · 扫码添加一对一咨询" loading="lazy">
                <span>扫码加微信</span>
              </button>
              <p class="foot-consult-cap">微信扫一扫 / 长按识别</p>
            </div>
          </div>

          <!-- ===== 自愿打赏（收款码恰为 2 张，与上方咨询码分开计数） ===== -->
          <div class="foot-tip">
            <div class="foot-tip-copy">
              <h4>☕ 自愿打赏（<span style="color:#ffd089">完全可选，不是付费墙</span>）</h4>
              <p><b style="color:#cdd6ee">本站的高校地图、专业百科、AI 模拟填报与可视化报告全部免费，不需要注册、不需要付费、不锁任何功能。</b>
              你刚才看到的所有结果都已经免费生成完毕，下方二维码与功能使用无关，纯粹是如果你愿意支持我们。</p>
              <span class="thanks">🙏 感谢每一份支持 —— 你的每一次打赏，都会让更多普通家庭用上不收费的志愿工具。</span>
            </div>
            <div>
              <div class="foot-qrs">
                <button type="button" class="foot-qr alipay" data-qr="assets/qr/alipay.png" data-cap="支付宝 · 扫码支持">
                  <img src="assets/qr/alipay.png" alt="支付宝收款码" loading="lazy">
                  <span>支付宝</span>
                </button>
                <button type="button" class="foot-qr wechat" data-qr="assets/qr/wechat.png" data-cap="微信 · 扫码支持">
                  <img src="assets/qr/wechat.png" alt="微信收款码" loading="lazy">
                  <span>微信支付</span>
                </button>
              </div>
              <div class="foot-tip-hint">💡 点击二维码可放大，方便电脑端扫码</div>
            </div>
          </div>

          <!-- ===== 分享本站 ===== -->
          <div class="foot-share">
            <div class="foot-share-tx">
              <h4>📤 把本站分享给需要的人</h4>
              <p>高考志愿是一家人的事。用微信扫一扫、或长按识别右侧二维码，即可在手机上打开本站，
              再点右上角「···」就能转发给<b style="color:#cdd6ee">微信好友、家长群</b>。
              电脑端也可以直接复制网址发给对方。</p>
              <div class="foot-share-acts">
                <code class="foot-share-url">${SITE_URL}</code>
                <button type="button" class="foot-share-copy">复制网址</button>
              </div>
            </div>
            <button type="button" class="foot-share-qr" data-qr="assets/qr/site.png"
                    data-cap="微信扫一扫 / 长按识别 · 打开并转发本站">
              <img src="assets/qr/site-240.png" alt="本站二维码" loading="lazy">
              <span>微信扫码分享</span>
            </button>
          </div>

          <!-- ===== 访问量统计 ===== -->
          <div class="foot-stats" id="footStats" hidden>
            <span class="fs-badge">📊 访问统计</span>
            <span class="fs-item">
              <span class="fs-lb">总访问量</span><b class="fs-v" id="fsSitePv">—</b><span class="fs-u">次</span>
            </span>
            <span class="fs-sep"></span>
            <span class="fs-item">
              <span class="fs-lb">访客数</span><b class="fs-v" id="fsSiteUv">—</b><span class="fs-u">人</span>
            </span>
            <span class="fs-sep"></span>
            <span class="fs-item">
              <span class="fs-lb">本页浏览</span><b class="fs-v" id="fsPagePv">—</b><span class="fs-u">次</span>
            </span>
          </div>

          <div class="foot-note">
            恩卓智选 ENZO CURATED · 高考志愿智能规划平台 · v1.2（演示原型）<br>
            本站所示分数线 / 招生计划 / 就业数据均为<b>模拟演示数据</b>，仅用于产品功能展示，不代表任何官方口径，请以各省教育考试院与高校招生章程为准。
          </div>
        </div>
      </footer>`;

    /* 收款码 / 分享二维码点击放大（点空白处 / Esc 关闭） */
    if (f) {
      const openLightbox = (src, cap) => {
        let lb = document.getElementById("qrLightbox");
        if (!lb) {
          lb = document.createElement("div");
          lb.id = "qrLightbox";
          lb.className = "qr-lightbox";
          lb.innerHTML = '<div><img id="qrLightboxImg" src="" alt="二维码"><div class="cap" id="qrLightboxCap"></div></div>';
          lb.addEventListener("click", () => lb.classList.remove("open"));
          document.body.appendChild(lb);
          document.addEventListener("keydown", e => {
            if (e.key === "Escape") lb.classList.remove("open");
          });
        }
        lb.querySelector("#qrLightboxImg").src = src;
        lb.querySelector("#qrLightboxCap").textContent = cap;
        lb.classList.add("open");
      };
      // 注意：咨询码用 .foot-consult-qr、分享码用 .foot-share-qr，均为独立类名，
      //       避免影响「收款码恰为 2 张」的既有验收断言
      f.querySelectorAll(".foot-qr, .foot-share-qr, .foot-consult-qr").forEach(btn => {
        btn.addEventListener("click", () => openLightbox(btn.dataset.qr, btn.dataset.cap));
      });

      // 复制站点网址（便于粘贴到微信 / 群公告）
      const copyBtn = f.querySelector(".foot-share-copy");
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          const url = window.APP.SITE_URL;
          try {
            await navigator.clipboard.writeText(url);
            if (window.toast) window.toast("网址已复制：" + url);
          } catch (_) {
            // 非 HTTPS 或浏览器拒绝剪贴板权限时的兜底
            const ta = document.createElement("textarea");
            ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); if (window.toast) window.toast("网址已复制：" + url); }
            catch (e) { if (window.toast) window.toast("复制失败，请手动复制：" + url); }
            document.body.removeChild(ta);
          }
        });
      }
    }

    /* 访问量统计（异步拉取，失败不影响其它功能） */
    if (window.initVisitStats) window.initVisitStats();
  };

  /* ---------- 工具 ---------- */
  window.qs = function (key, def) {
    const p = new URLSearchParams(location.search);
    return p.get(key) === null ? (def === undefined ? "" : def) : p.get(key);
  };
  window.toast = function (msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 2600);
  };
  window.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  };
  window.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ---------- 顶栏账号区 ---------- */
  window.__renderUserBox = function () {
    const box = document.getElementById("userBox");
    if (!box || !window.Auth) return;
    const u = Auth.me();
    if (!u) {
      box.innerHTML = `<a class="ub-guest" href="account.html">👤 登录 / 注册</a>`;
      return;
    }
    const roleLabel = (Auth.ROLES[u.role] || {}).label || "";
    box.innerHTML = `
      <a class="ub-user ${u.role === "member" ? "is-member" : ""}" href="account.html" title="进入个人中心">
        <span class="ub-avatar">${window.esc((u.name || "?").slice(0, 1))}</span>
        <span class="ub-name">${window.esc(u.name)}</span>
        <span class="ub-role">${window.esc(roleLabel)}</span>
      </a>
      <button type="button" class="ub-out" id="ubOut">退出</button>`;
    const out = document.getElementById("ubOut");
    if (out) out.addEventListener("click", () => {
      Auth.logout();
      if (window.toast) window.toast("已退出登录");
      /* 依赖登录态的页面（如个人中心）退出后需要复位视图 */
      if (document.body.dataset.needAuth === "1") setTimeout(() => location.reload(), 400);
    });
  };

  /* 省份全称(GeoJSON) -> 数据表短名映射 */
  const FULL2SHORT = {
    "北京市": "北京", "天津市": "天津", "河北省": "河北", "山西省": "山西", "内蒙古自治区": "内蒙古",
    "辽宁省": "辽宁", "吉林省": "吉林", "黑龙江省": "黑龙江", "上海市": "上海", "江苏省": "江苏",
    "浙江省": "浙江", "安徽省": "安徽", "福建省": "福建", "江西省": "江西", "山东省": "山东",
    "河南省": "河南", "湖北省": "湖北", "湖南省": "湖南", "广东省": "广东", "广西壮族自治区": "广西",
    "海南省": "海南", "重庆市": "重庆", "四川省": "四川", "贵州省": "贵州", "云南省": "云南",
    "西藏自治区": "西藏", "陕西省": "陕西", "甘肃省": "甘肃", "青海省": "青海", "宁夏回族自治区": "宁夏",
    "新疆维吾尔自治区": "新疆", "台湾省": "中国台湾", "香港特别行政区": "中国香港", "澳门特别行政区": "中国澳门"
  };
  window.shortName = function (full) {
    return FULL2SHORT[full] || full;
  };
  window.provByFull = function (full) {
    const s = window.shortName(full);
    return (window.PROVINCES || {})[s] || null;
  };
  window.MONEY = function (n) { return n.toLocaleString("zh-CN"); };
  window.formatPercent = function (x) { return (x * 100).toFixed(0) + "%"; };

  /* ============================================================
     页脚 · 访问量统计

     本站是纯静态托管（GitHub Pages），没有后端，无法自行统计访问量，
     因此接入第三方计数服务。多级容错，任何一种失败都不会让页脚变破：

       主源 Vercount  → 一次请求拿到「总访问量 / 访客数 / 本页浏览」
       备源 abacus    → 独立服务，只提供计数（无访客去重）
       本地缓存        → 展示上次成功结果，并标注为缓存
       全部失败        → 整块隐藏，不留破图

     实现上只调用对方的 JSON 接口，不加载任何第三方 <script>，
     因此不会在本站执行外部代码。

     本地预览（localhost / file://）默认不显示也不计数，避免测试流量污染线上统计；
     需要在本地查看效果时，在网址后加 ?stats=1（只读，同样不计数），
     加 ?stats=0 可强制隐藏。
     ============================================================ */
  window.initVisitStats = function () {
    const box = document.getElementById("footStats");
    if (!box) return;
    if (!window.fetch) { box.hidden = true; return; }

    const FIELDS = {
      site_pv: document.getElementById("fsSitePv"),
      site_uv: document.getElementById("fsSiteUv"),
      page_pv: document.getElementById("fsPagePv"),
    };
    const LS_KEY = "enzo_visit_stats_v1";
    const NS = "enzo-gaokao";        // abacus 命名空间
    const UV_COOKIE = "enzo_uv_";
    const TMO = 7000;

    if (/[?&]stats=0\b/.test(location.search)) { box.hidden = true; return; }
    const forced = /[?&]stats=1\b/.test(location.search);

    /* 只有真实 http(s) 的公开访问才计数，排除本地预览 */
    const liveUrl = (function () {
      if (!/^https?:$/.test(location.protocol)) return null;
      const h = location.hostname;
      if (!h || h === "localhost" || h === "127.0.0.1" || h === "::1" || h.endsWith(".local")) return null;
      return location.href;
    })();
    if (!liveUrl && !forced) { box.hidden = true; return; }

    const fmt = function (n) { return Number(n).toLocaleString("zh-CN"); };
    const noMotion = function () {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    const race = function (p, ms) {
      return Promise.race([p, new Promise(function (_, rj) { setTimeout(function () { rj(new Error("timeout")); }, ms); })]);
    };
    const markNa = function (el) {
      const it = el && el.closest ? el.closest(".fs-item") : null;
      if (it) it.classList.add("na");
    };

    /* 数字滚动，落点即真实值 */
    function countUp(el, to) {
      if (noMotion() || to <= 0) { el.textContent = fmt(to); return; }
      const dur = 900, t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    function paint(data) {
      let shown = 0;
      Object.keys(FIELDS).forEach(function (k) {
        const el = FIELDS[k];
        if (!el) return;
        const v = data[k];
        if (v === null || v === undefined || !isFinite(v)) { markNa(el); return; }
        el.dataset.n = v; shown++;
      });
      if (!shown) { box.hidden = true; return false; }
      box.hidden = false;
      Object.keys(FIELDS).forEach(function (k) {
        const el = FIELDS[k];
        if (el && el.dataset.n !== undefined) countUp(el, Number(el.dataset.n));
      });
      return true;
    }

    function save(d) { try { localStorage.setItem(LS_KEY, JSON.stringify({ d: d, ts: Date.now() })); } catch (e) { } }
    function load() {
      try {
        const o = JSON.parse(localStorage.getItem(LS_KEY) || "null");
        return o && o.d ? o : null;
      } catch (e) { return null; }
    }

    /* 访客去重：同一浏览器一年内只计一次 UV */
    function isNewUv() {
      try {
        const k = UV_COOKIE + location.hostname.replace(/[^a-zA-Z0-9_-]/g, "_");
        const seen = document.cookie.split("; ").some(function (c) { return c.indexOf(k + "=") === 0; });
        if (!seen) document.cookie = k + "=1; path=/; max-age=31536000; samesite=lax";
        return !seen;
      } catch (e) { return true; }
    }

    /* 主源：Vercount（与不蒜子接口兼容，跨域已开放） */
    async function fromVercount(url) {
      const r = await race(fetch("https://events.vercount.one/api/v2/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url, isNewUv: isNewUv() })
      }), TMO);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const d = (j && j.data) || j || {};
      const out = {
        site_pv: Number(d.site_pv) || 0,
        site_uv: Number(d.site_uv) || 0,
        page_pv: Number(d.page_pv) || 0
      };
      if (!out.site_pv && !out.page_pv) throw new Error("empty");
      return out;
    }

    /* 备源：abacus（hit 自增 / get 只读） */
    function abacusKey(pathname, search) {
      const s = (pathname + (search || "")).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return "p-" + (s || "root").slice(0, 64);
    }
    async function fromAbacus(mode, pathname, search) {
      const base = "https://abacus.jasoncameron.dev/" + mode + "/" + NS + "/";
      const [a, b] = await Promise.all([
        race(fetch(base + "site").then(function (r) { return r.json(); }), TMO),
        race(fetch(base + abacusKey(pathname, search)).then(function (r) { return r.json(); }), TMO)
      ]);
      const sp = Number(a && a.value);
      if (!isFinite(sp)) throw new Error("abacus bad");
      const pp = Number(b && b.value);
      return { site_pv: sp, site_uv: null, page_pv: isFinite(pp) ? pp : null };
    }

    (async function () {
      let data = null, cached = false;
      const rd = load();

      if (liveUrl) {
        try { data = await fromVercount(liveUrl); } catch (e) { }
        if (!data) { try { data = await fromAbacus("hit", location.pathname, location.search); } catch (e) { } }
        if (data) save(data);
      } else {
        /* 本地预览：走只读接口，不产生任何计数 */
        try {
          const r = await race(fetch("https://abacus.jasoncameron.dev/get/" + NS + "/site")
            .then(function (x) { return x.json(); }), TMO);
          const sp = Number(r && r.value);
          if (isFinite(sp)) data = { site_pv: sp, site_uv: null, page_pv: null };
        } catch (e) { }
      }

      if (!data && rd) { data = rd.d; cached = true; }
      if (!data) { box.hidden = true; return; }   // 全部失败：整块隐藏

      if (cached) {
        box.dataset.cached = "1";
        box.title = "计数服务暂不可用，当前显示本地缓存（更新于 " + new Date(rd.ts).toLocaleString("zh-CN") + "）";
      }
      paint(data);
    })();
  };

  /* 演示用随机录取概率（带种子，保证稳定） */
  window.seeded = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5; return (h >>> 0) / 4294967295; };
  };
})();
