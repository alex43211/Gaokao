/* ============================================================
   小艾助手 · 本地对话引擎（1.0 演示版）
   —— 融合"张雪峰.skill"认知框架：
      社会筛子论 / 就业倒推法 / 阶层现实主义 / 选择>努力 / 城市优先
   说明：当前为纯前端规则+知识检索引擎（无需后端），
        后续可在 assistant.js 中切换为云端大模型 API。
   ============================================================ */
window.XIAOAI = window.XIAOAI || {};

// 省份数据以 key 为短名，这里统一补齐 .name 便于模板输出
(function () {
  if (window.PROVINCES) Object.keys(window.PROVINCES).forEach(k => { window.PROVINCES[k].name = k; });
})();

/* ---------- 开场白 / 问候 ---------- */
const OPENERS = [
  "同学你好，我是小艾 👋 高考志愿规划助手。\n\n别急着问分数，先想明白三件事：\n\n1️⃣ 你家里是做什么的？有行业资源吗？\n2️⃣ 你愿意去哪个城市发展？\n3️⃣ 你能接受什么样的工作节奏？\n\n这三件事想清楚了，专业和学校自然就有答案了。你可以问我：\n• 「计算机专业怎么样」\n• 「560分河南怎么填」\n• 「临床医学值不值得读」\n• 「普通家庭选什么专业」"
];

/* ---------- 意图规则：pattern -> 回复生成器 ---------- */
function intentOf(text) {
  if (/你好|您好|嗨|hi|hello|在吗|你是谁|介绍下你|^0$/.test(text)) return "greet";
  if (/谢谢|感谢|辛苦/.test(text)) return "thanks";
  if (/再见|拜拜|88|bye/.test(text)) return "bye";
  if (/多少分|考了\d+|估分|模考|\d{3}\s*分|400多|500多|600多|300多|700多/.test(text) && /专业|学校|志愿|能上|去哪|怎么填|推荐|报/.test(text)) return "score_mix";
  if (/位次|多少名|排第几|能排到|全省能排|一分一段/.test(text) && !/大学|学院|专业/.test(text)) return "rank";
  if (/怎么填|填报|志愿表|冲稳保|梯度|平行志愿|怎么报|录取规则|投档/.test(text)) return "how_fill";
  if (/选科|选考|科目|3\+1\+2|物理|化学|生物|政治|历史|地理/.test(text) && /专业|能报|限制|组合/.test(text)) return "subject_mix";
  if (/天坑|生化环材|土木|新闻|金融|法学/.test(text) && /能学|能报|坑|怎么样|值/.test(text)) return "pit_majors";
  if (/普通家庭|没钱|家里没|家境|农村|工薪/.test(text)) return "family";
  if (/文科/.test(text) && /专业|报|选|怎么/.test(text)) return "humanities";
  if (/AI|人工智能|chatgpt|ai时代|取代|替代/.test(text) && /专业|影响|选/.test(text)) return "ai_era";
  if (/就业|薪资|工资|年薪|收入|赚钱|前景|饭碗/.test(text)) return "employment";
  if (/考研|读研|保研|硕士|博士|研究生/.test(text)) return "grad";
  if (/考公|公务员|编制|体制内|铁饭碗|稳定/.test(text)) return "civil";
  if (/城市|地域|出省|北上广|大城市|回家乡|去外地/.test(text)) return "city";
  if (/复读|再来一年|高四/.test(text)) return "repeat";
  if (/焦虑|害怕|担心|迷茫|压力|紧张/.test(text)) return "anxiety";
  if (/男女|女生|男生|女孩|男孩/.test(text) && /专业|选|报/.test(text)) return "gender";
  if (/师范|当老师|教师/.test(text)) return "teacher";
  if (/医学|医生|学医|临床/.test(text)) return "medicine";
  if (/军校|警校|提前批|国防/.test(text)) return "military";
  return "fallback";
}

/* ---------- 专业名匹配（用于知识检索） ---------- */
const STOP_WORDS = ["专业", "类", "方向", "怎么样", "好不好", "能学吗", "能报吗", "值得吗", "学什么",
  "难不难", "就业", "有前途吗", "行不行", "怎么样", "怎么选", "哪个好", "和", "还是", "想学", "推荐",
  "了解", "请问", "看看", "什么", "能上", "想读", "想报", "我想", "学", "读", "报", "选"];
function findMajor(text) {
  if (!window.MAJORS) return null;
  // 0) 完整专业名包含匹配（最高优先级）
  const fullHit = window.MAJORS.filter(m => text.includes(m.name));
  if (fullHit.length) return fullHit[0];

  // 1) 去除停用词后，做「双向子串窗口打分」
  let core = text;
  STOP_WORDS.forEach(w => { core = core.split(w).join(""); });
  core = core.replace(/[？?。！!，,、：:；;\s]/g, "");   // 去标点
  if (core.length >= 2) {
    let best = null, bestScore = 0;
    window.MAJORS.forEach(m => {
      const mName = m.name.replace(/[（(].*?[)）]/g, ""); // 去括号备注
      let score = 0;
      // 专业名任意连续片段出现在查询
      for (let i = 0; i <= mName.length - 2; i++) {
        const seg = mName.slice(i, i + 3 >= mName.length ? mName.length : i + 3);
        if (core.includes(seg)) { score += seg.length; break; }
      }
      // 查询任意2~6字片段是专业名前缀
      for (let i = 0; i < core.length && score < 12; i++) {
        for (let L = 2; L <= Math.min(6, core.length - i); L++) {
          const seg = core.slice(i, i + L);
          if (mName.startsWith(seg)) { score += L; break; }
        }
      }
      // 核心词整词是专业名前缀：直接高置信
      if (core.length >= 2 && core.length <= 8 && mName.startsWith(core)) score = Math.max(score, 14);
      if (score > bestScore) { bestScore = score; best = m; }
    });
    if (best && bestScore >= 3) return best;
  }
  // 2) 简称别名
  const alias = { "cs": "计算机科学与技术", "软工": "软件工程", "ai": "人工智能", "金融": "金融学", "会计": "会计学", "临床": "临床医学" };
  for (const k in alias) { if (text.includes(k)) return window.MAJORS.find(m => m.name === alias[k]) || null; }
  return null;
}

/* ---------- 院校匹配 ---------- */
function findCollege(text) {
  if (!window.COLLEGES) return null;
  const hit = window.COLLEGES.filter(c => text.includes(c.name) || c.name.includes(text.replace(/大学|学院/g, "")));
  return hit.length ? hit[0] : null;
}

/* ---------- 省匹配 ---------- */
function findProv(text) {
  if (!window.PROVINCES) return null;
  const hit = window.PROVINCE_LIST.filter(p => text.includes(p));
  return hit.length ? window.PROVINCES[hit[0]] : null;
}

/* ---------- 回复生成 ---------- */
function zxfStyle(intro, body, close) {
  // 张雪峰式：判断先行 + 数据支撑 + 反问收尾
  return intro + "\n\n" + body + (close ? "\n\n" + close : "");
}

function majorAnswer(m) {
  // 目录建档条目（无深度文案）：给建档信息 + 引导
  if (m.catOnly === true) {
    const specStr = (m.spec && m.spec.length) ? "（" + m.spec.join("/") + "专业）" : "";
    return `【${m.name}】${m.cat}门类 · ${m.sub || "相关专业类"}${specStr}｜📜 目录建档\n\n${m.name}收录于教育部《普通高等学校本科专业目录（2026年）》，专业代码 ${m.code}，授予${m.degree}，基本修业年限 ${m.years} 年。\n\n建议选科：${m.req}\n\n🎙️ 这个专业目前还在「建档补全」阶段，深度课程/就业解读陆续上线。你可以先问我：\n• 「${m.name}和计算机怎么选」（让我用同类专业做参考对比）\n• 「${m.name}就业前景」\n\n或者告诉我你的省份+分数+选科，我结合整体就业框架给你方向参考。`;
  }
  const rateMap = { 5: "🟢 强烈推荐", 4: "🟢 推荐", 3: "🟡 看情况", 2: "🔴 谨慎" };
  return `【${m.name}】${m.cat}·${m.sub}｜${rateMap[m.rating]}\n\n${m.intro}\n\n📚 主干课程：${m.courses.join("、")}\n💼 典型去向：${m.jobs.join("、")}\n💰 演示起薪：${m.salary}／月\n📈 行业趋势：${m.trend}\n🤖 AI 冲击：${m.aiRisk}\n\n🎙️ 择校视角点评：${m.zxf}\n\n还想了解它的录取院校分布、或对比另一个专业吗？直接告诉我「XX和XX怎么选」也行。`;
}

/* ============ 升级：考生档案记忆（上下文） ============ */
window.XIAOAI.profile = { prov: null, provFull: null, score: null, estimate: true, subjects: [] };

function parseProfile(text) {
  const prof = window.XIAOAI.profile;
  // 省份
  const provHit = (window.PROVINCE_LIST || []).filter(p => text.includes(p) && PROVINCES[p].region !== "台港澳");
  if (provHit.length) { prof.prov = provHit[provHit.length - 1]; prof.provFull = PROVINCES[prof.prov].full; }
  // 分数
  const sm = text.match(/(\d{3})\s*分/);
  if (sm && +sm[1] >= 200 && +sm[1] <= 750) prof.score = +sm[1];
  // 选科（每门独立词，避免误抓"专业"等）
  const subjSet = new Set(prof.subjects || []);
  ["物理", "化学", "生物", "政治", "历史", "地理"].forEach(s => {
    if (new RegExp(s).test(text)) subjSet.add(s);
  });
  if (subjSet.size >= 3) { prof.subjects = [...subjSet].slice(0, 3); }
  else if (subjSet.size >= 1 && prof.subjects.length) {
    prof.subjects = [...new Set([...prof.subjects, ...subjSet])].slice(0, 3);
  }
}

function profileLine() {
  const p = window.XIAOAI.profile;
  const parts = [];
  if (p.prov) parts.push(p.prov);
  if (p.score) parts.push(p.score + " 分" + (p.estimate ? "(估)" : ""));
  if (p.subjects.length) parts.push(p.subjects.join("+"));
  return parts.length ? parts.join(" · ") : null;
}

/* ============ 升级：演示位次估算 ============ */
function estimateRankText(provShort, score) {
  const prov = PROVINCES[provShort];
  if (!prov || !score) return null;
  const total = prov.candidates * 10000;               // 演示考生总数
  const line = prov.specialLineP;                       // 演示物理一段线
  const diff = score - line;
  // 演示模型：假设一段线对应全省约 30% 位次；每高 5 分，位次按 0.82 比例前进（非真实数据）
  let baseRank = Math.round(total * 0.30);
  let rank = Math.round(baseRank * Math.pow(0.82, diff / 5));
  rank = Math.max(200, Math.min(total, rank));
  const pct = (rank / total * 100).toFixed(2);
  return `【演示位次估算】${prov.name} · 参考一段线 ${line} 分\n\n你的 ${score} 分（高于线 ${diff > 0 ? "+" : ""}${diff}）\n≈ 全省第 ${rank.toLocaleString("zh-CN")} 名左右\n≈ 超过约 ${(100 - +pct).toFixed(1)}% 的考生\n\n⚠️ 位次为演示模型估算，真实报考请以省考试院《一分一段表》为准。`;
}
/* 供报告页等复用（返回结构化数据而非文本） */
window.XIAOAI.estimateRank = function (provShort, score) {
  const prov = PROVINCES[provShort];
  if (!prov || !score) return null;
  const total = prov.candidates * 10000;
  const line = prov.specialLineP;
  const diff = score - line;
  let rank = Math.round(total * 0.30 * Math.pow(0.82, diff / 5));
  rank = Math.max(200, Math.min(total, rank));
  return { prov: prov.name, total: Math.round(total), line, diff, rank, pctOver: +((1 - rank / total) * 100).toFixed(1) };
};

/* ============ 升级：专业对比 ============ */
function findMajorPair(text) {
  const connectors = /和|与|跟|及|vs|VS|对比|哪个好|哪个|怎么选|还是|、|,|，|\s/;
  const parts = text.split(connectors).filter(s => s && s.length >= 2 && s.length <= 14);
  // 先尝试直接整句命中两个不同专业名
  const found = [];
  const aliasPairs = { "学医": "临床医学", "当老师": "数学与应用数学(师范)", "考公": "法学", "师范": "数学与应用数学(师范)", "软件": "软件工程", "计算机": "计算机科学与技术", "通信": "通信工程", "电子": "电子信息工程" };
  for (const seg of parts) {
    let m = findMajor(seg);
    if (!m) {
      // 尝试别名映射（仅匹配当前片段，避免跨段误吞）
      for (const k in aliasPairs) {
        if (seg.includes(k)) { const am = MAJORS.find(x => x.name === aliasPairs[k]); if (am) { m = am; break; } }
      }
    }
    if (m && !found.some(x => x.id === m.id)) found.push(m);
    if (found.length === 2) break;
  }
  return found.length >= 2 ? found.slice(0, 2) : null;
}

function compareAnswer(a, b) {
  const rate = m => m.catOnly ? "建档" : (m.rating >= 4 ? "🟢推荐" : m.rating === 3 ? "🟡看情况" : "🔴谨慎");
  const ai = m => m.catOnly ? "—" : (m.aiRisk.includes("低") ? "低" : m.aiRisk.includes("高") ? "高" : "中");
  const pay = m => m.catOnly ? "待补全" : m.salary;
  const job = m => m.catOnly ? (m.sub || m.cat + "类") : (m.jobs[0] + "、" + m.jobs[1] + "…");
  const cmt = m => m.catOnly ? "目录建档专业，深度解读补全中" : m.zxf;
  return `【${a.name} vs ${b.name}】\n\n— ${a.name} —\n推荐度 ${rate(a)}｜演示起薪 ${pay(a)}｜AI冲击 ${ai(a)}\n就业方向：${job(a)}\n${cmt(a)}\n\n— ${b.name} —\n推荐度 ${rate(b)}｜演示起薪 ${pay(b)}｜AI冲击 ${ai(b)}\n就业方向：${job(b)}\n${cmt(b)}\n\n我的判断（演示参考）：\n${a.name} 和 ${b.name} 分属「${a.sub || a.cat}」与「${b.sub || b.cat}」两条路线。选择的关键仍回归三问：家里做什么、能读多久、想去哪个城市。你可以把分数和省份告诉我，我帮你看看哪条路线更好落地。`;
}

window.XIAOAI.reply = function (raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  // 记忆上下文：把本句的省份/分数/选科沉淀到档案
  parseProfile(text);
  const intent = intentOf(text);

  // 0. 问候
  if (intent === "greet") return OPENERS[0];
  if (intent === "thanks") return "不客气。记住：志愿这事，多查数据、多问自己，别把决定权交给别人。还有什么想问的？";
  if (intent === "bye") return "好，去忙吧。记住：分数是过去式，选择才是进行时。有需要随时来找我 👋";

  // 0.1 纯陈述考生档案（无问句）：存档并引导后续
  const hasInfo = window.XIAOAI.profile.prov || window.XIAOAI.profile.score || window.XIAOAI.profile.subjects.length;
  const isPureStatement = !/[？?]|怎么样|怎么选|哪个好|能上|能报|能不能|推荐|多少分|排|如何|吗$|呢$/.test(text) &&
    /考生|我是|我来自|选了|选了.{0,10}(物理|化学|生物|历史|地理|政治)|考了\d|估分|模考|今年.{0,6}高考/.test(text);
  if (isPureStatement && hasInfo && text.length <= 60) {
    const profStr = profileLine();
    const p = window.XIAOAI.profile;
    const extra = (p.prov && p.score) ? `你目前档案：${profStr}。这个组合已经能出方案了，试试问我：\n• 「${p.score}分能上什么学校」\n• 「帮我排一下位次」\n• 「${p.score}分${p.prov}有什么好专业」` :
      "信息我记下了，还差一些关键数据。你可以接着补充省份 / 分数，例如「河南 560 分」「物理化学选科」。";
    return `✅ 收到，已记录考生档案：${profStr}\n\n${extra}`;
  }

  // 0.5 专业对比「A和B怎么选 / A还是B / 哪个好」
  const pairTrigger = /哪个好|怎么选|对比|vs|VS|还是/.test(text) ||
    (/和|与/.test(text) && /专业|方向|选|学|报|考/.test(text));
  if (pairTrigger) {
    const pair = findMajorPair(text);
    if (pair) return compareAnswer(pair[0], pair[1]);
  }

  // 0.6 位次/排名换算
  if (intent === "rank") {
    const p = window.XIAOAI.profile;
    const score = p && p.score;
    const prov = p && p.prov;
    if (!score || !prov) {
      return zxfStyle(
        "想算位次？可以，先把两样东西给我：省份 + 分数。",
        "位次比分数更能说明问题——同分不同省的含金量完全不一样，位次才是志愿填报的'通用货币'。",
        "例如直接说「河南 560 分排多少名」，我按演示模型给你估一个。"
      );
    }
    const rankText = estimateRankText(prov, score);
    if (rankText) return rankText + "\n\n顺便问一句：这个位次下你有大概的专业方向了吗？我可以帮你判断能摸到什么梯队的学校。";
  }

  // 1. 院校优先：命中「XX大学/学院」全名
  const college = (/(大学|学院|学校)/.test(text)) ? findCollege(text) : null;
  if (college && text.includes(college.name)) {
    return zxfStyle(
      `【${college.name}】${college.prov}·${college.city}｜${college.level}\n\n${college.type}类院校${college.level === "普通本" ? "（普通本科）" : ""}，${college.note}`,
      `🏷️ 特色标签：${college.tags.join("、")}\n📊 演示参考档：${college.ref} 分档位（750制）\n🔥 热度指数：${"★".repeat(college.hot)}${"☆".repeat(5 - college.hot)}`,
      "该校只是库中一例（演示数据）。想看这个分数段全部可冲院校，去「AI 志愿填报」生成报告吧。"
    );
  }

  // 1.5 若提到某专业名 -> 输出专业知识卡
  const major = findMajor(text);
  if (major && intent !== "score_mix") return majorAnswer(major);
  if (college && !/专业/.test(text)) {
    return zxfStyle(
      `【${college.name}】${college.prov}·${college.city}｜${college.level}\n\n${college.type}类院校${college.level === "普通本" ? "（普通本科）" : ""}，${college.note}`,
      `🏷️ 特色标签：${college.tags.join("、")}\n📊 演示参考档：${college.ref} 分档位（750制）\n🔥 热度指数：${"★".repeat(college.hot)}${"☆".repeat(5 - college.hot)}`,
      "该校只是库中一例（演示数据）。想看这个分数段全部可冲院校，去「AI 志愿填报」生成报告吧。"
    );
  }

  // 2. 意图模板
  switch (intent) {
    case "how_fill": return zxfStyle(
      "志愿填报就三句话：冲、稳、保，梯度拉开，别全押一个学校。",
      "• 🔴 冲：比你的位次高 5-10% 的院校，放前面，搏一搏\n• 🟢 稳：跟你位次匹配的，放中间，这是基本盘\n• 🟢 保：低 10-15% 的，放最后，兜底用\n\n记住平行志愿原则：'分数优先、遵循志愿、一轮投档'——把你最想去的排前面，别倒着填。",
      "想让我按你的分数算一版冲稳保？告诉我：省份 + 分数 + 选科，例如「浙江 620 物理化学」。"
    );
    case "score_mix": {
      const m = text.match(/(\d{3})\s*分/);
      const score = m ? +m[1] : 0;
      const prov = findProv(text) || (window.XIAOAI.profile.prov ? PROVINCES[window.XIAOAI.profile.prov] : null);
      const prof = window.XIAOAI.profile;
      // 若句子只给省份没给分数，但档案里有分数 → 补上
      const effScore = score || prof.score;
      const profNote = (!score && prof.score) ? `（档案中已记下你 ${prof.prov} · ${prof.score} 分${prof.estimate ? "估" : ""}，本次沿用）\n` : "";
      return zxfStyle(
        effScore ? `${effScore} 分是吧？行，那咱们就按数据说话。\n${profNote}` : "分数先放一边，我先问你三个问题：",
        effScore ? (prov ? `按 ${prov.name} 演示线算，${effScore} 分大概在「${effScore >= prov.specialLineP ? "一段线之上" : "一段线附近/之下"}」，能覆盖一部分 211 到普通一本的区间（具体以官方位次为准）。` : "先把省份告诉我，分数线都是分省的，跨省比分数没有意义。") + "\n\n但我要提醒你：别光看分数选学校，先看专业对应的行业 5 年后还在不在风口上。" : "你是哪个省的？选的哪几科？家里是做什么的？这三个先答我。",
        "去「AI 志愿填报」页把省份、选科、分数填进去，我给你出一版可视化方案。"
      );
    }
    case "subject_mix": return zxfStyle(
      "新高考选科，本质是在给你的专业大门装锁——选错了，一半专业跟你无关。",
      "• 首选物理 ≈ 打开 90%+ 工科、理科、医科大门\n• 物理+化学 ≈ 几乎所有好就业工科（计算机/电子/电气/医学）都能报\n• 没选物理：计算机、电子、临床这些基本没戏，只能在文、经、管、法里选\n\n一句话：能选物理+化学就选，这是普通家庭孩子最有性价比的组合。",
      "把你的选科告诉我，我告诉你哪些好专业你报不了、哪些是你的菜。"
    );
    case "pit_majors": return zxfStyle(
      "你问到点子上了。所谓'天坑'，不是专业本身烂，是普通家庭孩子用四年时间去赌一个不确定的未来，赌不起。",
      "🔴 土木：黄金二十年过去了，增量放缓\n🔴 生化环材：本科就业中位数一般，读到博士才翻身\n🔴 新闻：不是坑，但只学新闻不学技能就是坑\n🟡 金融：没有家庭资源+非名校，大概率去网点卖理财\n\n但注意：坑里也有金子——顶尖院校+读研读博+真热爱，任何专业都能走出来。",
      "你家孩子是啥情况？说说分数和家庭条件，我帮你判断这个'坑'能不能趟。"
    );
    case "family": return zxfStyle(
      "普通家庭怎么了？我跟你说，普通家庭恰恰是最需要把志愿填对的那群人——因为你们没有试错成本。",
      "记住三条铁律：\n1️⃣ 先谋生再谋爱：优先选就业确定性高的（电气/计算机/医学/师范）\n2️⃣ 别碰'看起来光鲜'的专业：金融、新闻、工商管理，没资源就是陪跑\n3️⃣ 城市>学校>专业（同等分数下）：去发达城市，机会密度不一样\n\n社会是个大筛子，普通家庭手里能打的牌不多——分数和选择，就是你们的王牌。",
      "你家在哪个省？孩子平时能考多少分？我按你们家的情况给你捋。"
    );
    case "humanities": return zxfStyle(
      "文科生，听我说：理工科选专业，文科选学校。这句话倒过来念就是坑。",
      "文科的本质是平台+人脉行业，所以：\n• 优先冲学校牌子（985/211 优先，哪怕专业普通点）\n• 能当老师就当老师（汉语言/英语/历史/思政+师范），编制是真香\n• 法学/财经要掂量：家里没资源，普通院校出身会很累\n\n文科生最怕的是：学校一般 + 专业万金油 + 没有一技之长。",
      "文科生文科生，你告诉我你想留哪个城市？我给你按城市反推学校。"
    );
    case "ai_era": return zxfStyle(
      "AI 时代来了，我实话实说：我以前的推荐基本盘没变，但要加一个新判断标准——不可替代性。",
      "✅ 不怕 AI 的：临床医学（谁敢让机器人开刀）、电气（电网得有人爬杆子）、口腔（AI 能看片子不能拔牙）\n⚠️ 要升级的：计算机——别再学'会写 CRUD'，要学算法、系统、架构，'计算机+AI'才是方向\n❌ 首当其冲的：纯翻译、纯文案、基础会计、初级编程\n\n记住：AI 替代的是'低端重复'，不是'解决问题'。你的工资 = 你的不可替代性。",
      "你打算选什么方向？我可以帮你做个 AI 冲击体检。"
    );
    case "employment": return zxfStyle(
      "看专业好不好，别看学校宣传册，看中位数——中间 50% 的毕业生去了哪、赚多少。",
      "方法论给你：\n1️⃣ 去招聘网站看真实薪资分布，别看最高薪\n2️⃣ 问学长学姐真实去向，别看就业率注水数据\n3️⃣ 看这个行业 5 年后：现在缺人的，5 年后可能饱和\n\n就业倒推法：先想清楚毕业后你想过什么样的生活，再倒推今天选什么。",
      "你对哪个专业/行业感兴趣？我帮你做就业倒推。"
    );
    case "grad": return zxfStyle(
      "考研？先回答我：什么专业？什么学校？家里能不能供你到 25、26 岁不赚钱？",
      "• 理工科+好导师+家里有底 → 读，学历红利还在\n• 医学/法学 → 必读，这是行业门槛\n• 文科+普通双非 → 慎重，读出来可能还是老样子\n• 生化环材 → 读研读博几乎是唯一出路\n\n记住：考研不是目的，'洗学历'和'换赛道'才是目的。",
      "你是想考研换专业，还是本专业深造？方向不同策略完全不一样。"
    );
    case "civil": return zxfStyle(
      "想考公？那我告诉你，这是普通家庭孩子性价比最高的路之一，但专业得选对。",
      "考公友好专业 TOP：\n1️⃣ 法学（法检系统大量要人）\n2️⃣ 汉语言文学（岗位多，笔杆子硬通货）\n3️⃣ 计算机（网信、大数据局都在扩招）\n4️⃣ 会计/财政（税务、审计对口）\n5️⃣ 统计（统计局、调查队）\n\n避坑：部分专业考公只能报'三不限'，几百人抢一个岗。",
      "你是更想考公还是想进国企？我给你对应的专业清单。"
    );
    case "city": return zxfStyle(
      "城市选对了，等于白捡 10 分。我从来主张：能去大城市就去大城市。",
      "为什么？因为城市决定三样东西：\n🌆 思维：大城市的信息密度不一样\n🏙️ 资源：实习、人脉、机会的密度不一样\n💰 薪酬：同岗位，一线和新一线就是差一截\n\n参考梯队：\n第一梯队：北上广深\n第二梯队：杭州、南京、成都、武汉、西安、天津\n第三梯队：苏州、重庆、长沙、郑州、青岛、合肥\n\n当然——如果家里有明确的人脉和产业在老家，'回去'也是好选择，这叫家庭背景分流。",
      "你想去哪个城市？说说你的目标，我帮你评估值不值。"
    );
    case "repeat": return zxfStyle(
      "复读这事，我不劝，也不拦。先问你三个问题：",
      "1️⃣ 这次是发挥失常，还是实力就这水平？\n2️⃣ 再拼一年，最坏结果你能不能接受？\n3️⃣ 家里经济和时间上支持吗？\n\n如果是发挥失常+心理素质过关+家里支持 → 可以复读，但要有提分计划；如果是实力到头了，别拿一年青春赌一个不确定。",
      "说说你这次考了多少、平时多少，我帮你判断该不该再来一年。"
    );
    case "anxiety": return zxfStyle(
      "焦虑很正常，你爹妈比你更焦虑。但焦虑解决不了问题，把焦虑变成行动就赢了。",
      "给你一个'反焦虑'清单：\n1️⃣ 先拿数据说话：把近 3 年目标院校分数线拉出来看，别自己吓自己\n2️⃣ 把大目标拆成小任务：今天只研究 3 所学校，别想'我的人生完了'这种大问题\n3️⃣ 记住：高考是重要节点，不是人生终点。我 2007 年北漂月薪 2500，现在不也活得好好的。",
      "你具体卡在哪一步？选专业？怕滑档？还是家里人意见不合？说出来我帮你拆解。"
    );
    case "gender": return zxfStyle(
      "男生女生都一样，先看家庭、再看分数、最后看性格。但我可以给点务实参考：",
      "👦 男生：工科（电气/机械/计算机/车辆）选择面广；医学口腔是好选择；护理男生是稀缺资源\n👧 女生：师范、医学（口腔/影像/麻醉）、会计、法学（考公）、设计、护理都比较友好；工科里电子信息/计算机也完全可以，别自我设限\n\n核心原则：选你能'干得动+不排斥+天花板不低'的，别为别人的眼光选专业。",
      "你是男生女生？大概什么分数段？想留在爸妈身边还是出去闯？"
    );
    case "teacher": return zxfStyle(
      "想当老师？恭喜你，这是普通家庭孩子最稳的路之一，前提是你真的受得了跟孩子打交道。",
      "路线建议：\n• 首选部属师范：北师大、华东师大、华中师大、东北师大、陕师大、西南大学\n• 次选省属师范：首师大、南师大、湖师大、福师大等\n• 小初高需求不同：数学、物理老师最缺；英语、语文竞争大\n\n现在当老师要点：提前规划考编，关注'优师计划''公费师范生'这些政策红利。",
      "你想教哪个学科？去哪个省当老师？不同省份编制难度差别很大。"
    );
    case "medicine": return zxfStyle(
      "学医？好样的。但我把丑话说前头：这是一条'先苦后甜'的长线投资。",
      "✅ 推荐细分：临床（能进三甲，越老越吃香）、口腔（金领，医患轻松）、麻醉/影像（缺口大）\n⚠️ 注意：五年本科只是起点，规培 3 年+专培，30 岁前别指望高薪\n🏫 院校梯队：协和/北大医学部/复旦/上交/川大华西/中南湘雅/华科同济\n\n记住：劝人学医天打雷劈是玩笑话，但'家里能不能支持你读到 30 岁'是真心话。",
      "想学医的话，你大概什么分数？我帮你看看能摸到哪个梯队的医学院。"
    );
    case "military": return zxfStyle(
      "军校警校，提前批，这是'低分上名校+毕业包分配'（军警单位）的隐藏通道，但门槛不止是分数。",
      "几点提醒：\n1️⃣ 军检/政审/体能是硬门槛，先确认自己过不过\n2️⃣ 军校毕业进部队体系，警校毕业要参加公安联考（通过率高）\n3️⃣ 想清楚：这是'职业选择'不是'升学捷径'，自由度和生活方式的代价要想明白\n\n分数参考（演示）：国防科大通常要 985 段；省属警校一段线上即可冲。",
      "你身体条件怎么样？对部队/公安系统是真向往还是图稳定？"
    );
    default: {
      const prof = window.XIAOAI.profile;
      const hasCard = !!(prof.prov && prof.score);
      const profStr = profileLine();
      // 明显与志愿无关的闲聊：直接礼貌说明边界
      if (/天气|吃饭|电影|音乐|游戏|八卦|股票行情|新闻里|你好帅|你好漂亮|你多大了|你是谁创造/.test(text)) {
        return "哈哈，我主业是高考志愿规划，其他领域我就露怯了 😅\n\n我的强项是：\n• 专业 / 院校 / 城市怎么选\n• 分数和位次怎么看\n• 冲稳保怎么排\n\n要不换个志愿问题考考我？";
      }
      // 纯陈述句（报档案但没提问）：存档并引导下一步
      if ((prof.prov || prof.score || prof.subjects.length) && !/？|\?|吗|呢|吧$/.test(text) && (text.length <= 40) &&
          (/河南|浙江|广东|山东|江苏|四川|湖北|湖南|河北|安徽|福建|江西|辽宁|陕西|北京|上海|天津|重庆|我是|我来自|考生|选了|考了|估分|我.*分/.test(text))) {
        return `收到，我先帮你把档案记下来：${profStr || "考生档案"} ${prof.subjects.length ? "（选科 " + prof.subjects.join("+") + "）" : ""}\n\n接下来你可以问我：\n• 「${(prof.score || 560)}分能上什么学校？」\n• 「帮我排个位次」\n• 「这个分数学计算机还是电气好？」\n\n小艾会顺着你的档案继续聊，不用每次都报省份分数。`;
      }
      if (/专业/.test(text)) {
        return "你想了解哪个具体专业？直接说名字，比如「计算机科学与技术」「临床医学」「金融学」，我把它的课程、就业、AI 冲击一次给你讲清楚。\n\n也可以试试问我「XX和XX怎么选」做专业对比，或者去「专业百科」页按门类浏览 800+ 个官方目录专业。";
      }
      if (/学校|大学/.test(text)) {
        return "想问哪所学校？报个名字我帮你查（比如「华中科技大学」「深圳大学」）。\n\n或者告诉我你的省份+分数，我直接给你推荐能上的学校。";
      }
      return (hasCard
        ? `好，我记下你的档案了：${profStr}。你可以接着问我：\n\n• 「${prof.score}分怎么填志愿」（帮你排冲稳保）\n• 「帮我算算位次」\n• 「${prof.prov}有哪些好学校」\n• 「推荐几个专业方向」\n`
        : "这个问题问得好，但我手里缺三张牌：省份、分数、家庭情况。\n\n你可以先试试问这些：\n• 「我想学计算机，怎么选学校？」\n• 「普通家庭孩子适合什么专业？」\n• 「XX 大学怎么样」\n• 「文科生怎么填志愿」\n\n也可以直接去「AI 志愿填报」页生成你的专属报告。");
    }
  }
};

/* ---------- 快捷问题 ---------- */
window.XIAOAI.quicks = [
  "计算机专业怎么样？",
  "计算机和电气怎么选？",
  "普通家庭选什么专业？",
  "临床医学值不值得读？",
  "河南 560 分能排多少名？",
  "文科生怎么填志愿？"
];
