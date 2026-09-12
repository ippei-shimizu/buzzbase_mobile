// Solar Icons の実在アイコン名を部分一致で検索する開発補助スクリプト。
// マッピング表（solar-icon-map.json）を書くときに使う。
//
//   node scripts/search-solar-icons.mjs trophy
//   node scripts/search-solar-icons.mjs cup --weights

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const iconSet = require("@iconify-json/solar/icons.json");

const [query = "", ...flags] = process.argv.slice(2);
const showWeights = flags.includes("--weights");

const names = Object.keys(iconSet.icons).filter((name) => name.includes(query));

if (showWeights) {
  console.log(names.join("\n"));
} else {
  // weight サフィックスを落として基底名だけを見たいケース向け。
  const bases = new Set(
    names.map((name) =>
      name.replace(
        /-(linear|outline|broken|bold|bold-duotone|line-duotone)$/,
        "",
      ),
    ),
  );
  console.log([...bases].sort().join("\n"));
}

console.log(`\n--- ${names.length} matches ---`);
