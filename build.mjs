import esbuild from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { clean } from "esbuild-plugin-clean";

// TODO Okey but now how to setup tsc --noEmit for type checking?
// TODO create second script for watch, and share configuration between both
const ctx1 = await esbuild.context({
	entryPoints: [
		"./src/api.ts",
		"./src/backend.ts",
		"./src/ex.ts",
		"./src/frontend.react.ts",
		"./src/frontend.ts",
		"./src/index.ts"
	],
	external: ["react"],
	outdir: "./dist/",
	tsconfig: "./tsconfig.json",
	platform: "neutral",
	sourcemap: true,
	bundle: true,
	plugins:
	[
		dtsPlugin(),
		clean({ patterns: ['./dist/*'] }),
	]
});

await ctx1.rebuild();
ctx1.dispose();




