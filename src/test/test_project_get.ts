import path from "path";
import { getBranchFiles } from "../automerge_getter";
import fs from "fs";
async function testProjectGet() {
    let files = await getBranchFiles("to2i9YGkdhXy3Li4K7FoUSQ9Yzv")
    fs.mkdirSync("test_project", { recursive: true });
    for (const [filename, content] of files.entries()) {
        let file = filename.replace("res://", "");
        let basedir = path.dirname(file);
        fs.mkdirSync(`test_project/${basedir}`, { recursive: true });
        fs.writeFileSync(`test_project/${file}`, content);
    }

}

testProjectGet().then(() => {
    console.log("done");
}).catch((error) => {
    console.error(error);
});