(() => {
  const projects = window.photographProjects || [];

  function mergeProject(targetSlug, sourceSlug, title) {
    const target = projects.find((project) => project.slug === targetSlug);
    const sourceIndex = projects.findIndex((project) => project.slug === sourceSlug);
    const source = projects[sourceIndex];

    if (!target || !source) return;

    target.title = title;
    target.images = [...(target.images || []), ...(source.images || [])];
    target.summary = [...(target.summary || []), ...(source.summary || [])];
    projects.splice(sourceIndex, 1);
  }

  mergeProject(
    "urban-arrangement",
    "urban-arrangement-change",
    "2.0都市は配置である"
  );
  mergeProject(
    "urban-wall",
    "wall-distance",
    "2.1都市は壁である"
  );
  mergeProject(
    "roof-interface",
    "roof-equilibrium",
    "1.0 屋根は都市の界面である"
  );
  mergeProject(
    "roof-interface",
    "roof-trace",
    "1.0 屋根は都市の界面である"
  );
  mergeProject(
    "roof-invisible-force",
    "roof-irreversible",
    "1.1 屋根の形を決めるのは、ほとんど見えない作用である"
  );
  mergeProject(
    "nogime-unnamed-arrangement",
    "nogime-no-background",
    "3.0ノギメとは無名なものの配置である"
  );
  mergeProject(
    "nogime-unnamed-arrangement",
    "nogime-no-focus-pattern",
    "3.0ノギメとは無名なものの配置である"
  );
  mergeProject(
    "nogime-whole-as-part",
    "nogime-open-form",
    "3.1ノギメとは部分として現れる全体である"
  );
})();
