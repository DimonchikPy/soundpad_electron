import { ElectronAPI } from '@electron-toolkit/preload'
import { promises } from 'dns';

export interface Sound { id: number; name: string; hotkey: string; path: string }

export interface IElectronStoreApi{
  getall: () => Promise<Sound[]>;
  add: (id: number, name: string, hotkey: string, path: string) => Promise<boolean>;
  del: (id: number) => Promise<boolean>;
}

export interface IElectronDialogApi {
  newSoundDialog: () => Promise<boolean>;
  openFileDialog: () => Promise<boolean>;
  closeSoundDialog: () => Promise<boolean>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronStore: IElectronStoreApi
    electronApi: IElectronDialogApi
  }
}
