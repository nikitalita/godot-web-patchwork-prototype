// import { Repo } from "@automerge/automerge-repo"
// import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
// import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"

import { getBranchFiles } from "./automerge_getter"

// // const repo = new Repo({
// //   storage: new IndexedDBStorageAdapter("./db"),
// //   network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")]
// // })


export function getProjectAndImportAndLaunch(editor: any, docId: string) {
  //   editor.copyToFS('/tmp/preload.zip', zip);
  // }
  // try {
  //   // Avoid user creating project in the persistent root folder.
  //   editor.copyToFS('/home/web_user/keep', new Uint8Array());
  // } catch (e) {
  //   // File exists
  // }
  // selectVideoMode();
  // showTab('editor');
  // setLoaderEnabled(false);

  // all we're doing is 

  const branchFiles = getBranchFiles(docId).then((map) => {
    // print number of files
    console.log("Got branch files: ", map.size);
    if (!editor) {
      throw new Error("Editor is not initialized");
    }
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
        // '--headless',
        "-e",
        // "-q"
      ]
    )
    window.showTab('editor');
    window.setLoaderEnabled(false);
    editor.start({ 'args': editor_args, 'persistentDrops': false }).then(function () {
      // setStatusMode('hidden');
      // wait for 10 seconds for it to import the files
      // setTimeout(() => {
        // start the project
      // editor.start({ 'args': args, 'persistentDrops': true })
      // }, 10000);

    });
  });
}

// declare showTab('game')

declare global {
  interface Window {
    getProjectAndImportAndLaunch: any;
    showTab: (tab: string) => void;
    setLoaderEnabled: (enabled: boolean) => void;
    OnEditorExit: any;
  }
}

window.getProjectAndImportAndLaunch = getProjectAndImportAndLaunch;