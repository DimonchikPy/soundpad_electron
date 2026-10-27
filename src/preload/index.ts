import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronStore', {
      getall: () => ipcRenderer.invoke('store:sound:getall'),
      add: (id: number, name: string, hotkey: string, path: string) => ipcRenderer.invoke('store:sound:add', id, name, hotkey, path),
      del: (id: number) => ipcRenderer.invoke('store:sound:del', id)
    });
    contextBridge.exposeInMainWorld("electronApi", {
      newSoundDialog: () => ipcRenderer.invoke("window:new-sound"),
      openFileDialog: () => ipcRenderer.invoke("dialog:open-file"),
      closeSoundDialog: () => ipcRenderer.invoke("window:close")
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
