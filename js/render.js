/* ============================================================
   Mahim Katiyar — Portfolio
   Renders the whole page from data/content.json.

   Nothing here needs editing to update the site — change the
   JSON instead. Repos on GitHub that aren't listed in the JSON
   are appended to the archive grid automatically, so a new
   project shows up without a code change.
   ============================================================ */

window.Portfolio = (function () {
  "use strict";

  /* ---------- element helpers ----------
     `html()` is for copy written by hand in content.json, which may
     carry <strong>/<em>/<a>. `text()` is for anything that arrives
     from the GitHub API — never trust remote strings with innerHTML. */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function text(tag, cls, str) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    n.textContent = str == null ? "" : String(str);
    return n;
  }

  function tags(list) {
    var wrap = el("div", "tags");
    (list || []).forEach(function (t) { wrap.appendChild(text("span", "tag", t)); });
    return wrap;
  }

  function repoUrl(user, repo) {
    return "https://github.com/" + user + "/" + repo;
  }

  function extLink(href, label) {
    var a = text("a", null, label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function sectionHead(node, spec, withSub) {
    if (!node || !spec) return;
    node.appendChild(el("p", "sec-label reveal", spec.label));
    node.appendChild(el("h2", "sec-title reveal", spec.title));
    if (withSub && spec.sub) node.appendChild(el("p", "sec-sub reveal", spec.sub));
  }

  /* ---------- hero ---------- */
  function renderHero(data) {
    var host = document.getElementById("hero");
    if (!host) return;
    var p = data.profile;

    var badge = el("p", "badge rise rise-1");
    badge.appendChild(el("span", "dot"));
    badge.lastChild.setAttribute("aria-hidden", "true");
    badge.appendChild(document.createTextNode(p.badge));
    host.appendChild(badge);

    host.appendChild(text("h1", "rise rise-2", p.name));

    var role = el("p", "role rise rise-3");
    role.appendChild(text("span", "sr-only", (p.roles || []).join(" | ")));
    var live = el("span");
    live.setAttribute("aria-hidden", "true");
    live.appendChild(el("span", null, ""));
    live.firstChild.id = "typed";
    live.appendChild(el("span", "caret"));
    role.appendChild(live);
    host.appendChild(role);

    host.appendChild(el("p", "lede rise rise-4", p.intro));

    var links = el("div", "hero-links rise rise-5");
    var primary = text("a", "btn primary", "See my work");
    primary.href = "#projects";
    links.appendChild(primary);
    links.appendChild(extLink(repoUrl(p.githubUser, "").replace(/\/$/, ""), "GitHub"));
    links.appendChild(extLink(p.linkedin, "LinkedIn"));
    links.appendChild(extLink(p.leetcode, "LeetCode"));
    Array.prototype.slice.call(links.children, 1).forEach(function (a) { a.className = "btn"; });
    host.appendChild(links);

    var stats = el("div", "stats rise rise-6");
    (data.stats || []).forEach(function (s) {
      var box = el("div", "stat");
      var n = text("span", "n", s.value || "0");
      if (s.source) n.setAttribute("data-source", s.source);
      else if (!s.static) {
        n.setAttribute("data-count", s.value);
        if (s.decimals) n.setAttribute("data-decimals", String(s.decimals));
      }
      box.appendChild(n);
      box.appendChild(text("span", "k", s.label));
      stats.appendChild(box);
    });
    host.appendChild(stats);
  }

  /* ---------- projects ---------- */
  function featuredCard(item, index, user) {
    var card = el("article", "project reveal");
    card.style.setProperty("--i", index);

    var meta = el("div", "p-meta");
    meta.appendChild(text("span", "p-num", ("0" + (index + 1)).slice(-2)));
    meta.appendChild(text("span", "p-date", item.date || ""));
    card.appendChild(meta);

    var body = el("div", "p-body");
    body.appendChild(text("h3", null, item.title));
    body.appendChild(el("p", null, item.body || ""));
    body.appendChild(tags(item.tags));

    var links = el("div", "p-links");
    links.appendChild(extLink(item.url || repoUrl(user, item.repo), "GitHub ↗"));
    if (item.demo) links.appendChild(extLink(item.demo, "Live demo ↗"));
    body.appendChild(links);

    card.appendChild(body);
    return card;
  }

  function miniCard(item, index, user) {
    var card = el("a", "mini reveal");
    card.style.setProperty("--i", index);
    card.href = item.url || repoUrl(user, item.repo);
    card.target = "_blank";
    card.rel = "noopener";

    var top = el("div", "mini-top");
    top.appendChild(text("span", null, item.date || ""));
    var arrow = text("span", "arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    top.appendChild(arrow);
    card.appendChild(top);

    card.appendChild(text("h4", null, item.title));
    /* discovered entries carry remote text — keep those as textContent */
    card.appendChild(item.remote ? text("p", null, item.body) : el("p", null, item.body || ""));
    card.appendChild(tags(item.tags));
    return card;
  }

  function renderProjects(data) {
    var user = data.profile.githubUser;
    var spec = (data.sections || {}).projects || {};
    sectionHead(document.getElementById("projects-head"), spec, true);

    var list = document.getElementById("projects-list");
    (data.projects.featured || []).forEach(function (item, i) {
      list.appendChild(featuredCard(item, i, user));
    });

    var head = document.getElementById("archive-head");
    var grid = document.getElementById("archive-list");
    var archive = (data.projects.archive || []).slice();

    if (archive.length) {
      head.hidden = false;
      head.appendChild(text("h3", null, spec.archiveTitle || "More from GitHub"));
      head.appendChild(extLink("https://github.com/" + user + "?tab=repositories", "All repositories ↗"));
    }
    archive.forEach(function (item, i) { grid.appendChild(miniCard(item, i, user)); });

    return archive.length;
  }

  /* ---------- repos not yet described in the JSON ----------
     Anything public that isn't already on the page and isn't in
     projects.hide gets appended, using its GitHub description.
     A failed or rate-limited request is silent: the curated cards
     are already on the page, so the section still reads correctly. */
  function discover(data, startIndex) {
    if (!data.projects.autoDiscover) return Promise.resolve(0);
    var user = data.profile.githubUser;

    var known = {};
    ["featured", "archive"].forEach(function (k) {
      (data.projects[k] || []).forEach(function (p) { known[p.repo.toLowerCase()] = true; });
    });
    (data.projects.hide || []).forEach(function (n) { known[n.toLowerCase()] = true; });

    return fetch("https://api.github.com/users/" + user + "/repos?per_page=100&sort=pushed")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (repos) {
        if (!Array.isArray(repos)) return 0;
        var grid = document.getElementById("archive-list");
        var head = document.getElementById("archive-head");
        var added = 0;

        repos
          .filter(function (r) { return !r.fork && !r.archived && !known[r.name.toLowerCase()]; })
          .forEach(function (r) {
            var d = new Date(r.created_at);
            grid.appendChild(miniCard({
              url: r.html_url,
              date: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
              title: r.name.replace(/[-_]+/g, " ").trim(),
              body: r.description || "A recent project — open the repo for the walkthrough.",
              tags: [r.language].filter(Boolean),
              remote: true
            }, startIndex + added, user));
            added++;
          });

        if (added && head.hidden) {
          head.hidden = false;
          head.appendChild(text("h3", null, "More from GitHub"));
          head.appendChild(extLink("https://github.com/" + user + "?tab=repositories", "All repositories ↗"));
        }
        return added;
      })
      .catch(function () { return 0; });
  }

  /* ---------- experience ---------- */
  function renderExperience(data) {
    sectionHead(document.getElementById("experience-head"), (data.sections || {}).experience);
    var host = document.getElementById("experience-list");
    var user = data.profile.githubUser;

    (data.experience || []).forEach(function (role) {
      var row = el("div", "xp reveal");
      var meta = el("div", "p-meta");
      meta.appendChild(text("span", "p-date", role.date));
      row.appendChild(meta);

      var body = el("div");
      body.appendChild(text("h3", null, role.title));
      body.appendChild(text("p", "org", role.org));
      var ul = el("ul");
      (role.points || []).forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
      body.appendChild(ul);
      if (role.repo || role.url) {
        var links = el("div", "p-links");
        links.appendChild(extLink(role.url || repoUrl(user, role.repo), "GitHub ↗"));
        body.appendChild(links);
      }
      row.appendChild(body);
      host.appendChild(row);
    });
  }

  /* ---------- skills ---------- */
  function renderSkills(data) {
    sectionHead(document.getElementById("skills-head"), (data.sections || {}).skills);
    var host = document.getElementById("skills-list");
    (data.skills || []).forEach(function (group, i) {
      var box = el("div", "skill-group reveal");
      box.style.setProperty("--i", i);
      box.appendChild(text("h3", null, group.group));
      box.appendChild(tags(group.items));
      host.appendChild(box);
    });
  }

  /* ---------- education + leadership ---------- */
  function renderRows(headId, listId, spec, rows) {
    sectionHead(document.getElementById(headId), spec);
    var host = document.getElementById(listId);
    (rows || []).forEach(function (r) {
      var row = el("div", "row reveal");
      row.appendChild(text("div", "row-date", r.date));
      var body = el("div");
      body.appendChild(text("h3", null, r.title));
      body.appendChild(el("p", null, r.body || ""));
      row.appendChild(body);
      host.appendChild(row);
    });
  }

  /* ---------- contact + footer ---------- */
  function renderContact(data) {
    var p = data.profile;
    var spec = (data.sections || {}).contact || {};
    var label = document.getElementById("contact-label");
    if (label) label.textContent = spec.label || "Contact";

    var host = document.getElementById("contact-body");
    host.appendChild(el("p", "big reveal", spec.big || ""));
    host.appendChild(el("p", "reveal", spec.sub || ""));

    var links = el("div", "contact-links reveal");
    var mail = text("a", "btn", p.email);
    mail.href = "mailto:" + p.email;
    links.appendChild(mail);
    var tel = text("a", "btn", p.phone);
    tel.href = "tel:" + p.phoneHref;
    links.appendChild(tel);
    links.appendChild(extLink("https://github.com/" + p.githubUser, "github.com/" + p.githubUser));
    links.appendChild(extLink(p.linkedin, p.linkedinLabel));
    links.appendChild(extLink(p.leetcode, p.leetcodeLabel));
    Array.prototype.slice.call(links.children).forEach(function (a) { a.className = "btn"; });
    host.appendChild(links);

    var foot = document.getElementById("foot-name");
    if (foot) foot.textContent = "© " + new Date().getFullYear() + " " + p.name;
    var loc = document.getElementById("foot-loc");
    if (loc) loc.textContent = p.location || "";
  }

  /* ---------- stats that count what's actually on the page ---------- */
  function fillDerivedStats() {
    var projects = document.querySelectorAll(".project").length +
                   document.querySelectorAll(".mini").length;
    var demos = 0;
    document.querySelectorAll(".p-links a").forEach(function (a) {
      if (/live demo/i.test(a.textContent)) demos++;
    });
    var map = { projectCount: projects, demoCount: demos };
    document.querySelectorAll(".stat .n[data-source]").forEach(function (n) {
      var v = map[n.getAttribute("data-source")];
      if (v == null) return;
      n.setAttribute("data-count", String(v));
      n.textContent = String(v);
    });
  }

  /* ---------- entry point ---------- */
  function build() {
    return fetch("data/content.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("content.json returned " + r.status);
        return r.json();
      })
      .then(function (data) {
        renderHero(data);
        var archiveCount = renderProjects(data);
        renderExperience(data);
        renderSkills(data);
        renderRows("education-head", "education-list", (data.sections || {}).education, data.education);
        renderRows("leadership-head", "leadership-list", (data.sections || {}).leadership, data.leadership);
        renderContact(data);
        fillDerivedStats();

        /* discovery is best-effort and must not hold up the page */
        discover(data, archiveCount).then(function (added) {
          if (!added) return;
          fillDerivedStats();
          document.dispatchEvent(new CustomEvent("portfolio:cards-added"));
        });
        return data;
      });
  }

  return { build: build };
})();
