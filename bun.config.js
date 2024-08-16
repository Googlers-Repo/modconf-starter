import { build } from "bun";
import * as path from "path";
import * as fs from "fs";
import pkg from "./module.json";
import archiver from "archiver";
import ModFS from "modfs";
import { stringify, parse } from "ini";

function archiveFolder(sourceDir, outputFilePath) {
  // Create a file to stream archive data to.
  const output = fs.createWriteStream(outputFilePath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  // Listen for all archive data to be written.
  output.on("close", () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log(
      "Archiver has been finalized and the output file descriptor has closed."
    );
  });

  // Good practice to catch warnings (e.g. stat failures) explicitly.
  archive.on("warning", (err) => {
    if (err.code !== "ENOENT") {
      throw err;
    }
    console.warn(err);
  });

  // Good practice to catch this error explicitly.
  archive.on("error", (err) => {
    throw err;
  });

  // Pipe archive data to the file.
  archive.pipe(output);

  // Append files from sourceDir.
  archive.directory(sourceDir, false);

  // Finalize the archive (i.e. we are done appending files but streams have to finish yet).
  archive.finalize();
}

const modfs = new ModFS(pkg.metadata);

build({
  entrypoints: [path.resolve(__dirname, pkg.build.modconf)],
  naming: "[dir]/[name].jsx",
  outdir: path.resolve(
    __dirname,
    "magisk/system/usr/share/mmrl/config",
    pkg.metadata.id
  ),
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
  const prop = stringify(modfs.formatEntries());
  fs.writeFileSync(
    path.resolve(__dirname, "magisk/module.prop"),
    prop,
    "utf-8"
  );
  const output = `dist/${modfs.format(pkg.dist.moduleFileName)}`;
  archiveFolder(path.resolve(__dirname, "magisk"), output);
});
