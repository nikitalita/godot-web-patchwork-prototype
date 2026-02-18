// import { Repo } from "@automerge/automerge-repo"
// import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
// import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"

import { getBranchFiles } from "./automerge_getter"

// // const repo = new Repo({
// //   storage: new IndexedDBStorageAdapter("./db"),
// //   network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")]
// // })


export function getProjectAndImport(docId: string, editorConfig: any): Promise<void> {
  return new Promise(async (resolve, reject) => {
    editorConfig.onExit = () => {
      resolve();
    };
    let editor = new window.Engine(editorConfig);
    await editor.init('godot.editor')
  // all we're doing is importing the files into the editor
    if (!editor) {
      throw new Error("Editor is not initialized");
    }
    const map = await getBranchFiles(docId)
    // print number of files
    console.log("Got branch files: ", map.size);
    for (const [filename, content] of map.entries()) {
      let file = filename.replace("res://", "");
      editor.copyToFS(`/home/web_user/project/${file}`, content);
    }

    const video_driver = 'opengl3';
    const args = ['--single-window', "--path", "/home/web_user/project"];
    if (video_driver) {
      args.push('--rendering-driver', video_driver);
    }
    const editor_args = args.concat(
      [
        // '--headless', -- this ends up throwing an error, just don't show the tab
        "-e",
        "--quit"
      ]
    )
    // window.showTab('editor');
    window.setLoaderEnabled(false);
    await editor.start({ 'args': editor_args, 'persistentDrops': false })
  });

}

// declare showTab('game')

declare global {
  interface Window {
    getProjectAndImport: any;
    showTab: (tab: string) => void;
    setLoaderEnabled: (enabled: boolean) => void;
    OnEditorExit: any;
    Engine: any;
  }
}

window.getProjectAndImport = getProjectAndImport;