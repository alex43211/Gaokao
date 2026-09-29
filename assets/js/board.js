/* ============================================================
   恩卓智选 · 留言板 / 分类问答（纯前端体验版）

   与 auth.js 同样的定位：没有后端，帖子只存在本机 localStorage。
   之所以先做「本地留言板」而不是真正的邮件问答，是因为静态托管没有服务端；
   等接入后端后，把内部实现换成 fetch 即可，页面调用方式不变。

   分类沿用试用者反馈里提出的三类：就业 / 专业选择 / 行情分析。
   权限：游客只读；注册用户及以上可发帖、可删除自己的帖子；点赞不限。
   ============================================================ */
(function () {
  "use strict";

  var K = "enzo_board_v1";

  var CATS = [
    { key: "就业", label: "就业与行业", icon: "💼", desc: "行业前景、岗位薪资、稳定性" },
    { key: "专业选择", label: "专业选择", icon: "📚", desc: "选专业、课程难度、转专业" },
    { key: "行情分析", label: "行情分析", icon: "📈", desc: "分数波动、投档线、位次换算" }
  ];
  var CAT_KEYS = CATS.map(function (c) { return c.key; });

  var LS = (function () {
    try {
      localStorage.setItem("__enzo_t", "1");
      localStorage.removeItem("__enzo_t");
      return localStorage;
    } catch (e) { return null; }
  })();
  var MEM = [];

  function readAll() {
    if (!LS) return MEM;
    try {
      var s = LS.getItem(K);
      var a = s ? JSON.parse(s) : [];
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function writeAll(a) {
    MEM = a;
    if (!LS) return true;
    try { LS.setItem(K, JSON.stringify(a)); return true; } catch (e) { return false; }
  }

  function who() {
    var u = (window.Auth && Auth.me()) || null;
    return u
      ? { uid: u.id, name: u.name, role: u.role, roleLabel: (Auth.ROLES[u.role] || {}).label || "" }
      : { uid: "guest", name: "游客", role: "guest", roleLabel: "游客" };
  }
  function randId() {
    var a = "abcdefghijklmnopqrstuvwxyz0123456789", s = "";
    for (var i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
    return "b_" + s;
  }

  /* 首次访问灌入几条官方示例，避免页面空荡（标记 demo，不可删除） */
  function seed() {
    var a = readAll();
    if (a.length) return a;
    var now = Date.now();
    a = [
      {
        id: randId(), uid: "official", name: "小艾 · 官方", role: "member", cat: "行情分析", demo: true,
        title: "为什么同一个分数，在浙江能上 211、在河南只能上一本？",
        body: "各省一段线不同、考生人数也不同，所以「绝对分数」没法横向比较。正确的做法是看位次（一分一段表里的累计排名）。本站报告里的「参考线」只是演示口径，真实填报请务必对照本省教育考试院当年的一分一段表，把分数换算成位次，再去看目标院校近三年的最低录取位次。",
        ts: now - 3600e3 * 5, likes: []
      },
      {
        id: randId(), uid: "official", name: "小艾 · 官方", role: "member", cat: "就业", demo: true,
        title: "普通家庭报志愿，优先「专业壁垒」还是「学校平台」？",
        body: "分两种情况：① 打算本科毕业就工作——优先专业壁垒（计算机、电气、临床医学、护理、会计等有执照或技术门槛的方向）；② 打算考研深造——优先学校平台（保研率、学风、导师资源），专业可以适度让位。最忌讳的是「为了名校光环去读一个没有任何门槛的冷门专业」。",
        ts: now - 3600e3 * 26, likes: []
      },
      {
        id: randId(), uid: "official", name: "小艾 · 官方", role: "member", cat: "专业选择", demo: true,
        title: "「自动化」和「机械设计制造及其自动化」到底差在哪？",
        body: "自动化偏控制与信息（电工学、电机与拖动、运动控制、机器人、现场总线）；机械偏结构与制造（力学、材料、工艺、液压）。两者都要学电工学和液压与气压传动，但重心不同。整体看自动化转码、转智能制造的路径更顺，机械更吃经验积累。",
        ts: now - 3600e3 * 50, likes: []
      }
    ];
    writeAll(a);
    return a;
  }

  function list(cat, sortBy) {
    var a = seed().slice();
    if (cat && cat !== "全部") a = a.filter(function (p) { return p.cat === cat; });
    if (sortBy === "hot") {
      a.sort(function (x, y) { return (y.likes || []).length - (x.likes || []).length || y.ts - x.ts; });
    } else {
      a.sort(function (x, y) { return (y.ts || 0) - (x.ts || 0); });
    }
    return a;
  }

  function counts() {
    var a = seed();
    var o = { 全部: a.length };
    CAT_KEYS.forEach(function (k) { o[k] = a.filter(function (p) { return p.cat === k; }).length; });
    return o;
  }

  function add(opt) {
    var u = who();
    var canPost = !!(window.Auth && Auth.role().canPost);
    if (!canPost) return { ok: false, msg: "游客只能浏览，注册后即可发帖" };

    var cat = String((opt && opt.cat) || "");
    var title = String((opt && opt.title) || "").trim();
    var body = String((opt && opt.body) || "").trim();

    if (CAT_KEYS.indexOf(cat) < 0) return { ok: false, msg: "请选择一个提问分类" };
    if (title.length < 4) return { ok: false, msg: "标题至少 4 个字" };
    if (title.length > 40) return { ok: false, msg: "标题最多 40 个字" };
    if (body.length < 10) return { ok: false, msg: "内容至少 10 个字，把情况说清楚别人才好回答" };
    if (body.length > 500) return { ok: false, msg: "内容最多 500 个字" };

    var a = readAll();
    var post = {
      id: randId(), uid: u.uid, name: u.name, role: u.role, cat: cat,
      title: title, body: body, ts: Date.now(), likes: []
    };
    a.unshift(post);
    writeAll(a);
    return { ok: true, msg: "已发布", post: post };
  }

  function remove(id) {
    var u = who();
    var a = readAll();
    var p = a.filter(function (x) { return x.id === id; })[0];
    if (!p) return { ok: false, msg: "帖子不存在" };
    if (p.demo) return { ok: false, msg: "官方示例帖不可删除" };
    if (p.uid !== u.uid) return { ok: false, msg: "只能删除自己发布的帖子" };
    writeAll(a.filter(function (x) { return x.id !== id; }));
    return { ok: true, msg: "已删除" };
  }

  function like(id) {
    var u = who();
    var a = readAll();
    var p = a.filter(function (x) { return x.id === id; })[0];
    if (!p) return { ok: false, msg: "帖子不存在" };
    p.likes = Array.isArray(p.likes) ? p.likes : [];
    var i = p.likes.indexOf(u.uid);
    if (i >= 0) { p.likes.splice(i, 1); writeAll(a); return { ok: true, liked: false, n: p.likes.length }; }
    p.likes.push(u.uid);
    writeAll(a);
    return { ok: true, liked: true, n: p.likes.length };
  }

  function liked(id) {
    var u = who();
    var p = readAll().filter(function (x) { return x.id === id; })[0];
    return !!(p && Array.isArray(p.likes) && p.likes.indexOf(u.uid) >= 0);
  }
  function likesOf(id) {
    var p = readAll().filter(function (x) { return x.id === id; })[0];
    return (p && p.likes && p.likes.length) || 0;
  }

  window.Board = {
    CATS: CATS,
    CAT_KEYS: CAT_KEYS,
    list: list,
    counts: counts,
    add: add,
    remove: remove,
    like: like,
    liked: liked,
    likesOf: likesOf,
    total: function () { return readAll().length; }
  };
})();
