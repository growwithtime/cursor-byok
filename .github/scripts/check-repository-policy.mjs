import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const policyFile = ".github/scripts/check-repository-policy.mjs";
const forbiddenPaths = [
  "apps/desktop/src/shell/ads/",
  "server/src/control/ads.rs",
];
const forbiddenFragments = [
  "advertisement",
  "advertising",
  "广告",
  "唯一收入来源",
  "/promotions",
  "/api/v1/ads",
  "disable-ad-ids",
  "react-css-marquee",
  "cursor-byok:read-ad-ids",
  "cursor-byok:dismissed-ad-ids",
  "adruntime",
  "adslot",
  "admenu",
  "floatingad",
  "dismissad",
  "ads_endpoint",
];
const sourceFile = /\.(css|html|js|jsx|json|md|mjs|rs|scss|sql|toml|ts|tsx|yaml|yml)$/i;

const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const files = execFileSync(
  "git",
  ["-C", repositoryRoot, "ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
)
  .split(/\r?\n/)
  .filter(Boolean);
const violations = [];

for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  const normalizedLower = normalized.toLowerCase();
  const absolutePath = resolve(repositoryRoot, normalized);

  // Deleted tracked files remain in git ls-files until they are staged.
  if (!existsSync(absolutePath)) continue;

  if (forbiddenPaths.some((path) => normalizedLower === path || normalizedLower.startsWith(path))) {
    violations.push(`${normalized}: forbidden path`);
  }

  // Cursor's upstream protocol contains Promotion fields that are unrelated to this project's UI.
  if (
    normalized === policyFile
    || normalized.startsWith("protocols/")
    || !sourceFile.test(normalized)
  ) {
    continue;
  }

  const content = readFileSync(absolutePath, "utf8");
  const contentLower = content.toLowerCase();
  for (const fragment of forbiddenFragments) {
    const index = contentLower.indexOf(fragment.toLowerCase());
    if (index === -1) continue;
    const line = content.slice(0, index).split(/\r?\n/).length;
    violations.push(`${normalized}:${line}: contains ${JSON.stringify(fragment)}`);
  }
}

if (violations.length > 0) {
  console.error("Repository policy violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Repository policy passed.");
