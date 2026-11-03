import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Beast2D",
  description: "Component-based 2D engine API and authoring guide",
  base: "/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Syntax", link: "/syntax/overview" },
      { text: "API", link: "/api/" },
      { text: "Integration", link: "/meta/integration" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting started", link: "/guide/getting-started" },
            { text: "Core concepts", link: "/guide/concepts" },
            { text: "Display spec", link: "/guide/display-spec" },
          ],
        },
      ],
      "/syntax/": [
        {
          text: "Syntax",
          items: [
            { text: "Overview", link: "/syntax/overview" },
            { text: "Levels and lifecycle", link: "/syntax/levels-and-lifecycle" },
            {
              text: "GameObjects and components",
              link: "/syntax/game-objects-and-components",
            },
            { text: "Prefabs and composition", link: "/syntax/prefabs-and-composition" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API reference",
          items: [{ text: "Overview", link: "/api/" }],
        },
        {
          text: "Core",
          items: [
            { text: "Engine", link: "/api/core/engine" },
            { text: "GameObject", link: "/api/core/game-object" },
            { text: "Level", link: "/api/core/level" },
            { text: "EngineContext", link: "/api/core/engine-context" },
            { text: "Game management", link: "/api/core/game-management" },
            { text: "Services", link: "/api/core/services" },
            { text: "Utilities", link: "/api/core/utilities" },
            { text: "Constants", link: "/api/constants" },
          ],
        },
        {
          text: "Components",
          items: [
            { text: "Overview", link: "/api/components/" },
            { text: "Movement", link: "/api/components/movement" },
            { text: "Render", link: "/api/components/render" },
            { text: "Collision", link: "/api/components/collision" },
            { text: "Input and behavior", link: "/api/components/input-behavior" },
          ],
        },
        {
          text: "Prefabs",
          items: [{ text: "Box, Circle, Player, Spawner", link: "/api/prefabs" }],
        },
      ],
      "/meta/": [
        {
          text: "Meta",
          items: [{ text: "Integration and HTML", link: "/meta/integration" }],
        },
      ],
    },
    socialLinks: [],
  },
});
