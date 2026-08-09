# 🔐 Vault — Personal Data Control Center

> **Zero-Knowledge Encrypted Personal Data Dashboard & Knowledge Graph**  
> *Built with React, JavaScript, and native Web Crypto API (AES-GCM 256-bit + PBKDF2)*

---

## 🌟 Overview

**Vault** is a privacy-first, client-side control center that solves the modern problem of fragmented personal data. Notes, API keys, developer code snippets, web bookmarks, and logs are unified into a single glassmorphic dashboard protected by **Zero-Knowledge Client-Side Encryption**.

No unencrypted plaintext ever leaves your browser or touches disk storage.

---

## 🔥 Key "WOW" Features

1. 🔒 **Zero-Knowledge Client-Side Encryption**
   - Native browser `Web Crypto API` (`AES-GCM` 256-bit with `PBKDF2` key derivation over 100,000 iterations).
   - LocalStorage only contains unreadable ciphertext string blobs and salt hashes.

2. ⌨️ **Command Palette (`Cmd/Ctrl + K`)**
   - Instant fuzzy search across notes, credentials, snippets, and bookmarks.
   - Quick execution of system actions with keyboard navigation.

3. 🕸️ **Interactive Knowledge Graph Visualizer**
   - Node-link graph connecting tag hubs to vault entries.
   - Drag-and-drop node physics, click-to-filter, and glow highlight effects.

4. 📊 **Security Health Audit Dashboard**
   - Real-time rating gauge (0–100%), weak credential warnings, duplicate key detector, and storage distribution analytics.

5. 📦 **Encrypted Backup Export / Import**
   - One-click export of encrypted `.vault` JSON backup files for offline storage or device migration.

6. ⚡ **Evaluator Preview Mode**
   - One-click "Load Demo Vault" option on the lock screen for quick testing and review.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Encryption**: Web Crypto API (`window.crypto.subtle`)
- **Styling**: Vanilla CSS Variables, Obsidian Dark Palette, Glassmorphism, Responsive Grid
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage & In-Memory Derived Keys

---

## 🚀 Quick Start & Local Setup

```bash
# 1. Navigate to the project directory
cd /Users/dhammshila/.gemini/antigravity/scratch/vault-app

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle
npm run build
```

---

## 🏆 Evaluator Fast-Track Guide

When reviewing the application:
1. Open the app in your browser (`http://localhost:3000`).
2. Click **"Load Demo Vault"** on the lock screen to instantly decrypt pre-loaded seed entries.
3. Press **`Cmd + K`** (or `Ctrl + K`) to launch the global command palette.
4. Click **Knowledge Graph** in the sidebar to explore the interactive drag-and-drop tag node canvas.
5. Click **Security Health Audit** to inspect live password audit metrics.
