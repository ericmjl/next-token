/* Stage navigation for teaching: theme toggle, keyboard beat-jumping,
   presenter mode, and the rail highlight that follows the scroll. */

(function () {
  "use strict";

  /* ---------- theme ---------- */

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      toggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      try { localStorage.setItem("bootcamp-theme", next); } catch (e) {}
    });
  }

  /* ---------- beat jumping ---------- */

  var beats = Array.prototype.slice.call(document.querySelectorAll("section.beat"));

  function currentBeatIndex() {
    var focus = window.scrollY + window.innerHeight * 0.35;
    for (var i = beats.length - 1; i >= 0; i--) {
      if (beats[i].offsetTop <= focus) return i;
    }
    return 0;
  }

  function jump(delta) {
    if (!beats.length) return;
    var target = Math.min(Math.max(currentBeatIndex() + delta, 0), beats.length - 1);
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    beats[target].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function isTyping(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  document.addEventListener("keydown", function (e) {
    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight":
      case "j":
      case "J":
        e.preventDefault();
        jump(1);
        break;
      case "ArrowLeft":
      case "k":
      case "K":
        e.preventDefault();
        jump(-1);
        break;
      case "p":
      case "P":
        e.preventDefault();
        setPresenter(document.body.classList.toggle("presenter"));
        break;
    }
  });

  /* ---------- presenter mode ---------- */

  var presenterButton = document.getElementById("presenter-toggle");

  function setPresenter(on) {
    document.documentElement.classList.toggle("presenter", on);
    if (presenterButton) presenterButton.setAttribute("aria-pressed", on ? "true" : "false");
  }

  if (presenterButton) {
    presenterButton.addEventListener("click", function () {
      setPresenter(document.body.classList.toggle("presenter"));
    });
  }

  /* ---------- rail highlight ---------- */

  var links = {};
  document.querySelectorAll(".rail-list a[data-beat]").forEach(function (a) {
    links[a.getAttribute("data-beat")] = a;
  });

  if ("IntersectionObserver" in window && beats.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Object.keys(links).forEach(function (id) {
            links[id].classList.toggle("is-active", id === entry.target.id);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    beats.forEach(function (b) { observer.observe(b); });
  }

  /* ---------- htmx feedback: loading state and a voice when the server fails ---------- */

  document.body.addEventListener("htmx:beforeRequest", function (e) {
    var t = e.detail.target;
    if (t && t.classList && t.classList.contains("demo-out")) t.classList.add("is-loading");
  });
  document.body.addEventListener("htmx:afterRequest", function (e) {
    var t = e.detail.target;
    if (t && t.classList) t.classList.remove("is-loading");
  });
  document.body.addEventListener("htmx:responseError", function (e) {
    var t = e.detail.target;
    if (t) t.innerHTML = '<p class="demo-note">The model server did not answer that one. Give it another try.</p>';
  });
  document.body.addEventListener("htmx:sendError", function (e) {
    var t = e.detail.target;
    if (t) t.innerHTML = '<p class="demo-note">The model server is unreachable. Check the connection, then try again.</p>';
  });
})();
