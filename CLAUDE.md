# 👁️ IRIS: The Neural OS - Project Context

## Project Identity

IRIS is a high-performance, local-first **Agentic Operating System (OS)**. It is not a standard web app. It is an immersive desktop environment featuring:
- Real-time conversational WebRTC audio pipeline (Gemini 2.5 Flash)
- Biometric security (Face ID / Vision-based authentication)
- Full file-system/hardware control via protected agent layer
- Autonomous task execution through LangGraph state management
- **Production-grade code protection** (V8 bytecode + ASAR integrity validation)

---

## Tech Stack

### **Frontend**
- **Framework:** Electron (Main) + React (Renderer) + Vite
- **Language:** TypeScript (Strict typing mandatory)
- **Styling:** Tailwind CSS v4 (No raw CSS)
- **Animations:** Framer Motion (UI orchestration) & GSAP (Complex loops)
- **3D Engine:** Three.js / React Three Fiber (Optimized)

### **Backend / Agent Layer**
- **AI Core:** Gemini 2.5 Flash (`BidiGenerateContent` WebRTC streaming)
- **Agentic Framework:** LangGraph StateGraph (Manual node control for full customization)
- **Agent State:** Custom TypeScript interfaces for type-safe state management
- **Tool System:** Protected tool registry with execution validation
- **LLM Integration:** @langchain/core with streaming support

### **Security & Protection**
- **Code Protection:** V8 Bytecode compilation + Protected strings obfuscation
- **Package Integrity:** ASAR with SHA256 validation on startup
- **Sandbox:** Context isolation + No Node.js in renderer process
- **Code Signing:** Ready for Windows/macOS certificate integration

---

## Project Structure

```
IRIS/
├── src/
│   ├── main/                        # ← Protected by V8 bytecode
│   │   ├── index.ts                 # Entry point
│   │   ├── agents/
│   │   │   ├── iris-ai.ts          # ⚠️ PROTECTED: Agent state graph + orchestration
│   │   │   └── index.ts
│   │   ├── tools/
│   │   │   ├── tools.ts            # ⚠️ PROTECTED: Tool implementations
│   │   │   ├── system.ts           # System execution tools
│   │   │   ├── browser.ts          # Browser automation
│   │   │   ├── vision.ts           # Vision processing
│   │   │   └── voice.ts            # Voice processing
│   │   ├── ipc/
│   │   │   └── handlers.ts         # IPC event handlers (protected)
│   │   └── utils/
│   │       ├── encryption.ts       # Encryption utilities
│   │       └── validation.ts       # Input validation
│   ├── preload/
│   │   └── index.ts                # ← Protected by V8 bytecode
│   └── renderer/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── LeftPanel.tsx   # System metrics & vision feed
│       │   │   ├── MainChat.tsx    # Agent interaction
│       │   │   └── ...
│       │   ├── hooks/
│       │   ├── services/
│       │   └── types/
│       └── index.html
├── electron.vite.config.ts          # Build config with bytecode + protectedStrings
├── electron-builder.yml             # ASAR integrity + security fuses
├── package.json
└── tsconfig.json
```

---

## Core Commands

```bash
# Development
npm run dev                 # Start with hot reload

# Production Build (Protected)
npm run build              # Generic build
npm run build:win          # Windows NSIS installer (ASAR + bytecode protected)
npm run build:mac          # macOS DMG (hardened runtime)
npm run build:linux        # Linux AppImage

# Code Quality
npm run lint               # ESLint checks
npm run typecheck          # TypeScript compilation
```

---

## Code Protection Model

### **Layer 1: V8 Bytecode Compilation**

Your proprietary agent and tools code is compiled to **unreadable binary bytecode**:

```typescript
// Build Process
src/main/agents/iris-ai.ts
    ↓ (TypeScript)
src/main/agents/iris-ai.js
    ↓ (V8 Compilation)
out/main/agents/iris-ai.jsc  ← Bytecode (unreadable, protected)
    ↓
ASAR Archive (further protected)
    ↓
Final .exe/.dmg/.AppImage (Distributed)
```

**Configuration** (`electron.vite.config.ts`):
```typescript
main: {
  build: {
    bytecode: {
      transformArrowFunctions: true,  // Fixes async/await issues
      removeBundleJS: true,           // Delete .js after compilation
      protectedStrings: [             // Obfuscate sensitive text
        'Your system prompt',
        'Tool definitions',
        'Agent instructions',
        // ... any sensitive strings from iris-ai.ts & tools.ts
      ]
    }
  }
}
```

### **Layer 2: Protected Strings Obfuscation**

Sensitive strings are transformed into obfuscated functions:

```typescript
// BEFORE (readable)
const SYSTEM_PROMPT = "You are IRIS AI, an autonomous agent..."

// AFTER (in bytecode, completely hidden)
const SYSTEM_PROMPT = (function(){
  return String.fromCharCode(89, 111, 117, 32, 97, 114, 101, ...)
})()
```

### **Layer 3: ASAR Integrity Validation**

The entire app is packaged in a **tamper-proof ASAR archive** with runtime integrity checks:

```yaml
# electron-builder.yml
electronFuses:
  EnableEmbeddedAsarIntegrityValidation: true  # ← Validates all files at startup
  OnlyLoadAppFromAsar: true                    # ← Only loads from ASAR
  
asar:
  integrity: true  # SHA256 hashing on build, validation on run
```

**Result:** If ANY file is modified → **App crashes immediately** (tampering detected).

### **Layer 4: Window Isolation**

Renderer windows cannot directly access each other:

```yaml
electronFuses:
  RestrictedWindowAccess: true  # Windows must go through Main Process (IPC)
  EnableContextIsolation: true  # Memory isolation
  EnableNodeIntegration: false  # No Node.js in renderer
```

---

## Agent Architecture

### **State Management (LangGraph)**

IRIS uses **LangGraph StateGraph** for full control over agent execution:

```typescript
// Define agent state
interface AgentState {
  messages: (HumanMessage | AIMessage)[]
  tools_called: string[]
  execution_count: number
  status: 'thinking' | 'executing' | 'complete' | 'error'
}

// Create state graph with manual nodes
const graph = new StateGraph<AgentState>()
  .addNode('think', thinkingNode)           // LLM reasoning
  .addNode('execute_tools', toolNode)       // Tool execution
  .addNode('decide', decisionNode)          // Loop control
  .compile()
```

### **Tool Registration**

Tools are registered dynamically for security:

```typescript
// In iris-ai.ts
export function registerTool(tool: Tool): void {
  if (registeredTools.has(tool.name)) return
  registeredTools.set(tool.name, tool)
  console.log(`[IRIS] Tool registered: ${tool.name}`)
}

// In tools.ts (protected)
export const IRIS_TOOLS: Tool[] = [
  SystemExecutionTool,      // Safe command execution
  FileOperationTool,        // Restricted file access
  BrowserAutomationTool,    // Web automation
  VisionProcessingTool,     // Image/video processing
  VoiceProcessingTool,      // Audio processing
]
```

### **WebRTC Audio Pipeline**

Real-time bidirectional audio via Gemini 2.5 Flash:

```typescript
// Buffering (min 4096 frames)
const audioBuffer: Float32Array[] = []

// Streaming setup
const connection = await bidiStream.send({
  realTimeUserInput: {
    mediaChunks: audioBuffer  // PCM data
  }
})

// Interrupt detection
if (interruptFlag) {
  connection.cancel()         // Instantly cancel active audio
}
```

---

## Global Engineering Rules

### **1. The IPC Bridge**

**NEVER import Node modules in React (renderer):**

```typescript
// ❌ FORBIDDEN in src/renderer/
import fs from 'fs'
import { execSync } from 'child_process'

// ✅ CORRECT: Use IPC bridge
const data = await window.electron.ipcRenderer.invoke('read-file', path)
```

**IPC Handler (Main Process, Protected):**

```typescript
// src/main/ipc/handlers.ts (← Protected by bytecode)
ipcMain.handle('read-file', async (event, filePath) => {
  // Validate path
  if (!isPathSafe(filePath)) throw new Error('Path traversal blocked')
  
  // Execute
  return await fs.promises.readFile(filePath, 'utf-8')
})
```

### **2. Premium OS Aesthetic**

IRIS uses a **dark glassmorphic design**:

```tsx
// Standard panel component
<div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
  {/* Content */}
</div>

// Never use default web-app styling
// ❌ Material Design
// ❌ Flat colors
// ✅ Glassmorphism + Neon accents + Smooth animations
```

### **3. Agent Security**

Validate all tool execution:

```typescript
// In tools.ts (protected)
export function validateToolExecution(
  toolName: string,
  input: string,
  userContext?: { user_id?: string; permissions?: string[] }
): { valid: boolean; error?: string } {
  // Check tool exists
  if (!IRIS_TOOLS.find(t => t.name === toolName)) {
    return { valid: false, error: `Tool ${toolName} not found` }
  }
  
  // Check input size
  if (input.length > 50000) {
    return { valid: false, error: 'Input too large' }
  }
  
  // Check permissions
  if (userContext?.permissions) {
    const hasPermission = userContext.permissions.includes(`tool:${toolName}`)
    if (!hasPermission) {
      return { valid: false, error: `Permission denied: ${toolName}` }
    }
  }
  
  return { valid: true }
}
```

### **4. Audio Latency Management**

WebRTC audio buffering prevents flooding:

```typescript
// Buffer before sending (min 4096 frames @ 16kHz = 256ms)
const BUFFER_SIZE = 4096
const audioBuffer: Float32Array[] = []

audioProcessor.onprocessingdata = (chunk) => {
  audioBuffer.push(chunk)
  
  if (audioBuffer.length >= BUFFER_SIZE) {
    // Send buffered audio
    bidiStream.send({
      realTimeUserInput: {
        mediaChunks: audioBuffer
      }
    })
    audioBuffer.length = 0  // Clear buffer
  }
}
```

### **5. Cinematic Error Handling**

Never show raw JS errors:

```typescript
// ❌ BAD: Raw error
console.error('Error:', error)

// ✅ GOOD: Themed error HUD
try {
  await executeTask()
} catch (error) {
  showErrorHUD({
    title: 'Execution Failed',
    message: error.message,
    theme: 'iris',          // Custom theme
    autoClose: 5000
  })
}
```

### **6. TypeScript Strictness**

All code must be strictly typed:

```typescript
// ✅ GOOD
interface Tool {
  name: string
  description: string
  execute: (input: string) => Promise<string>
}

const tool: Tool = { ... }

// ❌ BAD
const tool: any = { ... }
const result = tool.execute()  // Type unknown
```

---

## Build & Deployment

### **Development Build**

```bash
npm run dev
# Starts Electron with hot reload
# Renderer: http://localhost:5173
# Main: Watches src/main
```

### **Production Build (Protected)**

```bash
# Build & package
npm run build:win

# Output: dist/IRIS-AI-1.3.0-setup.exe
# Inside: ASAR archive with V8 bytecode + integrity validation
```

### **Verification**

```bash
# Check bytecode compilation
ls out/main/agents/iris-ai.jsc     # ✅ Should exist
ls out/main/tools/tools.jsc        # ✅ Should exist

# Verify no source leakage
find out -name "*.ts"              # ✅ Should be EMPTY
find out -name "*.map"             # ✅ Should be EMPTY

# Confirm ASAR integrity
strings dist/IRIS*.asar | grep sha256  # ✅ Shows validation
```

---

## Environment Variables

**Never hardcode secrets.** Use `.env`:

```bash
# .env (development)
VITE_AGENT_API_KEY=sk_test_...
VITE_VISION_API_KEY=...

# .env.production
VITE_AGENT_API_KEY=sk_prod_...
VITE_VISION_API_KEY=...
```

**In code:**

```typescript
// ✅ CORRECT: Load from env
const apiKey = process.env.VITE_AGENT_API_KEY

// ❌ WRONG: Hardcoded
const apiKey = "sk_hardcoded_secret"
```

---

## Performance Targets

- **Agent Response Time:** < 200ms (thinking) + streaming audio
- **Vision Processing:** 1 FPS for Gemini vision (60 FPS local capture)
- **Memory Usage:** < 500MB baseline (UI + agent + models)
- **Audio Latency:** < 500ms end-to-end (buffer + network + processing)
- **Build Size:** < 200MB (installer) with maximum compression

---

## Security Checklist

Before deployment:

- [ ] All agent/tools code compiled to bytecode (.jsc files exist)
- [ ] No `.ts` or `.map` files in output directory
- [ ] ASAR integrity validation enabled
- [ ] `EnableEmbeddedAsarIntegrityValidation: true` in fuses
- [ ] `OnlyLoadAppFromAsar: true` in fuses
- [ ] `RestrictedWindowAccess: true` for window isolation
- [ ] All secrets in `.env`, not in code
- [ ] IPC handlers validate all inputs
- [ ] No Node modules imported in renderer
- [ ] TypeScript strict mode enabled

---

## Debugging

```bash
# View main process logs
npm run dev  # Logs appear in terminal

# View renderer logs
# Open DevTools: Ctrl+Shift+I (Windows) / Cmd+Option+I (macOS)

# Debug bytecode build
npm run build -- --verbose

# Check final package
unrar l dist/IRIS*.asar  # List ASAR contents (encrypted/binary)
```

---

## References

- **LangGraph:** https://github.com/langchain-ai/langgraph
- **Electron Security:** https://www.electronjs.org/docs/tutorial/security
- **Gemini WebRTC:** https://ai.google.dev/gemini-2/docs/live-streaming
- **electron-vite:** https://electron-vite.org/
- **Electron Fuses:** https://www.electronjs.org/docs/latest/tutorial/fuses

---

**IRIS is production-ready with enterprise-grade code protection.** 🚀🔐