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
  baseDate: "2026-05-23T14:00:55+09:00",
  base: {
    area: 449500,
    costOkuYen: 1872.7
  },
  milestones: [
    {
      date: "2028-12-31T23:59:59+09:00",
      area: 50000,
      costOkuYen: 600
    }
  ],
  tickMs: 3000
};
const photographCounterData = {
  baseDate: "2026-05-23T14:15:51+09:00",
  yearlyCounts: [4154, 769, 276]
};

const formatCounterArea = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
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


function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getArchitectureCounterTotals(now = Date.now()) {
  let previousDate = new Date(architectureCounterData.baseDate).getTime();
  const totals = {
    area: architectureCounterData.base.area,
    costOkuYen: architectureCounterData.base.costOkuYen
  };

  architectureCounterData.milestones.forEach((milestone) => {
    const milestoneDate = new Date(milestone.date).getTime();
    const progress = clamp((now - previousDate) / (milestoneDate - previousDate), 0, 1);
    totals.area += milestone.area * progress;
    totals.costOkuYen += milestone.costOkuYen * progress;
    previousDate = milestoneDate;
  });

  return totals;
}

function getPhotographCounterTotal(now = Date.now()) {
  const baseDate = new Date(photographCounterData.baseDate).getTime();
  const baseCount = photographCounterData.yearlyCounts.reduce((total, count) => total + count, 0);
  const yearlyAverage = baseCount / photographCounterData.yearlyCounts.length;
  const elapsedYears = Math.max(0, (now - baseDate) / (365.25 * 24 * 60 * 60 * 1000));

  return baseCount + yearlyAverage * elapsedYears;
}

function renderArchitectureCounter() {
  if (!architectureAreaCounter || !architectureCostCounter) return;

  const totals = getArchitectureCounterTotals();

  architectureAreaCounter.textContent = formatCounterArea.format(totals.area);
  architectureCostCounter.textContent = formatCounterInteger.format(totals.costOkuYen * 100000000);
  if (architecturePhotographCounter) {
    architecturePhotographCounter.textContent = formatCounterInteger.format(getPhotographCounterTotal());
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

      const media = project.cover || project.image;
      if (media) {
        const img = document.createElement("img");
        img.src = assetUrl(media);
        img.alt = project.title;
        card.append(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "work-card-placeholder";
        placeholder.textContent = "";
        card.append(placeholder);
      }

      const caption = document.createElement("figcaption");
      caption.innerHTML = `<strong>${project.title}</strong><span>${project.category} / ${project.year}</span>`;

      card.append(caption);
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
