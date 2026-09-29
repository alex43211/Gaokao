/* ============================================================
   恩卓智选 · 账号与权限模块（纯前端体验版）

   ⚠️ 重要说明（务必保留此注释）
   本模块是「前端体验版」，完全运行在访客自己的浏览器里，**没有任何后端服务器**：
     · 账号、会话、每日额度、收藏的方案全部只存在本机 localStorage；
     · 换浏览器 / 换设备 / 清缓存后数据即消失，无法找回；
     · 密码不以明文保存，仅保存「随机盐 + PBKDF2-SHA256 摘要」，
       但因为没有服务端校验，**防御强度远低于真实账号系统**，
       页面上必须提示用户「不要使用你常用的真实密码」。

   之所以先这样做，是因为当前站点托管在 GitHub Pages 这类纯静态空间上，
   没有可运行的服务端。等接入真实后端后，本模块的对外接口
   （register / login / logout / quota / consume / plans）可原样保留，
   只需把内部实现换成 fetch 调用即可，页面代码无需改动。

   角色与额度
     guest  游客     每日 2 次模拟填报，最多保留 1 份方案，可浏览不可发帖
     user   注册用户  每日 10 次模拟填报，最多保留 20 份方案，可发帖
     member 会员     不限次数、不限份数，可发帖
   ============================================================ */
(function () {
  "use strict";

  var K_ACC = "enzo_accounts_v1";   // { v, users:[], session, sessionTs }
  var K_QUOTA = "enzo_quota_v1";    // { date, used:{ uid|guest: n } }
  var K_PLANS = "enzo_plans_v1";    // { uid: [plan, ...] }
  var BOARD_K = "enzo_board_v1";    // [post, ...]（留言板，见 board.js）

  var ROLES = {
    guest: { key: "guest", label: "游客", color: "gray", dailyPlan: 2, maxPlans: 1, canPost: false },
    user: { key: "user", label: "注册用户", color: "green", dailyPlan: 10, maxPlans: 20, canPost: true },
    member: { key: "member", label: "会员", color: "gold", dailyPlan: Infinity, maxPlans: Infinity, canPost: true }
  };

  var DEMO_NOTICE = "本账号系统为「纯前端体验版」：数据只保存在你当前这台设备的浏览器里，没有服务器，换设备或清缓存即丢失。请勿填写你常用的真实密码。";

  /* ---------- localStorage 安全读写（隐私模式 / 被禁用时降级到内存） ---------- */
  var LS = (function () {
    try {
      localStorage.setItem("__enzo_t", "1");
      localStorage.removeItem("__enzo_t");
      return localStorage;
    } catch (e) { return null; }
  })();
  var MEM = {};
  var memWarned = false;

  function read(k, def) {
    if (!LS) return (k in MEM) ? MEM[k] : def;
    try {
      var s = LS.getItem(k);
      return s === null ? def : JSON.parse(s);
    } catch (e) { return def; }
  }
  function write(k, v) {
    if (!LS) { MEM[k] = v; return true; }
    try { LS.setItem(k, JSON.stringify(v)); return true; }
    catch (e) {
      MEM[k] = v;
      if (!memWarned) { memWarned = true; if (window.toast) window.toast("本机浏览器存储不可用，数据仅保留在本次会话中"); }
      return false;
    }
  }

  /* ---------- 口令摘要 ---------- */
  function hex(buf) {
    var a = new Uint8Array(buf), s = "";
    for (var i = 0; i < a.length; i++) s += ("0" + a[i].toString(16)).slice(-2);
    return s;
  }
  function randHex(n) {
    var a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return hex(a);
  }
  /* 非安全上下文（file:// 等拿不到 crypto.subtle）时的降级摘要。
     强度弱，仅保证「不存明文」，页面上会标注 weak 标记。 */
  function weakHash(str) {
    var h1 = 0x811c9dc5, h2 = 0xc2b2ae35;
    for (var r = 0; r < 3000; r++) {
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
        h2 = Math.imul(h2 ^ (c + r), 2246822519) >>> 0;
      }
    }
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }
  function hashPwd(pwd, salt) {
    var canPBKDF2 = !!(window.crypto && crypto.subtle && window.TextEncoder);
    if (!canPBKDF2) {
      return Promise.resolve("weak$" + weakHash(pwd + "|" + salt));
    }
    var enc = new TextEncoder();
    return crypto.subtle
      .importKey("raw", enc.encode(pwd), "PBKDF2", false, ["deriveBits"])
      .then(function (key) {
        return crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256);
      })
      .then(function (bits) { return "pbkdf2$120000$" + hex(bits); })
      .catch(function () { return "weak$" + weakHash(pwd + "|" + salt); });
  }

  /* ---------- 基础状态 ---------- */
  function store() {
    var s = read(K_ACC, null);
    if (!s || !Array.isArray(s.users)) s = { v: 1, users: [], session: null, sessionTs: 0 };
    return s;
  }
  function save(s) { write(K_ACC, s); }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function pub(u) {
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role, ts: u.ts };
  }
  function roleOf(u) { return ROLES[(u && u.role) || "guest"] || ROLES.guest; }

  function emit() {
    try { document.dispatchEvent(new CustomEvent("auth:change", { detail: { user: me() } })); } catch (e) { }
    if (window.__renderUserBox) window.__renderUserBox();
  }

  /* ---------- 对外接口 ---------- */
  function me() {
    var s = store();
    if (!s.session) return null;
    var u = s.users.filter(function (x) { return x.id === s.session; })[0];
    return pub(u || null);
  }
  function roleKey() { var u = me(); return u ? u.role : "guest"; }
  function role() { return roleOf(me()); }

  function findEmail(email) {
    var e = String(email || "").trim().toLowerCase();
    return store().users.filter(function (x) { return x.email === e; })[0] || null;
  }

  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || "").trim()); }

  function register(opt) {
    opt = opt || {};
    var email = String(opt.email || "").trim().toLowerCase();
    var name = String(opt.name || "").trim();
    var pwd = String(opt.pwd || "");
    var pwd2 = String(opt.pwd2 || pwd);

    if (!name || name.length < 2) return Promise.resolve({ ok: false, msg: "昵称至少 2 个字" });
    if (name.length > 16) return Promise.resolve({ ok: false, msg: "昵称最多 16 个字" });
    if (!validEmail(email)) return Promise.resolve({ ok: false, msg: "请填写有效的邮箱地址" });
    if (pwd.length < 6) return Promise.resolve({ ok: false, msg: "密码至少 6 位" });
    if (pwd.length > 64) return Promise.resolve({ ok: false, msg: "密码过长（最多 64 位）" });
    if (pwd !== pwd2) return Promise.resolve({ ok: false, msg: "两次输入的密码不一致" });
    if (findEmail(email)) return Promise.resolve({ ok: false, msg: "该邮箱已注册，请直接登录" });

    var salt = randHex(16);
    return hashPwd(pwd, salt).then(function (hash) {
      var s = store();
      var u = { id: "u_" + randHex(6), email: email, name: name, salt: salt, hash: hash, role: "user", ts: Date.now() };
      s.users.push(u);
      s.session = u.id;
      s.sessionTs = Date.now();
      save(s);
      emit();
      return { ok: true, msg: "注册成功，已自动登录", user: pub(u) };
    });
  }

  function login(opt) {
    opt = opt || {};
    var email = String(opt.email || "").trim().toLowerCase();
    var pwd = String(opt.pwd || "");
    if (!validEmail(email)) return Promise.resolve({ ok: false, msg: "请填写有效的邮箱地址" });
    if (!pwd) return Promise.resolve({ ok: false, msg: "请输入密码" });

    var u = findEmail(email);
    if (!u) return Promise.resolve({ ok: false, msg: "该邮箱尚未注册" });

    return hashPwd(pwd, u.salt).then(function (hash) {
      if (hash !== u.hash) return { ok: false, msg: "密码不正确" };
      var s = store();
      s.session = u.id;
      s.sessionTs = Date.now();
      save(s);
      emit();
      return { ok: true, msg: "登录成功，欢迎回来 · " + u.name, user: pub(u) };
    });
  }

  function logout() {
    var s = store();
    s.session = null;
    s.sessionTs = 0;
    save(s);
    emit();
    return true;
  }

  /* demoLogin：一键体验，跳过表单直接生成/进入一个演示账号（无密码） */
  function demoLogin(roleK) {
    var rk = ROLES[roleK] ? roleK : "user";
    var s = store();
    var existed = s.users.filter(function (x) { return x.email === ("demo-" + rk + "@local"); })[0];
    if (!existed) {
      existed = {
        id: "u_" + randHex(6),
        email: "demo-" + rk + "@local",
        name: rk === "member" ? "体验会员" : "体验用户",
        salt: "", hash: "demo$", role: rk, ts: Date.now()
      };
      s.users.push(existed);
    }
    s.session = existed.id;
    s.sessionTs = Date.now();
    save(s);
    emit();
    return pub(existed);
  }

  /* ---------- 每日额度 ---------- */
  function quotaStore() {
    var q = read(K_QUOTA, null);
    if (!q || q.date !== today()) q = { date: today(), used: {} };
    return q;
  }
  function quota(action) {
    var r = role();
    var q = quotaStore();
    var key = (me() && me().id) || "guest";
    var used = Number(q.used[key] || 0);
    var limit = r.dailyPlan;
    var unlimited = !isFinite(limit);
    return {
      role: r.key, roleLabel: r.label, color: r.color,
      action: action || "plan",
      used: used,
      limit: unlimited ? null : limit,
      remain: unlimited ? null : Math.max(0, limit - used),
      unlimited: unlimited
    };
  }
  function consume(action) {
    var info = quota(action);
    if (!info.unlimited && info.remain <= 0) {
      return { ok: false, info: info, msg: info.role === "guest"
        ? "游客每日可免费生成 " + info.limit + " 次方案，今天已用完"
        : "今日 " + info.limit + " 次额度已用完" };
    }
    var q = quotaStore();
    var key = (me() && me().id) || "guest";
    q.used[key] = Number(q.used[key] || 0) + 1;
    q.date = today();
    write(K_QUOTA, q);
    return { ok: true, info: quota(action), msg: "ok" };
  }

  /* 会员升级（演示：直接切换角色，不做任何支付） */
  function setRole(roleK) {
    var u = me();
    if (!u) return { ok: false, msg: "请先登录" };
    if (!ROLES[roleK]) return { ok: false, msg: "未知角色" };
    var s = store();
    s.users.forEach(function (x) { if (x.id === u.id) x.role = roleK; });
    save(s);
    emit();
    return { ok: true, msg: "已切换为「" + ROLES[roleK].label + "」（演示）" };
  }
  function upgrade() { return setRole("member"); }
  function downgrade() { return setRole("user"); }

  /* ---------- 方案归属 ---------- */
  function plansOf(uid) {
    if (!uid) return [];
    var all = read(K_PLANS, {});
    return Array.isArray(all[uid]) ? all[uid] : [];
  }
  function plans() { var u = me(); return u ? plansOf(u.id) : []; }
  function savePlan(plan) {
    var u = me();
    if (!u) return { ok: false, msg: "请先登录后再保存方案", guest: true };
    var all = read(K_PLANS, {});
    var list = Array.isArray(all[u.id]) ? all[u.id] : [];
    var max = role().maxPlans;
    if (isFinite(max) && list.length >= max) {
      return { ok: false, msg: "「" + role().label + "」最多保留 " + max + " 份方案，请先在个人中心删除旧方案" };
    }
    var rec = {
      id: "p_" + randHex(5),
      ts: Date.now(),
      title: plan.title || "志愿方案",
      summary: plan.summary || "",
      payload: plan.payload || null
    };
    list.unshift(rec);
    all[u.id] = list;
    write(K_PLANS, all);
    return { ok: true, msg: "方案已保存到你的账号", plan: { id: rec.id, ts: rec.ts, title: rec.title, summary: rec.summary } };
  }
  function removePlan(id) {
    var u = me();
    if (!u) return { ok: false, msg: "请先登录" };
    var all = read(K_PLANS, {});
    var list = Array.isArray(all[u.id]) ? all[u.id] : [];
    var before = list.length;
    list = list.filter(function (p) { return p.id !== id; });
    all[u.id] = list;
    write(K_PLANS, all);
    emit();
    return { ok: before !== list.length, msg: before !== list.length ? "已删除" : "方案不存在" };
  }

  /* 清空本机全部演示数据（隐私 / 排障用） */
  function resetAll() {
    [K_ACC, K_QUOTA, K_PLANS, BOARD_K].forEach(function (k) {
      if (LS) { try { LS.removeItem(k); } catch (e) { } }
      delete MEM[k];
    });
    emit();
    return true;
  }

  window.Auth = {
    ROLES: ROLES,
    DEMO_NOTICE: DEMO_NOTICE,
    available: !!LS,
    me: me,
    roleKey: roleKey,
    role: role,
    isGuest: function () { return !me(); },
    isMember: function () { return roleKey() === "member"; },
    register: register,
    login: login,
    logout: logout,
    demoLogin: demoLogin,
    quota: quota,
    consume: consume,
    setRole: setRole,
    upgrade: upgrade,
    downgrade: downgrade,
    plans: plans,
    savePlan: savePlan,
    removePlan: removePlan,
    resetAll: resetAll,
    validEmail: validEmail
  };
})();
