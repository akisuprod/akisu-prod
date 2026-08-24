(function () {
  "use strict";

  var audio = new Audio();
  audio.preload = "none";

  var tracks = Array.prototype.slice.call(document.querySelectorAll(".track"));
  var current = null;

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function fillOf(li) { return li.querySelector(".track__fill"); }
  function timeOf(li) { return li.querySelector(".track__time"); }
  function fullTimeOf(li) { return li.dataset.fullTime || "0:00"; }

  function selectTrack(li) {
    if (current === li) return;
    if (current) {
      current.classList.remove("is-active", "is-playing");
      fillOf(current).style.width = "0%";
      timeOf(current).textContent = fullTimeOf(current);
    }
    current = li;
    current.classList.add("is-active");
    audio.src = li.getAttribute("data-src");
  }

  function playTrack(li) {
    selectTrack(li);
    audio.play().then(function () {
      li.classList.add("is-playing");
    }).catch(function () {
      li.classList.remove("is-playing");
    });
  }

  function pause() {
    audio.pause();
    if (current) current.classList.remove("is-playing");
  }

  tracks.forEach(function (li) {
    li.dataset.fullTime = timeOf(li).textContent;

    var btn = li.querySelector(".track__btn");
    var bar = li.querySelector(".track__bar");

    btn.addEventListener("click", function () {
      if (current === li && !audio.paused) {
        pause();
      } else {
        playTrack(li);
      }
    });

    bar.addEventListener("click", function (e) {
      if (current !== li || !isFinite(audio.duration)) return;
      var rect = bar.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      ratio = Math.min(1, Math.max(0, ratio));
      audio.currentTime = ratio * audio.duration;
    });
  });

  audio.addEventListener("timeupdate", function () {
    if (!current || !isFinite(audio.duration)) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    fillOf(current).style.width = pct + "%";
    timeOf(current).textContent = fmt(audio.duration - audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", function () {
    if (current) timeOf(current).textContent = fmt(audio.duration);
  });

  audio.addEventListener("ended", function () {
    if (!current) return;
    current.classList.remove("is-playing");
    fillOf(current).style.width = "0%";
    timeOf(current).textContent = fmt(audio.duration);
  });

  audio.addEventListener("pause", function () {
    if (current) current.classList.remove("is-playing");
  });

  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    var shareData = {
      title: "AKISU — Polarity",
      text: "Listen to Polarity by AKISU",
      url: location.href
    };
    shareBtn.addEventListener("click", function () {
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          var label = shareBtn.querySelector("span");
          var original = label.textContent;
          label.textContent = "Copied!";
          setTimeout(function () { label.textContent = original; }, 1600);
        }).catch(function () {});
      }
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
