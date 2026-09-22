/* ============================================================
   全站共享：导航/页脚注入、工具函数
   ============================================================ */
(function () {
  window.APP = window.APP || { name: "恩卓智选" };
  window.APP.LOGO_SRC = "assets/logo.jpg";
  window.APP.LOGO_EN = "ENZO CURATED";
  const NAV = [
    { id: "home",    label: "首页",        href: "index.html" },
    { id: "map",     label: "全国地图",    href: "map.html" },
    { id: "majors",  label: "专业百科",    href: "majors.html" },
    { id: "plan",    label: "AI 志愿填报", href: "plan.html" },
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
            <span class="badge-demo">数据演示版 v1.1</span>
            <a href="plan.html" class="btn btn-brand btn-sm">立即模拟填报</a>
          </div>
        </div>
      </div>`;
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
              <a href="plan.html">AI 志愿模拟填报</a>
              <a href="index.html#how">志愿方法论</a>
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
              <a href="index.html#about">项目说明</a>
              <a href="report.html?demo=1">可视化报告样例</a>
              <span style="font-size:12px;color:#6c7aa6">智能助手 · 小艾<br>7×24 在线答疑</span>
            </div>
          </div>
          <!-- ===== 咨询与赞赏 ===== -->
          <div class="foot-tip">
            <div class="foot-tip-copy">
              <h4>💛 支持我们 · 一对一志愿咨询</h4>
              <p>本站的高校地图、专业百科、AI 模拟填报与可视化报告<b style="color:#cdd6ee">全部免费开放</b>，不设会员、不锁功能。
              如果它帮你少走了一点弯路，欢迎扫码请我们喝杯咖啡；
              若需要针对自家孩子的分数与家庭情况做一对一方案诊断，也请通过下方二维码联系。</p>
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
            恩卓智选 ENZO CURATED · 高考志愿智能规划平台 · v1.1（演示原型）<br>
            本站所示分数线 / 招生计划 / 就业数据均为<b>模拟演示数据</b>，仅用于产品功能展示，不代表任何官方口径，请以各省教育考试院与高校招生章程为准。
          </div>
        </div>
      </footer>`;

    /* 收款码点击放大（点空白处 / Esc 关闭） */
    if (f) {
      const openLightbox = (src, cap) => {
        let lb = document.getElementById("qrLightbox");
        if (!lb) {
          lb = document.createElement("div");
          lb.id = "qrLightbox";
          lb.className = "qr-lightbox";
          lb.innerHTML = '<div><img id="qrLightboxImg" src="" alt="收款码"><div class="cap" id="qrLightboxCap"></div></div>';
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
      f.querySelectorAll(".foot-qr").forEach(btn => {
        btn.addEventListener("click", () => openLightbox(btn.dataset.qr, btn.dataset.cap));
      });
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
