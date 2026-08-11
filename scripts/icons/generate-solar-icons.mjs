// solar-icon-map.mjs をもとに、Solar Icons の SVG を react-native-svg の
// コンポーネントへ書き起こす codegen。生成物は git にコミットするため、
// @iconify-json/solar は devDependency のままで実行時依存が増えない。
//
//   node scripts/icons/generate-solar-icons.mjs           # 生成
//   node scripts/icons/generate-solar-icons.mjs --check   # 差分があれば exit 1
//
// 生成物:
//   types/icon.ts                    IconName ユニオン型
//   components/icon/solar/*.tsx      アイコンコンポーネント
//   components/icon/solar/registry.ts  IconName → コンポーネントの対応表

import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import prettier from "prettier";
import { ICON_MAP } from "./solar-icon-map.mjs";

const require = createRequire(import.meta.url);
const iconSet = require("@iconify-json/solar/icons.json");

const projectRoot = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../..",
);
const solarDir = path.join(projectRoot, "components/icon/solar");
const typesFile = path.join(projectRoot, "types/icon.ts");

const isCheckMode = process.argv.includes("--check");

// react-native-svg に存在する要素だけを許可する。未知の要素が来たら
// 黙って壊れた SVG を出さずにここで落とす。
const ELEMENT_MAP = {
  path: "Path",
  g: "G",
  circle: "Circle",
  rect: "Rect",
  ellipse: "Ellipse",
  line: "Line",
  polyline: "Polyline",
  polygon: "Polygon",
};

const ATTRIBUTE_MAP = {
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "fill-opacity": "fillOpacity",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
};

const GEOMETRY_ATTRIBUTES = new Set([
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "width",
  "height",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "transform",
  "fill",
  "stroke",
  "opacity",
]);

/** Ionicons 名からコンポーネント名を作る。trash-outline → TrashOutlineIcon */
const toComponentName = (iconName) =>
  `${iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")}Icon`;

/** Iconify の alias を辿って実体のアイコン定義を得る。 */
const resolveIcon = (solarName, iconName) => {
  if (iconSet.icons[solarName]) return iconSet.icons[solarName];

  const alias = iconSet.aliases?.[solarName];
  if (!alias) {
    throw new Error(`${iconName}: Solar に "${solarName}" が存在しない`);
  }
  if (alias.rotate || alias.hFlip || alias.vFlip) {
    throw new Error(
      `${iconName}: "${solarName}" は回転・反転を伴う alias のため手動対応が必要`,
    );
  }
  return resolveIcon(alias.parent, iconName);
};

/** SVG の属性文字列を JSX の属性文字列へ変換する。 */
const convertAttributes = (rawAttributes, iconName) => {
  const attributes = [];
  const pattern = /([a-zA-Z-]+)="([^"]*)"/g;

  for (const [, name, value] of rawAttributes.matchAll(pattern)) {
    const jsxName = ATTRIBUTE_MAP[name] ?? name;
    if (!ATTRIBUTE_MAP[name] && !GEOMETRY_ATTRIBUTES.has(name)) {
      throw new Error(`${iconName}: 未知の SVG 属性 "${name}"`);
    }

    if (value === "currentColor") {
      attributes.push(`${jsxName}={color}`);
      continue;
    }
    // ".5" のような値も Number で 0.5 になる。列挙値（round / evenodd）は文字列のまま残す。
    if (value !== "" && Number.isFinite(Number(value))) {
      attributes.push(`${jsxName}={${Number(value)}}`);
      continue;
    }
    attributes.push(`${jsxName}="${value}"`);
  }

  return attributes.join(" ");
};

/**
 * Iconify の body（SVG フラグメント文字列）を JSX へ変換する。
 * @returns {{ jsx: string, elements: Set<string> }}
 */
const convertBody = (body, iconName) => {
  const elements = new Set();
  const pattern = /<\/?([a-zA-Z]+)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*(\/?)>/g;

  const jsx = body.replace(
    pattern,
    (match, tagName, rawAttributes, selfClose) => {
      const jsxTag = ELEMENT_MAP[tagName];
      if (!jsxTag) {
        throw new Error(`${iconName}: 未対応の SVG 要素 "<${tagName}>"`);
      }
      elements.add(jsxTag);

      if (match.startsWith("</")) return `</${jsxTag}>`;

      const attributes = convertAttributes(rawAttributes, iconName);
      const spacer = attributes ? " " : "";
      return `<${jsxTag}${spacer}${attributes}${selfClose ? " />" : ">"}`;
    },
  );

  return { jsx, elements };
};

const buildComponentSource = (iconName, solarName) => {
  const icon = resolveIcon(solarName, iconName);
  const width = icon.width ?? iconSet.width ?? 24;
  const height = icon.height ?? iconSet.height ?? 24;
  const { jsx, elements } = convertBody(icon.body, iconName);

  const namedImports = [...elements].sort().join(", ");
  const componentName = toComponentName(iconName);

  return `// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
// 出典: Solar Icons (${solarName}) by 480 Design / CC BY 4.0
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import Svg, { ${namedImports} } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ${componentName} = ({
  size = 24,
  color = "#F4F4F4",
  style,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 ${width} ${height}" fill="none" style={style}>
    ${jsx}
  </Svg>
);
`;
};

const buildTypesSource = (iconNames) => {
  const union = iconNames
    .map((name) => `  | ${JSON.stringify(name)}`)
    .join("\n");
  return `// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。

/** アプリで使えるアイコン名。実体の対応は scripts/icons/solar-icon-map.mjs にある。 */
export type IconName =
${union};
`;
};

const buildRegistrySource = (entries) => {
  // 複数の IconName が同じコンポーネントを指す（baseball / baseball-outline など）ため
  // import 行は重複を除いてから出す。
  const uniqueImports = [
    ...new Map(entries.map((entry) => [entry.componentName, entry])).values(),
  ];
  // eslint の import/order に合わせ、親ディレクトリ参照を先に、それぞれパス順で並べる。
  const imports = uniqueImports
    .sort((a, b) => {
      const depth = (entry) => (entry.importPath.startsWith("../") ? 0 : 1);
      return depth(a) - depth(b) || a.importPath.localeCompare(b.importPath);
    })
    .map(
      ({ componentName, importPath }) =>
        `import { ${componentName} } from "${importPath}";`,
    )
    .join("\n");

  const records = entries
    .map(
      ({ iconName, componentName }) =>
        `  ${JSON.stringify(iconName)}: ${componentName},`,
    )
    .join("\n");

  return `// このファイルは scripts/icons/generate-solar-icons.mjs が生成する。直接編集しない。
import type { IconName } from "../../../types/icon";
import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
${imports}

type IconComponent = (props: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) => React.JSX.Element;

export const SOLAR_ICONS: Record<IconName, IconComponent> = {
${records}
};
`;
};

const format = async (source, filePath) => {
  const config = await prettier.resolveConfig(filePath);
  return prettier.format(source, { ...config, filepath: filePath });
};

/** 生成モードなら書き込み、--check モードなら差分を集める。 */
const emit = async (filePath, source, differences) => {
  const formatted = await format(source, filePath);
  if (!isCheckMode) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, formatted);
    return;
  }
  const current = await fs.readFile(filePath, "utf8").catch(() => null);
  if (current !== formatted)
    differences.push(path.relative(projectRoot, filePath));
};

const main = async () => {
  const iconNames = Object.keys(ICON_MAP).sort();
  const differences = [];
  const registryEntries = [];
  const generatedFiles = new Set();

  for (const iconName of iconNames) {
    const entry = ICON_MAP[iconName];

    if (entry.custom) {
      registryEntries.push({
        iconName,
        componentName: entry.custom,
        importPath: entry.from,
      });
      continue;
    }

    const componentName = toComponentName(iconName);
    const fileName = `${componentName}.tsx`;
    generatedFiles.add(fileName);
    registryEntries.push({
      iconName,
      componentName,
      importPath: `./${componentName}`,
    });

    await emit(
      path.join(solarDir, fileName),
      buildComponentSource(iconName, entry.solar),
      differences,
    );
  }

  await emit(typesFile, buildTypesSource(iconNames), differences);
  await emit(
    path.join(solarDir, "registry.ts"),
    buildRegistrySource(registryEntries),
    differences,
  );

  // マップから消えたアイコンの生成物が残っていると、使われないコードが
  // バンドルに乗り続けるため検出する。
  const existing = await fs.readdir(solarDir).catch(() => []);
  const orphans = existing.filter(
    (file) => file !== "registry.ts" && !generatedFiles.has(file),
  );
  if (orphans.length > 0) {
    if (isCheckMode) {
      differences.push(
        ...orphans.map((file) => `components/icon/solar/${file}`),
      );
    } else {
      await Promise.all(
        orphans.map((file) => fs.unlink(path.join(solarDir, file))),
      );
    }
  }

  if (isCheckMode) {
    if (differences.length > 0) {
      console.error("生成物が最新ではない:");
      differences.forEach((file) => console.error(`  ${file}`));
      process.exit(1);
    }
    console.log("生成物は最新");
    return;
  }

  console.log(
    `${generatedFiles.size} 個の Solar アイコンと registry / IconName を生成した`,
  );
};

await main();
