import pkg from "./package.json";

Bun.build({
  entrypoints: ["./src/index.jsx"],
  naming: "[dir]/[name].jsx",
  outdir: "./dist",
  target: "browser",
  format: "esm",
  external: [
    "react",
    "@mmrl/*",
    "@mui/*",
    "default-composer",
    "modfs",
    "flatlist-react",
  ],
  minify: true,
}).then((res) => {
  console.log(res);
});
