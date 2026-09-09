/* Interactions for the sections that grade, light up, or quiz:
   citation marks (the hallucination section), the scale slider, and the failure quiz
   (the limits section). Plain DOM, no dependencies. */

(function () {
  "use strict";

  /* ---------- Hallucination section: mark the citations, then check ---------- */

  var citeDemo = document.querySelector('[data-demo="citations"]');
  if (citeDemo) {
    var cards = Array.prototype.slice.call(citeDemo.querySelectorAll(".cite-card"));
    var checkBtn = document.getElementById("cite-check");
    var resetBtn = document.getElementById("cite-reset");
    var caption = document.getElementById("cite-caption");
    var captionDefault = caption ? caption.textContent : "";

    cards.forEach(function (card) {
      var marks = Array.prototype.slice.call(card.querySelectorAll("[data-mark]"));
      marks.forEach(function (btn) {
        btn.addEventListener("click", function () {
          marks.forEach(function (b) {
            b.classList.remove("is-chosen");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("is-chosen");
          btn.setAttribute("aria-pressed", "true");
        });
      });
    });

    if (checkBtn) {
      checkBtn.addEventListener("click", function () {
        var correct = 0;
        var answered = 0;
        cards.forEach(function (card) {
          var really = card.getAttribute("data-real") === "true";
          var why = card.getAttribute("data-why") || "";
          var chosen = card.querySelector("[data-mark].is-chosen");
          var verdict = card.querySelector(".cite-verdict");
          card.classList.remove("is-right", "is-wrong", "is-unanswered");
          verdict.hidden = false;
          if (!chosen) {
            card.classList.add("is-unanswered");
            verdict.textContent = really
              ? "Unmarked. This one is real."
              : "Unmarked. This one is fabricated. " + why;
            return;
          }
          answered++;
          var saidReal = chosen.getAttribute("data-mark") === "true";
          if (saidReal === really) {
            correct++;
            card.classList.add("is-right");
            verdict.textContent = really
              ? "Right: real, straight from the bootcamp's reading list."
              : "Caught. " + why;
          } else {
            card.classList.add("is-wrong");
            verdict.textContent = really
              ? "This one is real; it's on the bootcamp's reading list."
              : "This one is fabricated. " + why;
          }
        });
        if (caption) {
          var opener = answered < cards.length
            ? "You marked " + answered + " of " + cards.length + " and caught " + correct + "."
            : "You caught " + correct + " of " + cards.length + ".";
          caption.textContent = opener + " From inside the model, every citation is equally fluent. Fluency is its native output, so fluency can never be your evidence. Checking each reference against the primary source is the habit that catches fakes; Part B turns that habit into concrete rules.";
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        cards.forEach(function (card) {
          card.classList.remove("is-right", "is-wrong", "is-unanswered");
          card.querySelectorAll("[data-mark]").forEach(function (b) {
            b.classList.remove("is-chosen");
            b.setAttribute("aria-pressed", "false");
          });
          var verdict = card.querySelector(".cite-verdict");
          verdict.hidden = true;
          verdict.textContent = "";
        });
        if (caption) caption.textContent = captionDefault;
      });
    }
  }

  /* ---------- The scale slider ---------- */

  var scaleSlider = document.getElementById("scale-slider");
  if (scaleSlider) {
    var scaleReadout = document.getElementById("scale-readout");
    var scaleCards = Array.prototype.slice.call(document.querySelectorAll(".scale-card"));

    function humanCount(exponent) {
      var value = Math.pow(10, exponent);
      function fmt(divisor, unit) {
        var n = value / divisor;
        return (n >= 10 ? Math.round(n) : n.toFixed(1)) + " " + unit;
      }
      if (value >= 1e12) return fmt(1e12, "trillion");
      if (value >= 1e9) return fmt(1e9, "billion");
      if (value >= 1e6) return fmt(1e6, "million");
      if (value >= 1e3) return fmt(1e3, "thousand");
      return String(Math.round(value));
    }

    function updateScale() {
      var v = parseFloat(scaleSlider.value);
      scaleReadout.textContent = humanCount(v);
      scaleCards.forEach(function (card) {
        card.classList.toggle("is-on", v >= parseFloat(card.getAttribute("data-exp")));
      });
    }

    scaleSlider.addEventListener("input", updateScale);
    updateScale();
  }

  /* ---------- Hallucination section: the inline reference marks jump to their cards ---------- */

  Array.prototype.slice.call(document.querySelectorAll(".cite-ref")).forEach(function (ref) {
    ref.addEventListener("click", function () {
      var num = ref.getAttribute("data-ref");
      var card = document.querySelector('.cite-card[data-ref="' + num + '"]');
      if (!card) return;
      card.scrollIntoView({ block: "center" });
      card.classList.add("is-flash");
      setTimeout(function () { card.classList.remove("is-flash"); }, 1200);
    });
  });

  /* ---------- Limits section: which idea explains it ---------- */

  Array.prototype.slice.call(document.querySelectorAll(".quiz-q")).forEach(function (q) {
    var answer = q.getAttribute("data-answer");
    var verdict = q.querySelector(".quiz-verdict");
    var choices = Array.prototype.slice.call(q.querySelectorAll("[data-choice]"));

    choices.forEach(function (btn) {
      btn.addEventListener("click", function () {
        choices.forEach(function (b) {
          b.disabled = true;
          b.classList.remove("is-chosen");
        });
        btn.classList.add("is-chosen");
        var pick = btn.getAttribute("data-choice");
        var why = verdict.getAttribute("data-why") || "";
        verdict.hidden = false;
        q.classList.remove("is-right", "is-wrong");
        var right = q.querySelector('[data-choice="' + answer + '"]');
        if (pick === answer) {
          q.classList.add("is-right");
          verdict.textContent = "Right. " + why;
        } else {
          q.classList.add("is-wrong");
          right.classList.add("is-answer");
          var label = right ? right.textContent.trim() : "a different beat";
          verdict.textContent = "Close. The answer is " + label + ". " + why;
        }
      });
    });

    q._resetQuiz = function () {
      choices.forEach(function (b) {
        b.disabled = false;
        b.classList.remove("is-chosen", "is-answer");
      });
      q.classList.remove("is-right", "is-wrong");
      verdict.hidden = true;
      verdict.textContent = "";
    };
  });

  var quizReset = document.getElementById("quiz-reset");
  if (quizReset) {
    quizReset.addEventListener("click", function () {
      Array.prototype.slice.call(document.querySelectorAll(".quiz-q")).forEach(function (q) {
        q._resetQuiz();
      });
    });
  }
})();
