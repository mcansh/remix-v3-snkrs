import fullstack from "@hiogawa/vite-plugin-fullstack";
import MagicString from "magic-string";
export function remix({ serverEnvironments: _environments = ["ssr"], serverHandler = true, } = {}) {
    const environments = new Set(_environments);
    const clientReferences = new Set();
    return [
        fullstack({
            serverEnvironments: _environments,
            serverHandler,
        }),
        {
            name: "use-client-transform",
            transform(code, id) {
                if (!code.match(/\buse client\b/))
                    return;
                const program = this.parse(code);
                if (hasDirective(program.body, "use client")) {
                    const ms = new MagicString(code);
                    if (environments.has(this.environment.name)) {
                        transformUseClient(ms, program, id, clientReferences);
                    }
                    else {
                        removeUseClient(ms, program);
                    }
                    return {
                        code: ms.toString(),
                        map: ms.generateMap({ source: id }),
                    };
                }
            },
        },
    ];
}
function transformUseClient(ms, program, id, clientReferences) {
    if (!hasHydrateImport(program.body)) {
        addHydrateImport(ms);
    }
    let hasExports = false;
    for (const exportedFunction of getExportedFunctions(program.body)) {
        hasExports = true;
        removeExport(ms, exportedFunction);
        reExportAsHydrated(ms, exportedFunction, id);
    }
    if (hasExports) {
        clientReferences.add(id);
    }
}
function removeUseClient(ms, program) {
    for (const node of program.body) {
        if (node.type === "ExpressionStatement" &&
            "directive" in node &&
            node.directive === "use client") {
            const nodeWithRange = node;
            ms.remove(nodeWithRange.start, nodeWithRange.end);
            break;
        }
    }
}
function hasDirective(body, directive) {
    return body.some((node) => node.type === "ExpressionStatement" &&
        "directive" in node &&
        node.directive === directive);
}
function getExportedFunctions(body) {
    const exportedFunctions = [];
    for (const node of body) {
        if (node.type === "ExportNamedDeclaration") {
            const nodeWithRange = node;
            if (node.declaration?.type === "VariableDeclaration") {
                for (const declarator of node.declaration.declarations) {
                    if (declarator.type === "VariableDeclarator" &&
                        declarator.id?.type === "Identifier" &&
                        (declarator.init?.type === "FunctionExpression" ||
                            declarator.init?.type === "ArrowFunctionExpression")) {
                        exportedFunctions.push({
                            name: declarator.id.name,
                            node: nodeWithRange,
                            start: nodeWithRange.start,
                            end: nodeWithRange.end,
                        });
                    }
                }
            }
            else if (node.declaration?.type === "FunctionDeclaration") {
                exportedFunctions.push({
                    name: node.declaration.id?.name || "",
                    node: nodeWithRange,
                    start: nodeWithRange.start,
                    end: nodeWithRange.end,
                });
            }
        }
    }
    return exportedFunctions;
}
function removeExport(ms, exportedFunction) {
    const exportStart = exportedFunction.start;
    const declarationStart = exportedFunction.node.declaration.start;
    ms.remove(exportStart, declarationStart);
}
function reExportAsHydrated(ms, exportedFunction, id) {
    const functionName = exportedFunction.name;
    const hydratedName = `${functionName}Hydrated`;
    const hydratedExport = `
import ___${functionName}Assets from "${id}?assets=client";
const ___${functionName}AssetsDeduped = Array.from(new Set([___${functionName}Assets.entry, ...___${functionName}Assets.js.map(a => a.href)]));
const ${hydratedName} = ___hydrated(
  JSON.stringify(___${functionName}AssetsDeduped) + "#${functionName}",
  ${functionName}
);
export { ${hydratedName} as ${functionName} };`;
    ms.append(hydratedExport);
}
function hasHydrateImport(body) {
    return body.some((node) => {
        if (node.type === "ImportDeclaration" &&
            node.source.type === "Literal" &&
            node.source.value === "@remix-run/dom") {
            return node.specifiers?.some((spec) => spec.type === "ImportSpecifier" &&
                spec.imported.type === "Identifier" &&
                spec.imported.name === "hydrate");
        }
        return false;
    });
}
function addHydrateImport(ms) {
    ms.prepend(`import { hydrated as ___hydrated } from "@remix-run/dom";\n`);
}
//# sourceMappingURL=vite-plugin-remix.js.map