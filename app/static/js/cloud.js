/* The interpolation cloud for Beat 5.
   Draws two distributions of "text": the small cluster is one researcher's
   career of reading, the wide cloud is the model's training distribution.
   The ask button drops a query question into the big cloud, because that is
   where seemingly out-of-the-ordinary questions actually live for the model. */

(function () {
  "use strict";

  var svg = document.getElementById("cloud-svg");
  if (!svg) return;

  var bigGroup = document.getElementById("cloud-big");
  var smallGroup = document.getElementById("cloud-small");
  var queryGroup = document.getElementById("cloud-queries");
  var askButton = document.getElementById("cloud-ask");
  var clearButton = document.getElementById("cloud-clear");

  /* Seeded RNG so the cloud looks identical on every load and every machine.
     The lesson is about the shape of the distributions, so the shape must be
     stable while you are talking about it. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rng = mulberry32(42);

  function gaussian(mean, sd) {
    var u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function addDot(group, cx, cy, r, cls) {
    group.appendChild(svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: r, "class": cls }));
  }

  /* The training distribution: several dense lobes spread across the canvas,
     the way real text piles up around a few huge topics with long tails. */
  var lobes = [
    { x: 480, y: 150, sx: 70, sy: 48, n: 120 },
    { x: 620, y: 220, sx: 85, sy: 55, n: 130 },
    { x: 750, y: 150, sx: 60, sy: 40, n: 100 },
    { x: 560, y: 320, sx: 75, sy: 42, n: 110 },
    { x: 700, y: 330, sx: 65, sy: 38, n: 95 },
    { x: 810, y: 240, sx: 40, sy: 60, n: 80 },
    { x: 420, y: 260, sx: 40, sy: 55, n: 70 },
    { x: 800, y: 105, sx: 35, sy: 22, n: 45 },
    { x: 640, y: 60, sx: 45, sy: 18, n: 40 }
  ];

  lobes.forEach(function (lobe) {
    for (var i = 0; i < lobe.n; i++) {
      addDot(
        bigGroup,
        gaussian(lobe.x, lobe.sx),
        gaussian(lobe.y, lobe.sy),
        (2 + rng() * 1.6).toFixed(1),
        "pt-big"
      );
    }
  });

  /* One career of reading: dense, small, and complete in itself. */
  for (var j = 0; j < 48; j++) {
    addDot(
      smallGroup,
      gaussian(150, 26),
      gaussian(225, 30),
      (2.2 + rng() * 1.4).toFixed(1),
      "pt-small"
    );
  }

  /* Ask a question: it lands somewhere in the big cloud, every time, including
     out toward the edges where the questions that feel novel to us live. */
  var MAX_QUERIES = 12;
  var cloudCaption = document.getElementById("cloud-caption");

  function pickPointInCloud() {
    var lobe = lobes[Math.floor(rng() * lobes.length)];
    return {
      x: gaussian(lobe.x, lobe.sx * 1.6),
      y: gaussian(lobe.y, lobe.sy * 1.6),
      lobe: lobe
    };
  }

  if (askButton) {
    askButton.addEventListener("click", function () {
      var p = pickPointInCloud();
      var dot = svgEl("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 5, "class": "pt-query" });
      queryGroup.appendChild(dot);
      while (queryGroup.childNodes.length > MAX_QUERIES) {
        queryGroup.removeChild(queryGroup.firstChild);
      }
      if (cloudCaption) {
        var dx = (p.x - p.lobe.x) / p.lobe.sx;
        var dy = (p.y - p.lobe.y) / p.lobe.sy;
        var edge = Math.sqrt(dx * dx + dy * dy) > 1.6;
        cloudCaption.textContent = edge
          ? "Landed out toward the edge of the cloud, and still inside it. This is the region where your questions feel novel and the model's library says: seen it."
          : "Landed deep inside the cloud, surrounded by the patterns it read. In-distribution for the model, however unusual it felt to ask.";
      }
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      while (queryGroup.firstChild) queryGroup.removeChild(queryGroup.firstChild);
    });
  }
})();
