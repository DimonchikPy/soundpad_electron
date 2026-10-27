import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import Store from 'electron-store'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 700,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

interface Sound {
  id: number;
  name: string;
  hotkey: string;
  path: string;
}

interface Schema {
  sounds: Sound[]
}

const store = new Store<Schema>({
  schema: {
    sounds: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        id:   { type: 'number' },
        name: { type: 'string', minLength: 1 },
        hotkey: { type: 'string'},
        path: { type: 'string', minLength: 1 }
      },
      required: ['id', 'name'],
      additionalProperties: false   // запрет «лишних» полей
    }
  }},
  encryptionKey: "aaesge13"
});

ipcMain.handle("store:sound:add", (_event, id, name, hotkey, path) => {
  const sounds = store.get("sounds", []);
  store.set("sounds", [...sounds, {id, name, hotkey, path}])
  return true
})

ipcMain.handle("store:sound:del", (_event, id) => {
  const sounds = store.get('sounds', []);
  store.set('sounds', sounds.filter((v) => v.id !== id))
  return true
})

ipcMain.handle("store:sound:getall", (_event) => {return store.get("sounds", [])})

if (is.dev) {
  ipcMain.handle('dev:store:clear', () => {
    store.clear()
    return true
  })
}

ipcMain.handle("window:new-sound", () => {
  if (!mainWindow) return

  const modalWindow = new BrowserWindow({
    width: 400,
    height: 350,
    parent: mainWindow,
    resizable: false,
    modal: true,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.ts'),
      sandbox: true
    }
  })
  modalWindow.on("ready-to-show", () => modalWindow.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    modalWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/add-sound`)
  } else {
    modalWindow.loadFile(join(__dirname, '../renderer/index.html'), {hash: 'add-sound'})
  }
  return true
})

ipcMain.handle('dialog:open-file', async () => {
  if (!mainWindow) return null
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav'] }] // Настройте под свои нужды
  })
  
  if (canceled || filePaths.length === 0) return null
  return filePaths[0] // Возвращаем абсолютный путь
})

// 3. Обработчик закрытия окна по кнопке (если нужно)
ipcMain.on('window:close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.close()
  return true
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
