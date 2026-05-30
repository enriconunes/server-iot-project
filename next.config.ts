import type { NextConfig } from "next";

// Fixa a raiz do projeto na própria pasta. Sem isso, o Turbopack detecta
// lockfiles soltos em C:\Users\enric e infere a raiz errada, quebrando a
// resolução do node_modules (ex.: "Can't resolve 'tailwindcss'").
const projectRoot = __dirname;

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
