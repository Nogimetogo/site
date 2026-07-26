(() => {
  const project = (window.photographProjects || []).find(
    (item) => item.slug === "lingering-undecided-ending"
  );

  if (!project) return;

  project.cover =
    "assets/projects/photograph/concepts/lingering-undecided-ending-canvas/01.webp";
  project.images = Array.from(
    { length: 52 },
    (_, index) =>
      `assets/projects/photograph/concepts/lingering-undecided-ending-canvas/${String(index + 1).padStart(2, "0")}.webp`
  );
})();
