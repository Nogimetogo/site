const slides = [...document.querySelectorAll(".hero-slide")];
const links = [...document.querySelectorAll(".nav-links a")];
const mobileNav = document.querySelector(".mobile-nav");
const menuButton = document.querySelector(".menu-button");
const prevButton = document.querySelector(".hero-controls .prev");
const nextButton = document.querySelector(".hero-controls .next");
const toggleButton = document.querySelector(".hero-controls .toggle");

let current = 0;
let playing = true;
let timer = window.setInterval(showNext, 5200);

function showSlide(index) {
  slides[current].classList.remove("is-active");
  current = (index + slides.length) % slides.length;
  slides[current].classList.add("is-active");
}

function showNext() {
  showSlide(current + 1);
}

function restartTimer() {
  window.clearInterval(timer);
  if (playing) {
    timer = window.setInterval(showNext, 5200);
  }
}

prevButton.addEventListener("click", () => {
  showSlide(current - 1);
  restartTimer();
});

nextButton.addEventListener("click", () => {
  showNext();
  restartTimer();
});

toggleButton.addEventListener("click", () => {
  playing = !playing;
  toggleButton.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
  toggleButton.classList.toggle("is-paused", !playing);
  restartTimer();
});

menuButton.addEventListener("click", () => {
  const open = !mobileNav.classList.contains("is-open");
  mobileNav.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mobileNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    links.forEach((link) => {
      link.classList.toggle("is-current", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { threshold: [0.28, 0.5, 0.7] }
);

document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));
