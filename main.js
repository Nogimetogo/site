const slides = [...document.querySelectorAll(".hero-slide")];
const links = [...document.querySelectorAll(".primary-nav a")];
const primaryNav = document.querySelector(".primary-nav");
const menuButton = document.querySelector(".menu-button");
const heroClickTarget = document.querySelector(".hero-click-target");
const heroTitle = document.querySelector("[data-hero-title]");
const galleryGrid = document.querySelector(".masonry-grid");
const architectureCounter = document.querySelector(".architecture-counter");
const architectureAreaCounter = document.querySelector("[data-counter-area]");
const architectureCostCounter = document.querySelector("[data-counter-cost]");
const architecturePhotographCounter = document.querySelector("[data-counter-photograph]");
const counterMetrics = [...document.querySelectorAll("[data-counter-category]")];
const categoryButtons = [...document.querySelectorAll(".category-tabs button")];
const heroItems = (window.photographProjects || []).flatMap((project) =>
  (project.images || []).map((image) => ({
    image,
    title: project.title
  }))
);
const projects = [
  ...(window.photographProjects || []),
  ...(window.nogimeProjects || []),
  ...(window.architectureProjects || [])
];

const supportsIntersectionObserver = "IntersectionObserver" in window;
let currentSlide = 0;
let currentHeroImage = "";
let slideTimer = window.setInterval(showNextSlide, 5000);
let counterTimer = null;

const architectureCounterData = {
  current: {
    area: 449500,
    costOkuYen: 1872.7
  },
  target: {
    area: 499500,
    costOkuYen: 2472.7
  },
  durationMs: 60000,
  tickMs: 3000
};

const formatCounterArea = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const formatCounterCost = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const formatCounterInteger = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });

function getRandomHeroItem() {
  if (!heroItems.length) return null;
  if (heroItems.length === 1) return heroItems[0];

  let item = heroItems[Math.floor(Math.random() * heroItems.length)];
  while (item.image === currentHeroImage) {
    item = heroItems[Math.floor(Math.random() * heroItems.length)];
  }
  currentHeroImage = item.image;
  return item;
}

function applyHeroItem(slide, item) {
  if (!slide || !item) return;
  slide.style.backgroundImage = `url("${assetUrl(item.image)}")`;
  if (heroTitle) {
    heroTitle.textContent = item.title;
  }
}

function showSlide(index) {
  const item = getRandomHeroItem();
  slides[currentSlide].classList.remove("is-active");
  currentSlide = (index + slides.length) % slides.length;
  applyHeroItem(slides[currentSlide], item);
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


function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function renderArchitectureCounter() {
  if (!architectureAreaCounter || !architectureCostCounter) return;

  const cycle = Date.now() % architectureCounterData.durationMs;
  const progress = easeOutCubic(cycle / architectureCounterData.durationMs);
  const area =
    architectureCounterData.current.area +
    (architectureCounterData.target.area - architectureCounterData.current.area) * progress;
  const costOkuYen =
    architectureCounterData.current.costOkuYen +
    (architectureCounterData.target.costOkuYen - architectureCounterData.current.costOkuYen) * progress;

  architectureAreaCounter.textContent = formatCounterArea.format(area);
  architectureCostCounter.textContent = formatCounterCost.format(costOkuYen / 10);
  if (architecturePhotographCounter) {
    const photographCount = (window.photographProjects || []).reduce(
      (total, project) => total + (project.images || []).length,
      0
    );
    architecturePhotographCounter.textContent = formatCounterInteger.format(photographCount);
  }
}

function setCounterActiveCategory(category) {
  counterMetrics.forEach((metric) => {
    metric.classList.toggle("is-counter-active", metric.dataset.counterCategory === category);
  });
}
function renderProjects(category) {
  galleryGrid.innerHTML = "";
  setCounterActiveCategory(category);

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

applyHeroItem(slides[currentSlide], getRandomHeroItem());
renderArchitectureCounter();
counterTimer = window.setInterval(renderArchitectureCounter, architectureCounterData.tickMs);

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
