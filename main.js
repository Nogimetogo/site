const slides = [...document.querySelectorAll(".hero-slide")];
const links = [...document.querySelectorAll(".primary-nav a")];
const primaryNav = document.querySelector(".primary-nav");
const menuButton = document.querySelector(".menu-button");
const heroClickTarget = document.querySelector(".hero-click-target");
const galleryGrid = document.querySelector(".masonry-grid");
const categoryButtons = [...document.querySelectorAll(".category-tabs button")];
const projects = [
  ...(window.photographProjects || []),
  ...(window.nogimeProjects || []),
  ...(window.architectureProjects || [])
];

const supportsIntersectionObserver = "IntersectionObserver" in window;
let currentSlide = 0;
let slideTimer = window.setInterval(showNextSlide, 5000);

function showSlide(index) {
  slides[currentSlide].classList.remove("is-active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("is-active");
}

function showNextSlide() {
  showSlide(currentSlide + 1);
}

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(showNextSlide, 5000);
}

function assetUrl(path, prefix = "./") {
  if (!path) return "";
  if (/^(https?:|data:|\.\/|\.\.\/|\/)/.test(path)) return path;
  return `${prefix}${path}`;
}

function renderProjects(category) {
  galleryGrid.innerHTML = "";

  projects
    .filter((project) => project.category === category)
    .forEach((project) => {
      const card = project.url ? document.createElement("a") : document.createElement("figure");
      card.className = ["work-card", "reveal", project.variant].filter(Boolean).join(" ");

      if (project.url) {
        card.href = project.url;
        card.setAttribute("aria-label", `${project.title} project page`);
      }

      const img = document.createElement("img");
      img.src = assetUrl(project.cover || project.image);
      img.alt = project.title;

      const caption = document.createElement("figcaption");
      caption.innerHTML = `<strong>${project.title}</strong><span>${project.category} / ${project.year}</span>`;

      card.append(img, caption);
      galleryGrid.append(card);
      revealObserver.observe(card);
    });
}

heroClickTarget.addEventListener("click", () => {
  showNextSlide();
  restartSlideTimer();
});

menuButton.addEventListener("click", () => {
  const open = !primaryNav.classList.contains("is-open");
  primaryNav.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    primaryNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderProjects(button.dataset.category);
  });
});

const navObserver = supportsIntersectionObserver
  ? new IntersectionObserver(
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
    )
  : null;

const revealObserver = supportsIntersectionObserver
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    )
  : {
      observe(item) {
        item.classList.add("is-visible");
      },
      unobserve() {}
    };

document.documentElement.classList.add("reveal-ready");

if (navObserver) {
  document.querySelectorAll("section[id]").forEach((section) => navObserver.observe(section));
}
document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
const requestedCategory = new URLSearchParams(window.location.search).get("category");
const initialCategory = categoryButtons.some((button) => button.dataset.category === requestedCategory)
  ? requestedCategory
  : "Photograph";

categoryButtons.forEach((button) => {
  button.classList.toggle("is-active", button.dataset.category === initialCategory);
});

renderProjects(initialCategory);
