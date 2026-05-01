import { PluginOption } from "vite";

//#region src/vite-plugin-remix.d.ts
declare function remix({
  clientEntry,
  serverEntry,
  serverEnvironments: _environments,
  serverHandler
}?: {
  clientEntry?: string | false;
  serverEntry?: string;
  serverEnvironments?: string[];
  serverHandler?: boolean;
}): PluginOption;
//#endregion
export { remix };
//# sourceMappingURL=index.d.ts.map