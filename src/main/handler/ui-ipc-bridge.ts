import { ipcMain } from 'electron'

// Import your newly refactored direct functions
import { getNotes, saveNote, deleteNote } from '../manager/notes-manager'
import {
  getGallery,
  saveImageToGallery,
  deleteImage,
  openImageLocation,
  saveImageExternal
} from '../logic/gallery-manager'
// Import any other functions your UI explicitly calls (like adb, workflows, etc.)

export default function registerFrontendIPC() {
  // --------------------------------------------------
  // NOTES UI HANDLERS
  // --------------------------------------------------
  ipcMain.handle('get-notes', async () => {
    return await getNotes()
  })

  ipcMain.handle('save-note', async (_event, args) => {
    return await saveNote(args)
  })

  ipcMain.handle('delete-note', async (_event, filename) => {
    return await deleteNote(filename)
  })

  // --------------------------------------------------
  // GALLERY UI HANDLERS
  // --------------------------------------------------
  ipcMain.handle('get-gallery', async () => {
    return await getGallery()
  })

  ipcMain.handle('save-image-to-gallery', async (_event, args) => {
    return await saveImageToGallery(args)
  })

  ipcMain.handle('delete-image', async (_event, filename) => {
    return await deleteImage(filename)
  })

  ipcMain.handle('open-image-location', async (_event, filePath) => {
    await openImageLocation(filePath)
    return { success: true }
  })

  ipcMain.handle('save-image-external', async (_event, sourcePath) => {
    return await saveImageExternal(sourcePath)
  })

  // Add any other handlers here that your React frontend uses (e.g., 'get-workflows', 'get-running-apps')
}
