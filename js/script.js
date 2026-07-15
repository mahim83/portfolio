/* ============================================================
   Mahim Katiyar — Portfolio
   Scroll reveals + ambient EEG trace in the hero.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    var stored = null;
    try { stored = localStorage.getItem("theme"); } catch (e) {}
    var initial = (stored === "dark" || stored === "light")
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", initial);
    toggle.setAttribute("aria-pressed", String(initial === "dark"));

    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      try { localStorage.setItem("theme", next); } catch (e) {}
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
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
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

  /* ---------- ambient EEG trace ---------- */
  var canvas = document.getElementById("eeg");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var w = 0, h = 0, dpr = 1, raf = null, t = 0;

  function colors() {
    var s = getComputedStyle(document.documentElement);
    return {
      a: s.getPropertyValue("--trace-a").trim() || "rgba(229,162,63,0.5)",
      b: s.getPropertyValue("--trace-b").trim() || "rgba(143,165,161,0.28)"
    };
  }
  var col = colors();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* EEG-like waveform: slow drift + mid ripple + high-freq bursts */
  function sig(x, time, p) {
    var slow = Math.sin(x * p.f1 + time * p.v1);
    var mid = Math.sin(x * p.f2 - time * p.v2 + p.ph);
    var env = (Math.sin(x * p.bf + time * p.bv) + 1) / 2;
    env = env * env * env; /* sharpen into bursts */
    var burst = Math.sin(x * p.f3 + time * p.v3) * env;
    return (slow * 0.45 + mid * 0.3 + burst * 0.9) * p.amp;
  }

  var traces = [
    { y: 0.30, amp: 14, f1: 0.006, v1: 0.4, f2: 0.021, v2: 0.9, ph: 1.7, f3: 0.09, v3: 2.2, bf: 0.004, bv: 0.23, color: "b", lw: 1 },
    { y: 0.52, amp: 22, f1: 0.005, v1: 0.5, f2: 0.017, v2: 1.1, ph: 0.3, f3: 0.11, v3: 2.6, bf: 0.003, bv: 0.31, color: "a", lw: 1.5 },
    { y: 0.74, amp: 12, f1: 0.007, v1: 0.35, f2: 0.024, v2: 0.8, ph: 4.1, f3: 0.08, v3: 1.9, bf: 0.005, bv: 0.19, color: "b", lw: 1 }
  ];

  function draw() {
    ctx.clearRect(0, 0, w, h);
    traces.forEach(function (p) {
      ctx.beginPath();
      var base = h * p.y;
      for (var x = 0; x <= w; x += 3) {
        var y = base + sig(x, t, p);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = p.color === "a" ? col.a : col.b;
      ctx.lineWidth = p.lw;
      ctx.stroke();
    });
  }

  function loop() {
    t += 0.016;
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    col = colors();
    if (raf) cancelAnimationFrame(raf);
    if (reduced.matches) { draw(); }
    else { raf = requestAnimationFrame(loop); }
  }

  window.addEventListener("resize", start);
  if (reduced.addEventListener) reduced.addEventListener("change", start);

  /* re-read palette when the theme flips (OS or manual toggle) */
  var scheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (scheme.addEventListener) scheme.addEventListener("change", start);
  new MutationObserver(start).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* pause when the hero is off-screen */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!raf && !reduced.matches) raf = requestAnimationFrame(loop); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }).observe(canvas);
  }

  start();
})();
