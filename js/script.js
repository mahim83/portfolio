/* ============================================================
   Mahim Katiyar — Portfolio
   Behaviour layer. The page itself is built by js/render.js from
   data/content.json; everything here runs once that's on screen.
   ============================================================ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- theme toggle (dark by default) ----------
     Independent of the content, so it's wired up straight away. */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    var stored = null;
    try { stored = localStorage.getItem("theme"); } catch (e) {}
    var initial = stored === "light" ? "light" : "dark";
    root.setAttribute("data-theme", initial);
    toggle.setAttribute("aria-pressed", String(initial === "dark"));

    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- reading-progress bar ---------- */
  function initProgress() {
    var bar = document.getElementById("progress");
    if (!bar) return;
    var ticking = false;
    var paint = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ---------- typed role line: titles appear one by one ---------- */
  function initTyped(phrases) {
    var typedEl = document.getElementById("typed");
    if (!typedEl || !phrases || !phrases.length) return;

    if (reduced.matches) {
      typedEl.textContent = phrases.join(" | ");
      return;
    }
    var pi = 0, ci = 0, deleting = false;
    var typeTick = function () {
      var word = phrases[pi];
      if (!deleting) {
        ci++;
        typedEl.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(typeTick, 1800); return; }
        setTimeout(typeTick, 70);
      } else {
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typeTick, 400); return; }
        setTimeout(typeTick, 35);
      }
    };
    setTimeout(typeTick, 1000); /* start after the hero load sequence */
  }

  /* ---------- hero stats count up once ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".stat .n[data-count]");
    if (!counters.length || reduced.matches) return;
    counters.forEach(function (el) {
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var start = null, dur = 1100;
      var step = function (ts) {
        /* read the target every frame: repos discovered from the GitHub
           API can raise the project count while this is still running */
        var target = parseFloat(el.getAttribute("data-count"));
        if (isNaN(target)) return;
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3); /* ease-out cubic */
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) window.requestAnimationFrame(step);
        else el.textContent = target.toFixed(decimals);
      };
      window.requestAnimationFrame(step);
    });
  }

  /* ---------- scrollspy: highlight the section in view ---------- */
  function initScrollspy() {
    var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!navLinks.length || !("IntersectionObserver" in window)) return;
    var linkById = {};
    navLinks.forEach(function (l) { linkById[l.getAttribute("href").slice(1)] = l; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        linkById[e.target.id].classList.add("active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(linkById).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- scroll reveal ----------
     Re-runnable: repos discovered from the GitHub API land after the
     first pass, and observing an element twice is a no-op. */
  var revealObserver = null;
  function observeReveals() {
    if (reduced.matches || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
    }
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- write-to-me form ----------
     No backend on a static site, so the form composes the email in the
     visitor's mail app via mailto:. To switch to a form service instead
     (e.g. Formspree), set FORM_ENDPOINT to your endpoint URL. */
  var FORM_ENDPOINT = ""; /* e.g. "https://formspree.io/f/yourid" */

  function initForm(toAddress) {
    var form = document.getElementById("write-form");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var note = document.getElementById("form-note");
      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var msg = document.getElementById("cf-msg").value.trim();

      if (FORM_ENDPOINT) {
        note.textContent = "Sending…";
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, email: email, message: msg })
        }).then(function (res) {
          if (res.ok) { note.textContent = "Sent — thanks! I'll get back to you soon."; form.reset(); }
          else { note.textContent = "Couldn't send right now — email me directly instead."; }
        }).catch(function () {
          note.textContent = "Couldn't send right now — email me directly instead.";
        });
        return;
      }

      var subject = "Portfolio message from " + name;
      var body = "Hi " + (toAddress.split("@")[0] || "there") + ",\n\n" + msg + "\n\n— " + name + " (" + email + ")";
      window.location.href = "mailto:" + toAddress +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      note.textContent = "Opening your email app — press send there to deliver it.";
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("portfolio:cards-added", observeReveals);

  window.Portfolio.build().then(function (data) {
    initProgress();
    initTyped(data.profile.roles);
    initCounters();
    initScrollspy();
    observeReveals();
    initForm(data.profile.email);
  }).catch(function (err) {
    /* If content.json can't be loaded the page would otherwise be blank,
       so say what happened rather than showing an empty shell. */
    if (window.console) console.error("Could not load data/content.json:", err);
    var hero = document.getElementById("hero");
    if (hero && !hero.children.length) {
      hero.innerHTML =
        '<h1>Mahim Katiyar</h1>' +
        '<p class="lede">This page could not load its content file. ' +
        'Reach me at <a href="mailto:mahimkatiyar83@gmail.com">mahimkatiyar83@gmail.com</a> ' +
        'or see the work at <a href="https://github.com/mahim83">github.com/mahim83</a>.</p>';
    }
    initProgress();
  });
})();
