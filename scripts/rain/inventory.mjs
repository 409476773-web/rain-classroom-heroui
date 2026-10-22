#!/usr/bin/env node
/* eslint-disable no-console -- This CLI reports generated files and inventory drift. */
/** Static inventory only. No browser, component, or acceptance check is implied. */
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import ts from "typescript";

const COMPONENTS = "packages/react/src/components";
const DEMOS = "apps/docs/src/demos";
const OUTPUT = "docs/rain/inventory.json";
const EXCEPTIONS = "docs/rain/exceptions.md";
const unique = (items) => [...new Set(items)].sort();
const slash = (value) => value.split(path.sep).join("/");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const hasExport = (node) => node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
const hasDefault = (node) => node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
const propertyName = (node) => node?.text ?? node?.getText();

function unwrap(node) {
  while (
    node &&
    (ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isParenthesizedExpression(node))
  )
    node = node.expression;

  return node;
}

function sourceFile(file, text) {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  if (source.parseDiagnostics.length) {
    throw new Error(
      `${file}: ${ts.flattenDiagnosticMessageText(source.parseDiagnostics[0].messageText, " ")}`,
    );
  }

  return source;
}

/** Parse syntax, not evaluated exports. Star exports are resolved separately against local files. */
export function analyzeSource(file, text) {
  const source = sourceFile(file, text);
  const result = {
    compound: [],
    dynamicImports: [],
    exportStars: [],
    exports: [],
    imports: [],
    jsxNames: [],
    storyExports: [],
    storyTitle: null,
  };
  const bindings = new Map();
  const at = (node) => ({
    file,
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
  });
  const addExport = (name, kind, node, extra = {}) =>
    result.exports.push({kind, name, ...at(node), ...extra});

  for (const node of source.statements) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const names = [];
      const clause = node.importClause;

      if (clause?.name)
        names.push({
          importedName: "default",
          kind: clause.isTypeOnly ? "type" : "value",
          name: clause.name.text,
        });
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const item of clause.namedBindings.elements)
          names.push({
            importedName: item.propertyName?.text ?? item.name.text,
            kind: clause.isTypeOnly || item.isTypeOnly ? "type" : "value",
            name: item.name.text,
          });
      } else if (clause?.namedBindings)
        names.push({
          importedName: "*",
          kind: clause.isTypeOnly ? "type" : "value",
          name: clause.namedBindings.name.text,
        });
      for (const item of names)
        bindings.set(item.name, {source: node.moduleSpecifier.text, ...item});
      result.imports.push({names, source: node.moduleSpecifier.text, ...at(node)});
    }
  }
  for (const node of source.statements) {
    if (ts.isExportDeclaration(node)) {
      const origin = node.moduleSpecifier?.text;

      if (!node.exportClause && origin)
        result.exportStars.push({
          kind: node.isTypeOnly ? "type" : "all",
          source: origin,
          ...at(node),
        });
      else if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const item of node.exportClause.elements) {
          const localName = item.propertyName?.text ?? item.name.text;
          const binding = bindings.get(localName);

          addExport(item.name.text, node.isTypeOnly || item.isTypeOnly ? "type" : "value", item, {
            localName,
            ...(origin || binding?.source ? {source: origin ?? binding.source} : {}),
          });
        }
      } else if (node.exportClause)
        addExport(node.exportClause.name.text, node.isTypeOnly ? "type" : "namespace", node, {
          source: origin,
        });
    }
    if (ts.isExportAssignment(node)) {
      addExport("default", "value", node);
      const metadata = unwrap(node.expression);

      if (ts.isObjectLiteralExpression(metadata)) {
        const title = metadata.properties.find(
          (p) => propertyName(p.name) === "title" && ts.isPropertyAssignment(p),
        );

        if (title && ts.isStringLiteral(title.initializer))
          result.storyTitle = title.initializer.text;
      }
    }
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        const initializer = unwrap(declaration.initializer);

        if (initializer && ts.isObjectLiteralExpression(initializer)) {
          const title = initializer.properties.find(
            (p) => propertyName(p.name) === "title" && ts.isPropertyAssignment(p),
          );

          if (title && ts.isStringLiteral(title.initializer) && !result.storyTitle)
            result.storyTitle = title.initializer.text;
        }
        if (!hasExport(node)) continue;
        if (!ts.isIdentifier(declaration.name))
          throw new Error(
            `${file}: exported destructuring needs an explicit inventory parser rule`,
          );
        const name = declaration.name.text;

        addExport(name, "value", declaration);
        if (
          initializer &&
          (ts.isObjectLiteralExpression(initializer) ||
            ts.isArrowFunction(initializer) ||
            ts.isFunctionExpression(initializer))
        )
          result.storyExports.push(name);
        let members = initializer;

        if (
          initializer &&
          ts.isCallExpression(initializer) &&
          initializer.expression.getText(source) === "Object.assign"
        )
          members = initializer.arguments[1];
        if (members && ts.isObjectLiteralExpression(members)) {
          const parts = members.properties.flatMap((member) => {
            if (!ts.isPropertyAssignment(member) && !ts.isShorthandPropertyAssignment(member))
              return [];
            const value = ts.isShorthandPropertyAssignment(member)
              ? member.name
              : member.initializer;

            if (!ts.isIdentifier(value)) return [];
            const binding = bindings.get(value.text);

            return [
              {
                localName: value.text,
                name: propertyName(member.name),
                ...(binding ? {importedName: binding.importedName, source: binding.source} : {}),
                ...at(member),
              },
            ];
          });

          if (parts.length) result.compound.push({members: parts, name});
        }
      }
    } else if (hasExport(node)) {
      const kind =
        ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) ? "type" : "value";

      if (node.name) addExport(hasDefault(node) ? "default" : node.name.text, kind, node);
    }
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      result.jsxNames.push(node.tagName.getText(source));
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0])
    )
      result.dynamicImports.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  result.jsxNames = unique(result.jsxNames);
  result.dynamicImports = unique(result.dynamicImports);
  result.storyExports = result.exports
    .filter((item) => item.kind === "value" && item.name !== "default")
    .map((item) => item.name);

  return result;
}

export function parseDemoRegistry(file, text) {
  const source = sourceFile(file, text);
  const rows = [];

  for (const node of source.statements) {
    if (!ts.isVariableStatement(node)) continue;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText(source) !== "demos") continue;
      const registry = unwrap(declaration.initializer);

      if (!registry || !ts.isObjectLiteralExpression(registry))
        throw new Error(`${file}: demos must be a static object`);
      for (const property of registry.properties) {
        if (
          !ts.isPropertyAssignment(property) ||
          !ts.isObjectLiteralExpression(property.initializer)
        )
          throw new Error(`${file}: unsupported dynamic demo entry`);
        const row = {
          id: propertyName(property.name),
          line: source.getLineAndCharacterOfPosition(property.getStart(source)).line + 1,
          loaderExport: null,
          loaderSpecifier: null,
          registry: file,
          sourceFile: null,
        };

        for (const field of property.initializer.properties) {
          if (!ts.isPropertyAssignment(field)) continue;
          if (propertyName(field.name) === "file" && ts.isStringLiteral(field.initializer))
            row.sourceFile = field.initializer.text;
          if (propertyName(field.name) === "loader") {
            const visit = (child) => {
              if (
                ts.isCallExpression(child) &&
                child.expression.kind === ts.SyntaxKind.ImportKeyword &&
                ts.isStringLiteral(child.arguments[0])
              )
                row.loaderSpecifier = child.arguments[0].text;
              if (
                ts.isArrowFunction(child) &&
                ts.isPropertyAccessExpression(child.body) &&
                child.parameters.some(
                  (p) => p.name.getText(source) === child.body.expression.getText(source),
                )
              )
                row.loaderExport = child.body.name.text;
              ts.forEachChild(child, visit);
            };

            visit(field.initializer);
          }
        }
        if (!row.loaderSpecifier || !row.loaderExport || !row.sourceFile)
          throw new Error(`${file}:${row.line}: unsupported loader/source pattern`);
        rows.push(row);
      }
    }
  }

  return rows;
}

export function parseDocument(file, text) {
  const relative = file.split("/content/docs/")[1];
  const [repositoryLocale, ...segments] = relative.split("/");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const field = (name) =>
    frontmatter
      .match(new RegExp(`^\\s*${name}:\\s*(.+)$`, "m"))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, "") ?? null;
  const live = text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, "");
  const demoIds = [
    ...live.matchAll(
      /<(?:ComponentPreview|ComponentSource)\b[^>]*?\bname\s*=\s*(?:["']([^"']+)["']|\{\s*["']([^"']+)["']\s*\})[^>]*>/g,
    ),
  ].map((m) => m[1] ?? m[2]);

  return {
    demoIds: unique(demoIds),
    file,
    id: file,
    kind:
      segments.includes("components") && !segments.includes("migration")
        ? "component"
        : segments.includes("migration")
          ? "migration"
          : "guide",
    locale: repositoryLocale === "cn" ? "zh" : repositoryLocale,
    repositoryLocale,
    route: `/${repositoryLocale}/docs/${segments
      .filter((part) => !/^\(.+\)$/.test(part))
      .join("/")
      .replace(/\.mdx?$/, "")
      .replace(/\/index$/, "")}`,
    sourceLink: field("source"),
    storybookLink: field("storybook"),
    stylesLink: field("styles"),
    title: field("title"),
  };
}

function walk(root, directory) {
  const absolute = path.join(root, directory);

  if (!existsSync(absolute)) return [];

  return readdirSync(absolute, {withFileTypes: true})
    .flatMap((item) => {
      const file = `${directory}/${item.name}`;

      if (item.isDirectory())
        return [
          "node_modules",
          "dist",
          ".next",
          ".source",
          "storybook-static",
          "__screenshots__",
          ".rollup.cache",
          ".turbo",
        ].includes(item.name)
          ? []
          : walk(root, file);

      return item.isFile() && !item.name.endsWith(".tsbuildinfo") ? [file] : [];
    })
    .sort();
}

export function reconcileStorybook(stories, built) {
  const entries = Object.values(built.entries).map((entry) => ({
    exportName: entry.exportName ?? null,
    file: slash(path.normalize(path.join("packages/storybook", entry.importPath))),
    id: entry.id,
    title: entry.title,
    type: entry.type,
  }));
  const missing = stories.flatMap((story) =>
    story.exportNames
      .filter(
        (name) =>
          !entries.some(
            (entry) =>
              entry.type === "story" && entry.file === story.file && entry.exportName === name,
          ),
      )
      .map((exportName) => ({exportName, file: story.file})),
  );
  const unexpected = entries.filter(
    (entry) =>
      entry.type === "story" &&
      !stories.some(
        (story) => story.file === entry.file && story.exportNames.includes(entry.exportName),
      ),
  );
  const titleMismatches = entries.filter(
    (entry) =>
      entry.type === "story" &&
      stories.some((story) => story.file === entry.file && story.title !== entry.title),
  );

  return {
    entries,
    missing,
    status: missing.length || unexpected.length || titleMismatches.length ? "mismatch" : "matched",
    titleMismatches,
    unexpected,
  };
}

export function generateInventory(root) {
  const read = (file) => readFileSync(path.join(root, file), "utf8");
  const exists = (file) => existsSync(path.join(root, file));
  const upstream = JSON.parse(read("docs/rain/upstream.json"));
  const sourceTreeCommit = upstream.localSourceSnapshot?.commit ?? upstream.commit;
  const tracked = execFileSync("git", ["ls-tree", "-r", "--name-only", "-z", sourceTreeCommit], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const sourceInputs = unique([
    "AGENTS.md",
    "package.json",
    "pnpm-lock.yaml",
    ...walk(root, "packages/react/src"),
    ...walk(root, "packages/react/tests"),
    ...walk(root, "packages/styles"),
    ...walk(root, "packages/storybook/.storybook"),
    ...walk(root, DEMOS),
    ...["en", "cn"].flatMap((locale) => walk(root, `apps/docs/content/docs/${locale}/react`)),
  ]);
  const issues = [];
  const issue = (code, file, detail) => issues.push({code, detail, file});
  const cache = new Map();
  const analyze = (file) => {
    if (!cache.has(file)) cache.set(file, analyzeSource(file, read(file)));

    return cache.get(file);
  };
  const resolveLocal = (from, specifier) => {
    if (!specifier?.startsWith(".")) return null;
    const base = slash(path.normalize(path.join(path.dirname(from), specifier)));

    return (
      [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(
        (file) => exists(file) && /\.[cm]?[jt]sx?$/.test(file),
      ) ?? null
    );
  };
  const resolveExports = (file, chain = []) => {
    if (chain.includes(file)) return [];
    const parsed = analyze(file);
    const result = [...parsed.exports];

    for (const star of parsed.exportStars) {
      const resolved = resolveLocal(file, star.source);

      if (resolved)
        result.push(
          ...resolveExports(resolved, [...chain, file]).filter((row) => row.name !== "default"),
        );
      else if (star.source.startsWith(".")) issue("unresolved_export", file, star.source);
      else
        result.push({
          file,
          kind: star.kind,
          line: star.line,
          name: "*",
          resolution: "external-package",
          source: star.source,
        });
    }

    return result;
  };
  const componentBarrel = analyze(`${COMPONENTS}/index.ts`);
  const exportedModules = componentBarrel.exportStars.map((item) => ({
    entry: resolveLocal(`${COMPONENTS}/index.ts`, item.source),
    id: item.source.replace(/^\.\//, ""),
  }));
  const moduleIds = unique([
    ...exportedModules.map((item) => item.id),
    ...readdirSync(path.join(root, COMPONENTS), {withFileTypes: true})
      .filter((item) => item.isDirectory())
      .map((item) => item.name),
  ]);
  const moduleByFile = (file) =>
    file?.startsWith(`${COMPONENTS}/`)
      ? file
          .slice(COMPONENTS.length + 1)
          .split("/")[0]
          .replace(/\.[jt]sx?$/, "")
      : null;
  const modules = moduleIds.map((id) => {
    const exported = exportedModules.find((item) => item.id === id);
    const entry = exported?.entry ?? resolveLocal(`${COMPONENTS}/index.ts`, `./${id}`);
    const files = walk(root, `${COMPONENTS}/${id}`);

    if (entry && !files.includes(entry)) files.push(entry);
    if (exported && !entry) issue("missing_component_entry", `${COMPONENTS}/index.ts`, id);
    const exports = entry ? resolveExports(entry) : [];

    return {
      compound: entry ? analyze(entry).compound : [],
      coverage: {},
      demos: {en: [], zh: []},
      docs: {en: [], zh: []},
      exports,
      id,
      kind: ["rac", "icons"].includes(id)
        ? "public-support-module"
        : exported
          ? "component-or-part"
          : "upstream-helper-not-in-root-barrel",
      referencedByModules: [],
      referencedByStories: [],
      rootExported: Boolean(exported),
      source: {entry, files: files.sort()},
      stories: [],
      styles: {css: [], variants: []},
      verification: {
        humanVisualAcceptance: "not_checked",
        interaction: "not_run",
        rainTheme: "not_checked",
        runtime: "not_run",
      },
    };
  });
  const byId = new Map(modules.map((item) => [item.id, item]));
  const symbolOwners = new Map();

  for (const module of modules.filter((item) => item.rootExported))
    for (const symbol of module.exports) {
      if (!symbolOwners.has(symbol.name)) symbolOwners.set(symbol.name, new Set());
      symbolOwners.get(symbol.name).add(module.id);
    }
  const referencedModules = (file) => {
    const found = new Map();

    for (const item of analyze(file).imports) {
      const localOwner = moduleByFile(resolveLocal(file, item.source));

      for (const name of item.names.filter((name) => name.kind !== "type")) {
        const owners = localOwner
          ? [localOwner]
          : item.source === "@heroui/react" || item.source === "@/components"
            ? [...(symbolOwners.get(name.importedName) ?? [])]
            : item.source.startsWith("@/components/")
              ? [item.source.split("/")[2]]
              : [];

        for (const owner of owners) {
          if (!byId.has(owner)) continue;
          const refs = found.get(owner) ?? [];

          refs.push({
            importedName: name.importedName,
            jsxNames: analyze(file).jsxNames.filter(
              (jsx) => jsx === name.name || jsx.startsWith(`${name.name}.`),
            ),
            localName: name.name,
          });
          found.set(owner, refs);
        }
      }
    }

    return [...found].map(([module, symbols]) => ({module, symbols}));
  };

  for (const module of modules) {
    const styleNames = new Set([module.id]);

    for (const file of module.source.files.filter(
      (file) => /\.[jt]sx?$/.test(file) && !file.includes(".stories."),
    )) {
      for (const imported of analyze(file).imports) {
        const owner = moduleByFile(resolveLocal(file, imported.source));

        if (
          owner &&
          owner !== module.id &&
          byId.has(owner) &&
          imported.names.some((name) => name.kind !== "type")
        ) {
          byId.get(owner).referencedByModules.push({
            evidence: "parent-implementation-import",
            file,
            line: imported.line,
            module: module.id,
            symbols: imported.names
              .filter((name) => name.kind !== "type")
              .map((name) => name.importedName),
          });
        }
      }
      for (const imported of analyze(file).imports.filter(
        (item) => item.source === "@heroui/styles",
      ))
        for (const name of imported.names) {
          const styleFile = walk(root, "packages/styles/src/components").find(
            (candidate) =>
              candidate.endsWith(".styles.ts") &&
              new RegExp(`\\b${name.importedName}\\b`).test(read(candidate)),
          );

          if (styleFile) styleNames.add(styleFile.split("/")[4]);
        }
    }
    module.styles.css = unique(
      [...styleNames].map((name) => `packages/styles/components/${name}.css`).filter(exists),
    );
    module.styles.variants = unique(
      [...styleNames].flatMap((name) => walk(root, `packages/styles/src/components/${name}`)),
    );
  }
  const stories = unique(
    [...walk(root, "packages/react/src"), ...walk(root, "packages/storybook/.storybook")].filter(
      (file) => /\.stories\.[jt]sx?$/.test(file),
    ),
  ).map((file) => {
    const parsed = analyze(file);
    const owner = moduleByFile(file);
    const row = {
      exportNames: parsed.storyExports,
      file,
      idStatus: "awaiting-built-storybook-index",
      owner: byId.has(owner) ? owner : null,
      readyOnlyEligible: Boolean(parsed.storyTitle?.startsWith("Components")),
      references: referencedModules(file),
      title: parsed.storyTitle,
    };

    if (!row.title)
      issue(
        "missing_story_title",
        file,
        "Static title not found; actual Storybook index must be checked",
      );
    if (row.owner) byId.get(row.owner).stories.push(file);
    for (const reference of row.references)
      byId.get(reference.module).referencedByStories.push({
        evidence: "static-import-and-jsx-reference",
        file,
        owner: row.owner,
        symbols: reference.symbols,
      });

    return row;
  });
  const documents = ["en", "cn"].flatMap((locale) =>
    walk(root, `apps/docs/content/docs/${locale}/react`)
      .filter((file) => /\.mdx?$/.test(file))
      .map((file) => parseDocument(file, read(file))),
  );

  for (const document of documents) {
    const module = document.sourceLink?.split("/")[0] ?? path.basename(document.file, ".mdx");

    document.owner = byId.has(module) ? module : null;
    if (document.sourceLink) {
      const sourcePath = `${COMPONENTS}/${document.sourceLink}`;

      document.sourcePath = sourcePath;
      if (!exists(sourcePath)) issue("missing_document_source", document.file, sourcePath);
    }
    if (document.owner && document.kind === "component")
      byId.get(document.owner).docs[document.locale].push(document.id);
  }
  const demos = ["en", "cn"].flatMap((repositoryLocale) => {
    const locale = repositoryLocale === "cn" ? "zh" : "en";
    const registry = `${DEMOS}/${repositoryLocale}/index.ts`;

    return parseDemoRegistry(registry, read(registry)).map((entry) => {
      const sourcePath = `${DEMOS}/${entry.sourceFile}`;
      const loaderPath = resolveLocal(registry, entry.loaderSpecifier);
      const owner = entry.sourceFile.split("/")[1];
      const loaderMode =
        loaderPath === sourcePath
          ? "direct-source"
          : loaderPath &&
              analyze(loaderPath).dynamicImports.some(
                (specifier) => resolveLocal(loaderPath, specifier) === sourcePath,
              )
            ? "source-via-wrapper"
            : "unexplained-source-mismatch";

      if (!exists(sourcePath)) issue("missing_demo_source", registry, `${entry.id}: ${sourcePath}`);
      if (!loaderPath)
        issue("missing_demo_loader", registry, `${entry.id}: ${entry.loaderSpecifier}`);
      if (loaderPath && loaderMode === "unexplained-source-mismatch")
        issue(
          "demo_loader_source_mismatch",
          registry,
          `${entry.id}: ${loaderPath} != ${sourcePath}`,
        );
      if (
        loaderPath &&
        !resolveExports(loaderPath).some((item) => item.name === entry.loaderExport)
      )
        issue("missing_demo_export", loaderPath, `${entry.id}: ${entry.loaderExport}`);
      const id = `${locale}:${entry.id}`;

      if (byId.has(owner)) byId.get(owner).demos[locale].push(id);

      return {
        id,
        line: entry.line,
        loaderExport: entry.loaderExport,
        loaderMode,
        loaderPath,
        locale,
        owner: byId.has(owner) ? owner : null,
        referencedByDocs: [],
        references: exists(sourcePath) ? referencedModules(sourcePath) : [],
        registry,
        registryKey: entry.id,
        repositoryLocale,
        sourcePath,
        verification: "not_run",
      };
    });
  });
  const demosById = new Map(demos.map((demo) => [demo.id, demo]));

  if (demosById.size !== demos.length)
    issue("duplicate_demo_key", DEMOS, "Registry contains duplicate keys within a locale");
  for (const document of documents) {
    document.demoReferences = document.demoIds.map((key) => {
      const local = demosById.get(`${document.locale}:${key}`);
      const fallback = local ?? demosById.get(`en:${key}`);

      if (!fallback) issue("unregistered_document_demo", document.file, key);
      if (fallback) fallback.referencedByDocs.push(document.id);

      return {
        key,
        localeStatus: local ? "native-locale" : fallback ? "english-fallback" : "missing",
        resolvedId: fallback?.id ?? null,
      };
    });
  }
  const registeredFiles = new Set(demos.flatMap((demo) => [demo.sourcePath, demo.loaderPath]));
  const unregisteredDemoFiles = walk(root, DEMOS)
    .filter((file) => file.endsWith(".tsx") && !registeredFiles.has(file))
    .map((file) => ({disposition: "supporting-or-unregistered-review-needed", file}));
  const guidance = {
    "calendar-year-picker":
      "AGENTS.md marks this in progress; public exports are retained and must not be treated as fully accepted.",
    "color-input-group":
      "AGENTS.md identifies this as a helper and the root barrel omits it; prepack may still expose a subpath, requiring packed-export verification.",
    "date-input-group":
      "AGENTS.md identifies this as a helper and the root barrel omits it; prepack may still expose a subpath, requiring packed-export verification.",
    icons:
      "AGENTS.md identifies icons as internal/support; its root exports remain in the public API inventory.",
    "list-box-item": "AGENTS.md identifies this as a parent-covered part of ListBox.",
    "list-box-section": "AGENTS.md identifies this as a parent-covered part of ListBox.",
    "menu-item": "AGENTS.md identifies this as a parent-covered part of Menu/Dropdown.",
    "menu-section": "AGENTS.md identifies this as a parent-covered part of Menu/Dropdown.",
    rac: "AGENTS.md identifies rac as an internal/support module; preserve its public re-exports, not a standalone visual family.",
  };

  for (const module of modules) {
    const examples = demos.filter(
      (demo) => demo.owner === module.id || demo.references.some((ref) => ref.module === module.id),
    );
    const crossStories = module.referencedByStories.filter((ref) => ref.owner !== module.id);
    const parentStories = unique(
      module.referencedByModules.flatMap((reference) => byId.get(reference.module).stories),
    );

    module.coverage = {
      disposition: module.stories.length
        ? "own-story-present"
        : module.kind !== "component-or-part"
          ? "support-or-internal-module"
          : crossStories.length
            ? "referenced-by-parent-or-composition-story"
            : parentStories.length
              ? "parent-implementation-linked-to-story"
              : examples.length
                ? "documentation-demo-only"
                : "uncovered-review-needed",
      parentStories,
      parentStoryReferences: parentStories.length,
      standaloneStory: module.stories.length ? "present" : "absent",
      staticDemoReferences: examples.length,
      staticStoryReferences: crossStories.length,
      ...(guidance[module.id]
        ? {guidanceSource: "AGENTS.md", upstreamGuidance: guidance[module.id]}
        : {}),
      note: "References demonstrate static reachability only; no rendered state or runtime behavior has been verified.",
    };
  }
  const actualStorybookIndexPath = "packages/storybook/storybook-static/index.json";
  const storybookIndexPath = exists(actualStorybookIndexPath)
    ? actualStorybookIndexPath
    : "docs/rain/storybook-baseline-index.json";
  const builtStorybook = exists(storybookIndexPath)
    ? {
        currentProductionVerified: false,
        file: storybookIndexPath,
        provenance:
          storybookIndexPath === actualStorybookIndexPath
            ? "actual-built-index"
            : "historical-reference",
        sha256: hash(read(storybookIndexPath)),
        ...reconcileStorybook(stories, JSON.parse(read(storybookIndexPath))),
      }
    : {
        currentProductionVerified: false,
        entries: [],
        file: storybookIndexPath,
        missing: [],
        provenance: "unavailable",
        status: "not_checked",
        titleMismatches: [],
        unexpected: [],
      };

  for (const missing of builtStorybook.missing)
    issue("missing_built_story", missing.file, missing.exportName);
  for (const extra of builtStorybook.unexpected)
    issue("unexpected_built_story", extra.file, extra.id);
  for (const mismatch of builtStorybook.titleMismatches)
    issue("built_story_title_mismatch", mismatch.file, mismatch.id);
  for (const story of stories) {
    story.actualStoryIds = builtStorybook.entries
      .filter((entry) => entry.type === "story" && entry.file === story.file)
      .map((entry) => entry.id);
    story.idStatus =
      builtStorybook.status === "not_checked"
        ? "awaiting-built-storybook-index"
        : builtStorybook.provenance === "historical-reference"
          ? "read-from-historical-index"
          : "read-from-built-index";
  }
  for (const module of modules) {
    module.storyIds = stories
      .filter((story) => module.stories.includes(story.file))
      .flatMap((story) => story.actualStoryIds);
    module.parentStoryIds = stories
      .filter((story) => module.coverage.parentStories.includes(story.file))
      .flatMap((story) => story.actualStoryIds);
  }
  const sourceDigest = createHash("sha256");

  for (const file of sourceInputs) sourceDigest.update(`${file}\0`).update(read(file)).update("\0");
  const counts = (locale) => ({
    allReactDocs: documents.filter((item) => item.locale === locale).length,
    componentDocs: documents.filter((item) => item.locale === locale && item.kind === "component")
      .length,
    demoTsxFiles: walk(root, `${DEMOS}/${locale === "zh" ? "cn" : locale}`).filter((file) =>
      file.endsWith(".tsx"),
    ).length,
    registeredDemos: demos.filter((item) => item.locale === locale).length,
  });

  return {
    builtStorybook,
    demos,
    documents,
    freshnessCheck: "node scripts/rain/inventory.mjs --check",
    generatedBy: "scripts/rain/inventory.mjs",
    issues,
    modules,
    publicApi: {
      componentBarrel: `${COMPONENTS}/index.ts`,
      exports: resolveExports("packages/react/src/index.ts"),
      modules: exportedModules,
      publishedSubpaths: {
        generator: "packages/react/scripts/update-exports.mjs",
        note: "rootExported describes only the root barrel. A helper absent there may still receive a public subpath from prepack.",
        status: "requires-packed-artifact-verification",
      },
      rootEntry: "packages/react/src/index.ts",
    },
    regeneration: "node scripts/rain/inventory.mjs",
    schemaVersion: 1,
    scope:
      "HeroUI React OSS source at the recorded commit plus current working source files; excludes Native/Pro. Static inventory, not acceptance.",
    stories,
    summary: {
      allStoryFiles: stories.length,
      builtStories: builtStorybook.entries.filter((entry) => entry.type === "story").length,
      builtStorybookEntries: builtStorybook.entries.length,
      componentStoryFiles: stories.filter((item) => item.owner).length,
      locales: {en: counts("en"), zh: counts("zh")},
      publicComponentBarrelModules: exportedModules.length,
      referenceIssues: issues.length,
      registeredLoaderWrappers: demos.filter((demo) => demo.loaderMode === "source-via-wrapper")
        .length,
      sourceModules: modules.length,
      staticStoryExports: stories.reduce((total, item) => total + item.exportNames.length, 0),
      unregisteredDemoFiles: unregisteredDemoFiles.length,
    },
    unregisteredDemoFiles,
    upstream: {
      commit: upstream.commit,
      inputFiles: sourceInputs.length,
      inputSha256: sourceDigest.digest("hex"),
      lockfileSha256: hash(read("pnpm-lock.yaml")),
      packageVersion: JSON.parse(read("packages/react/package.json")).version,
      trackedFiles: tracked.length,
      trackedFilesMissing: tracked.filter((file) => !exists(file)),
    },
    verification: {
      builtPackageExports: "not_checked",
      builtStorybookIndex: builtStorybook.status,
      humanVisualAcceptance: "not_checked",
      interaction: "not_run",
      inventory: "static-analysis-completed",
      rainTheme: "not_checked",
      runtime: "not_run",
    },
  };
}

function renderExceptions(inventory) {
  const lines = [
    "# 全库静态清单例外与待核验项",
    "",
    "> 由 `node scripts/rain/inventory.mjs` 生成，请修改来源或生成器后重建。此文件不记录人工视觉接受。",
    "",
    `基线：\`${inventory.upstream.commit}\`，包版本 \`${inventory.upstream.packageVersion}\`。`,
    "",
    "## 状态边界",
    "",
    "- 已完成：源码、导出、文档、demo 注册和 stories 的静态交叉分析。",
    `- Storybook 产物索引对账：\`${inventory.builtStorybook.status}\`，${inventory.summary.builtStorybookEntries} entries / ${inventory.summary.builtStories} stories；实际 ID 记录在 inventory.json，构建索引不证明运行通过。`,
    `- 索引来源：\`${inventory.builtStorybook.provenance}\`（\`${inventory.builtStorybook.file}\`）；历史参考不代表当前生产构建，本静态生成器不验证当前生产产物。`,
    "- 本生成器不执行：打包后 exports、demo/story 运行、交互、主题和人工视觉验收；独立验证结果见 acceptance.md。",
    "- `referenced-by-parent-or-composition-story` 仅代表源码存在 import/JSX 证据；`parent-implementation-linked-to-story` 表示父实现引用了该部件并有 story。二者都不代表所有状态已覆盖。",
    "- 公开支持模块、helper 和 in-progress 组件均保留；rootExported 仅描述根导出，不能据此断言没有发布子路径。",
    "- 中文在仓库中使用 `cn`，清单语言字段使用 `zh`；回退英文不算中文覆盖。",
    "",
    "## 没有独立 story 的模块",
    "",
    "| 模块 | 静态处置 | 参考证据 |",
    "|---|---|---|",
  ];

  for (const module of inventory.modules.filter((item) => !item.stories.length)) {
    const evidence = module.referencedByStories
      .filter((ref) => ref.owner !== module.id)
      .slice(0, 3)
      .map((ref) => `\`${ref.file}\``);

    if (!evidence.length)
      evidence.push(
        ...module.coverage.parentStories.slice(0, 3).map((file) => `父实现关联：\`${file}\``),
      );
    if (!evidence.length) evidence.push(...module.demos.en.slice(0, 3).map((id) => `\`${id}\``));
    if (module.coverage.upstreamGuidance) evidence.push(module.coverage.upstreamGuidance);
    lines.push(
      `| ${module.id} | ${module.coverage.disposition} | ${evidence.join("; ") || "无已识别引用，需复核"} |`,
    );
  }
  lines.push("", "## 注册、源码和文档引用问题", "");
  if (!inventory.issues.length) lines.push("本次未发现静态引用缺失；这不是运行通过。 ");
  else
    for (const issue of inventory.issues)
      lines.push(`- **${issue.code}** — \`${issue.file}\`：${issue.detail}`);
  lines.push(
    "",
    "## 已注册的源码包装器",
    "",
    "下列 loader 与展示源码文件不同，但 loader 中存在指向该源码的动态导入。它们是已有包装映射，不能误算成漏注册示例；运行结果仍未验证。",
    "",
  );
  for (const demo of inventory.demos.filter((item) => item.loaderMode === "source-via-wrapper"))
    lines.push(`- \`${demo.id}\`：\`${demo.loaderPath}\` → \`${demo.sourcePath}\``);
  lines.push(
    "",
    "## 未直接注册的 demo TSX 文件",
    "",
    "以下可能是被导入的辅助文件、历史示例或漏注册项；不自动删除或判为错误。",
    "",
  );
  for (const row of inventory.unregisteredDemoFiles) lines.push(`- \`${row.file}\``);
  lines.push("", "## 语言回退和文档可达性", "");
  const fallback = inventory.documents.flatMap((doc) =>
    doc.demoReferences
      .filter((ref) => ref.localeStatus === "english-fallback")
      .map((ref) => `${doc.file}: ${ref.key}`),
  );

  lines.push(
    fallback.length
      ? fallback.map((item) => `- ${item}`).join("\n")
      : "本次未发现文档 demo 引用回退英文；其余中文文字质量未审阅。",
  );
  const unlinked = inventory.demos.filter((demo) => !demo.referencedByDocs.length);

  lines.push(
    "",
    `已注册但未被 React MDX 的 ComponentPreview/ComponentSource 直接引用：${unlinked.length} 项。完整条目可按 inventory.json 的 referencedByDocs 空数组检索；它们仍全部保留。`,
    "",
    "## 独立核验事项（结果另见 acceptance.md）",
    "",
    "1. 从打包产物核验公开 exports 与 CSS 资源，不能用开发态 package.json 代替。",
    "2. 每次重建 Storybook 后重新生成清单，对账 index.json 实际 ID、导出与 ready-only 配置；不猜测正式 ID。",
    "3. 加载全部注册 demo/story，分类记录外部资源、控制台、交互与主题问题。",
    "4. 对全部组件族及适用状态建立视觉审阅记录，另记用户接受范围。",
    "",
    "外部资源与本地环境的具体运行问题由 P1 运行证据记录；本生成器不尝试联网，也不证明完全离线可用。",
    "",
  );

  return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const inventory = generateInventory(root);
  const outputs = new Map([
    [OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`],
    [EXCEPTIONS, renderExceptions(inventory)],
  ]);

  if (process.argv.includes("--check")) {
    const stale = [...outputs]
      .filter(
        ([file, content]) =>
          !existsSync(path.join(root, file)) ||
          readFileSync(path.join(root, file), "utf8") !== content,
      )
      .map(([file]) => file);

    if (stale.length) {
      console.error(`Inventory is missing or stale: ${stale.join(", ")}`);
      process.exitCode = 1;
    } else
      console.log(
        "Inventory artifacts match current source. Runtime and visual acceptance are not checked.",
      );
  } else {
    for (const [file, content] of outputs) {
      mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
      writeFileSync(path.join(root, file), content);
    }
    console.log(
      JSON.stringify(
        {
          generated: [...outputs.keys()],
          summary: inventory.summary,
          verification: inventory.verification,
        },
        null,
        2,
      ),
    );
  }
}
