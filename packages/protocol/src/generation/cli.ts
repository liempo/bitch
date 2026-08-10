import { findArtifactDifferences, renderArtifacts, writeArtifacts } from "./artifacts.js";

async function main(): Promise<void> {
  const check = process.argv.includes("--check");
  const artifactCount = renderArtifacts().size;
  if (!check) {
    await writeArtifacts();
    console.log(`Generated ${artifactCount} protocol artifacts.`);
    return;
  }

  const differences = await findArtifactDifferences();
  if (differences.length > 0) {
    console.error([
      "Generated protocol artifacts do not match the canonical contract:",
      ...differences.map((difference) => `- ${difference.kind}: ${difference.path}`),
    ].join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Generated protocol artifacts are current (${artifactCount} files).`);
}

await main();
