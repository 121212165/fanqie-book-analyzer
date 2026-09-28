// ==UserScript==
// @name         番茄书籍页拆书助手 Fanqie Book Analyzer
// @namespace    https://github.com/121212165
// @version      0.1.0
// @description  在番茄书籍详情页(/page/*)显示拆书面板：简介的钩子类型/题材梗/数字实感/高位信息差/AI禁词体检，一键导出素材卡。纯匿名本地运行。
// @author       121212165
// @match        https://fanqienovel.com/page/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  // ---------- 拆书规则（与 daoyu-studio / 女频导语 skill 同源） ----------
  const TROPES = [["重生", "重生"], ["穿越", "穿越"], ["穿书", "穿书"], ["真千金", "真假千金"], ["假千金", "真假千金"], ["替嫁", "替嫁"], ["冲喜", "冲喜"], ["追妻", "追妻火葬场"], ["断亲", "断亲"], ["闪婚", "闪婚"], ["马甲", "马甲"], ["攻略", "穿书攻略"], ["快穿", "快穿"], ["签到", "系统流"], ["系统", "系统流"], ["团宠", "团宠"], ["逃荒", "逃荒"], ["基建", "基建"], ["称帝", "女帝"], ["休夫", "休夫"], ["和离", "和离"]];
  const HOOKS = [["三天后", "倒计时钩"], ["日后", "倒计时钩"], ["月底", "倒计时钩"], ["直到", "悬念钩"], ["后来", "悬念钩"], ["却", "反转钩"], ["殊不知", "信息差钩"], ["不知道", "信息差钩"], ["他不知道", "信息差钩"], ["——", "画面钩"], ["没开", "沉默钩"], ["没拆", "沉默钩"], ["我笑了", "沉默钩"]];
  const HIGH_STATUS = ["皇帝", "王爷", "摄政王", "侯府", "丞相", "嫡", "公主", "太子", "国师", "总裁", "首富", "大佬", "真千金", "夫人", "圣女", "将军", "帝"];
  const AI_BANNED = ["猛地", "骤然", "陡然", "下意识", "怔住", "凝滞", "僵住", "极其", "十分", "非常", "格外", "异常", "无比", "仿佛", "似乎", "如同", "心里某个地方"];
  const NUM_REAL = /[一二两三四五六七八九十百千\d.]+[个年月日次万块章杯碗间道处场]/;

  function analyze(text) {
    const hits = [];
    const push = (ok, msg) => hits.push({ ok, msg });
    // 钩子类型
    const hooks = HOOKS.filter(([k]) => text.includes(k)).map(([, n]) => n);
    // 题材梗
    const tropes = TROPES.filter(([k]) => text.includes(k)).map(([, n]) => n);
    // 数字实感
    const nums = (text.match(new RegExp(NUM_REAL.source, "g")) || []);
    // 高位信息差
    const high = HIGH_STATUS.filter((w) => text.includes(w));
    // AI 禁词
    const ai = AI_BANNED.filter((w) => text.includes(w));
    // 对话/第一人称
    const hasDialog = /[「“]/.test(text);
    const firstPerson = text.includes("我");

    push(hooks.length > 0, `钩子：${hooks.length ? [...new Set(hooks)].join("、") : "未检出明确钩子（爆款简介末 1-3 句必有钩子）"}`);
    push(tropes.length > 0, `题材梗：${tropes.length ? tropes.join("、") : "无常见梗标记"}`);
    push(nums.length >= 2, `数字实感：${nums.length ? nums.slice(0, 5).join(" / ") : "无——爆款简介常用数字制造实感"}`);
    push(high.length > 0, `高位/信息差：${high.length ? [...new Set(high)].slice(0, 5).join("、") : "无高位身份词"}`);
    push(ai.length === 0, ai.length ? `❌ AI高频词：${ai.join("、")}（这本也会踩，可参考但别学）` : "无AI高频词 ✅");
    push(hasDialog, hasDialog ? "简介含对话/台词 ✅（爆款常见）" : "简介无对话");
    push(firstPerson, firstPerson ? "第一人称视角 ✅" : "第三人称视角");
    // 开头标签提取【】（）注记
    const meta = (text.match(/^[（【][^）】]{2,30}[）】]/g) || []);
    if (meta.length) hits.push({ ok: null, msg: `注记标签：${meta.join(" ")}` });
    return { hits, hooks, tropes, high, meta };
  }

  // ---------- 提取页面数据 ----------
  function extract() {
    const title = (document.querySelector("h1.info-name") || document.querySelector(".info-name h1") || {}).textContent || "";
    const author = (document.querySelector(".author-name-text") || {}).textContent || "";
    const labels = [...document.querySelectorAll(".info-label span")].map((s) => s.textContent.trim());
    const words = (document.querySelector(".info-count-word .detail") || {}).textContent || "";
    const absEl = document.querySelector(".page-abstract-content")
      || document.querySelector(".abstract-content-text")
      || document.querySelector(".page-body-abstract");
    const abstract = absEl ? absEl.innerText.trim() : "";
    return { title: title.trim(), author: author.trim(), labels, words, abstract, url: location.href };
  }

  // ---------- 面板 ----------
  const panel = document.createElement("div");
  panel.style.cssText = "position:fixed;right:16px;top:80px;z-index:99999;background:#fff;border:1px solid #ddd;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.15);padding:10px;width:250px;font:13px/1.5 system-ui,'Microsoft YaHei';color:#333;max-height:80vh;overflow-y:auto;";
  document.body.appendChild(panel);

  function render() {
    const d = extract();
    const a = analyze(d.abstract);
    const color = (ok) => ok === true ? "#0a0" : ok === false ? "#d33" : "#888";
    panel.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px">🔍 拆书助手</div>
      <div style="font-weight:600;margin-bottom:6px">《${d.title}》 ${d.author}</div>
      <div style="color:#666;font-size:12px;margin-bottom:6px">${d.labels.join(" · ")} ${d.words ? "· " + d.words + "万字" : ""}</div>
      <div style="border-top:1px solid #eee;padding-top:6px">
        ${a.hits.map((h) => `<div style="color:${color(h.ok)};font-size:12px;margin-bottom:3px">${h.ok === null ? "ℹ️" : h.ok ? "✅" : "⚠️"} ${h.msg}</div>`).join("")}
      </div>
      <button id="fba-copy" style="width:100%;margin-top:6px;padding:6px;border:0;border-radius:6px;background:#1f6feb;color:#fff;cursor:pointer">复制素材卡</button>`;
    document.getElementById("fba-copy").onclick = async () => {
      const firstHook = d.abstract.replace(/\s+/g, " ").slice(0, 60);
      const md = [
        "---",
        "tags: [素材卡, 扫榜, 拆书]",
        `genre: ${d.labels[1] || d.labels[0] || ""}`,
        `hook: ${firstHook}`,
        'ending: ""',
        `source: 番茄#详情页 ${d.status || d.labels[0] || ""} ${d.words || ""}字`,
        "---",
        "",
        `## 《${d.title}》 ${d.author}`,
        `- 标签：${d.labels.join(" / ")}`,
        `- 钩子：${[...new Set(a.hooks)].join("、") || "—"}`,
        `- 梗：${a.tropes.join("、") || "—"}`,
        `- 链接：${d.url}`,
        "",
        d.abstract,
        "",
      ].join("\n");
      try {
        await navigator.clipboard.writeText(md);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = md; ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
      }
      const btn = document.getElementById("fba-copy");
      btn.textContent = "✅ 已复制";
      setTimeout(() => (btn.textContent = "复制素材卡"), 1500);
    };
  }

  // SPA 场景兜底：稍等再渲染 + 路由变化重渲染
  render();
  let last = location.href;
  const mo = new MutationObserver(() => {
    if (location.href !== last) { last = location.href; setTimeout(render, 1200); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
