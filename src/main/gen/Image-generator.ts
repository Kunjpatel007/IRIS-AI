import { BrowserWindow, app, safeStorage } from 'electron'
import path from 'path'
import fs from 'fs'
import { InferenceClient } from '@huggingface/inference'

export const handleImageGeneration = async (prompt: string) => {
  const mainWindow = BrowserWindow.getAllWindows()[0]

  // Direct replacement for window.dispatchEvent -> push out via main window IPC
  if (mainWindow) {
    mainWindow.webContents.send('image-gen', { prompt: prompt, loading: true, base64: '' })
  }

  try {
    let hfKey = ''
    const secureConfigPath = path.join(app.getPath('userData'), 'iris_secure_vault.json')

    // ── 1. Match your index.ts Secure Storage Sync Engine ──
    if (fs.existsSync(secureConfigPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(secureConfigPath, 'utf8'))
        if (data.hf) {
          if (safeStorage.isEncryptionAvailable()) {
            hfKey = safeStorage.decryptString(Buffer.from(data.hf, 'base64'))
          } else {
            hfKey = Buffer.from(data.hf, 'base64').toString('utf8')
          }
        }
      } catch (e) {
        console.error('Failed to parse secure vault for HF key:', e)
      }
    }

    if (!hfKey || hfKey.trim() === '') {
      throw new Error(
        'Missing Hugging Face API Key. Please enter it in the Command Center Vault (Settings Tab).'
      )
    }

    const client = new InferenceClient(hfKey)

    // ── 2. Request Image Matrix ──
    const imageBlob: any = await client.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: prompt
    })

    // ── 3. Convert Blob to Node Buffer Base64 (No browser window API dependencies) ──
    const arrayBuffer = await imageBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`

    // Dispatch success to frontend
    if (mainWindow) {
      mainWindow.webContents.send('image-gen', {
        base64: base64Image,
        prompt: prompt,
        loading: false,
        error: false
      })
    }

    return `Visual generated successfully using FLUX.`
  } catch (e: any) {
    let errorMessage = e.message

    if (errorMessage.includes('503') || errorMessage.includes('loading')) {
      errorMessage = 'Model is warming up (Free Tier). Please try again in 20 seconds.'
    }

    // Dispatch failure to frontend
    if (mainWindow) {
      mainWindow.webContents.send('image-gen', {
        base64: '',
        prompt: prompt,
        loading: false,
        error: true,
        errorMessage: errorMessage
      })
    }

    return `Generation failed: ${errorMessage}`
  }
}
