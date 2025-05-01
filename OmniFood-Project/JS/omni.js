"use strict";
// https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js
///////////////////////////////////////////////////////////
// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
  var flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";

  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));

  document.body.appendChild(flex);
  var isSupported = flex.scrollHeight === 1;
  flex.parentNode.removeChild(flex);
  console.log(isSupported);

  if (!isSupported) document.body.classList.add("no-flexbox-gap");
}
checkFlexGap();

console.log("hello world");
// copyright date modify
const yearEle = document.querySelector(".year");
yearEle.textContent = new Date().getFullYear();

// Mobile navigation
const menuBtn = document.querySelector(".menu-btn");
const header = document.querySelector(".header-flex");
menuBtn.addEventListener("click", function (e) {
  header.classList.toggle("nav-open");
});

// smooth scooling animation
const links = document.querySelectorAll("a:link");
// console.log(links);

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const hrefs = link.getAttribute("href");
    console.log(hrefs);

    if (hrefs === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    // other links
    if (hrefs != "#" && hrefs.startsWith("#")) {
      const sectionEl = document.querySelector(hrefs);
      sectionEl.scrollIntoView({ behavior: "smooth" });
    }
    //  mobile nav remove
    if (link.classList.contains("li-link")) header.classList.toggle("nav-open");
  });
});

// sticky navigation
const hero = document.querySelector(".section-1");
const obs = new IntersectionObserver(
  function (entries) {
    const entry = entries[0];
    console.log(entry);
    if (entry.isIntersecting === false) {
      document.body.classList.add("sticky");
    }
    if (entry.isIntersecting === true) {
      document.body.classList.remove("sticky");
    }
  },
  {
    root: null,
    threshold: 0,
    rootMargin: "-80px",
  }
);
obs.observe(hero);
