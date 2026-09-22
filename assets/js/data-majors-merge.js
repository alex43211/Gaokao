/* ============================================================
   专业数据合并层（最后加载）
   - window.MAJORS（原 65 条深度解读）— 来自 data-majors.js
   - window.MAJOR_CATALOG（875 条官方目录建档）— data-majors-catalog.js
   - 合并规则：
     1) 以 2026 官方目录为主干，保证代码/门类/学位权威；
     2) 深度解读条目按「规范代码」精准覆盖同名目录条目（丰富字段）；
     3) 代码含括号（如 070101(师范) 定向变体）不与目录合并，独立追加；
     4) 未被覆盖的目录条目保留 catOnly=true（建档级，无深度文案）。
   ============================================================ */
(function () {
  const details = window.MAJORS || [];
  const catalog = window.MAJOR_CATALOG || [];

  // 规范代码：剥离括号内说明
  const normCode = c => String(c || "").split("(")[0].trim();

  const detailByCode = {};
  details.forEach(d => { detailByCode[normCode(d.code)] = d; });

  const merged = [];
  const seen = new Set();

  // 1) 深度条目 -> 目录主干（若目录含同规范代码，则覆盖并注入富字段）
  details.forEach(d => {
    const nc = normCode(d.code);
    const isVariant = /[（(]/.test(d.code); // 括号变体：如 数学与应用数学(师范)
    const catItem = catalog.find(c => c.code === nc);
    if (catItem && !isVariant) {
      const m = Object.assign({}, catItem, d, { catOnly: false, code: catItem.code });
      merged.push(m);
      seen.add(catItem.code);
    } else {
      // 变体或目录中不存在：独立保留（补齐分类信息避免显示空）
      const m = Object.assign({}, d, {
        catnum: catItem ? catItem.catnum : "",
        spec: catItem ? catItem.spec : (d.spec || []),
        catOnly: false
      });
      merged.push(m);
    }
  });

  // 2) 目录其余条目全部进入
  catalog.forEach(c => {
    if (!seen.has(c.code)) merged.push(Object.assign({}, c));
  });

  // 3) 排序：按门类编号+代码
  merged.sort((a, b) => {
    const an = (a.catnum || "99") + (a.code || "");
    const bn = (b.catnum || "99") + (b.code || "");
    return an < bn ? -1 : an > bn ? 1 : 0;
  });

  // 挂载并重建门类索引
  window.MAJORS = merged;
  window.MAJOR_COUNT_DETAIL = details.length;
  window.MAJOR_COUNT_TOTAL = merged.length;
  window.MAJOR_CATS = {};
  merged.forEach(x => {
    (window.MAJOR_CATS[x.cat] = window.MAJOR_CATS[x.cat] || []).push(x);
  });
})();
