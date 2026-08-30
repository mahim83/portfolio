/* ============================================================
   Mahim Katiyar — Portfolio
   Theme toggle, scroll progress, scrollspy, scroll reveals,
   typed role line, hero stat count-up, and the contact form.
   ============================================================ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- theme toggle (dark by default) ---------- */
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
  var bar = document.getElementById("progress");
  if (bar) {
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
  var typedEl = document.getElementById("typed");
  if (typedEl) {
    var phrases = ["Machine Learning Engineer", "Generative AI Developer", "Backend Developer"];
    if (reduced.matches) {
      typedEl.textContent = phrases.join(" | ");
    } else {
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
  }

  /* ---------- hero stats count up once on load ---------- */
  var counters = document.querySelectorAll(".stat .n[data-count]");
  if (counters.length && !reduced.matches) {
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (isNaN(target)) return;
      var start = null, dur = 1100;
      var step = function (ts) {
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
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
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

  /* ---------- scroll reveal ---------- */
  if (!reduced.matches && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- write-to-me form ----------
     No backend on a static site, so the form composes the email in the
     visitor's mail app via mailto:. To switch to a form service instead
     (e.g. Formspree), set FORM_ENDPOINT to your endpoint URL. */
  var FORM_ENDPOINT = ""; /* e.g. "https://formspree.io/f/yourid" */
  var TO_ADDRESS = "mahimkatiyar83@gmail.com";

  var form = document.getElementById("write-form");
  if (form) {
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
      var body = "Hi Mahim,\n\n" + msg + "\n\n— " + name + " (" + email + ")";
      window.location.href = "mailto:" + TO_ADDRESS +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      note.textContent = "Opening your email app — press send there to deliver it.";
    });
  }
})();
