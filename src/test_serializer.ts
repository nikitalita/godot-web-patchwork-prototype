import { serializeGodotScene } from "./godot_serializer";

function test() {
    const fs = require('fs');
    const structured_content = JSON.parse(fs.readFileSync('test.json', 'utf8'));
    const serialized = serializeGodotScene(structured_content);
    // console.log(serialized);
    fs.writeFileSync('test.tscn', serialized);
}



test();