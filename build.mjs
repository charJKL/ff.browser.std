import esbuild from "esbuild";
import { glob } from "glob";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { clean } from "esbuild-plugin-clean";


const natives = await glob("./src/classes/native/*");

// TODO Okey but now how to setup tsc --noEmit for type checking?
// TODO create second script for watch, and share configuration between both
const ctx1 = await esbuild.context({
	entryPoints: [
		"./src/index.ts",
		"./src/api.ts",
		"./src/backend.ts",
		"./src/frontend.ts",
		"./src/frontend.react.ts",
		"./src/functions.ts",
		"./src/ex.ts",
		...natives,
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




