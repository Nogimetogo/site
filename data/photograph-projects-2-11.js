(() => {
  const project = (window.photographProjects || []).find(
    (item) => item.slug === "wall-distance"
  );

  if (!project) return;

  project.cover = "assets/projects/photograph/concepts/wall-distance-canvas/01.webp";
  project.images = Array.from(
    { length: 49 },
    (_, index) =>
      `assets/projects/photograph/concepts/wall-distance-canvas/${String(index + 1).padStart(2, "0")}.webp`
  );
})();
