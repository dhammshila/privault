/**
 * Seed data for instant preview and demo evaluation
 */

export const DEMO_MASTER_PASSWORD = 'Vault123!';

export const INITIAL_DEMO_ITEMS = [
  {
    id: 'demo-1',
    category: 'notes',
    title: 'IIITL Web Wing Project Roadmap',
    tags: ['#iiitl', '#webwing', '#react', '#project'],
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isFavorite: true,
    plainData: {
      content: `### IIIT Lucknow Web Development Project
- Goal: Build Vault — Personal Data Control Center
- Tech Stack: React, Web Crypto API, Glassmorphism CSS, Canvas Knowledge Graph
- Target features: Zero-Knowledge encryption, Cmd+K search, Security Audit Dashboard`
    }
  },
  {
    id: 'demo-2',
    category: 'credentials',
    title: 'Production AWS Secret Key',
    tags: ['#cloud', '#aws', '#apikeys', '#prod'],
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isFavorite: true,
    plainData: {
      username: 'iam_admin_iiitl',
      secretKey: 'AKIAIOSFODNN7EXAMPLE_SECRET_PROD_2026',
      serviceUrl: 'https://console.aws.amazon.com',
      notes: 'Used for deployment pipeline and S3 buckets'
    }
  },
  {
    id: 'demo-3',
    category: 'snippets',
    title: 'AES-GCM Web Crypto Helper',
    tags: ['#javascript', '#crypto', '#code', '#react'],
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isFavorite: false,
    plainData: {
      language: 'javascript',
      code: `async function encryptMessage(message, key) {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(message)
  );
  return { ciphertext, iv };
}`
    }
  },
  {
    id: 'demo-4',
    category: 'bookmarks',
    title: 'React 18 & Web APIs Documentation',
    tags: ['#docs', '#react', '#frontend', '#webwing'],
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isFavorite: true,
    plainData: {
      url: 'https://react.dev/reference/react',
      notes: 'Primary reference for custom hooks and concurrent rendering'
    }
  },
  {
    id: 'demo-5',
    category: 'credentials',
    title: 'GitHub Personal Access Token',
    tags: ['#git', '#apikeys', '#github'],
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isFavorite: false,
    plainData: {
      username: 'dhammshila-dev',
      secretKey: 'ghp_99887766554433221100exampleToken',
      serviceUrl: 'https://github.com',
      notes: 'Scopes: repo, workflow, read:org'
    }
  },
  {
    id: 'demo-6',
    category: 'notes',
    title: 'IIITL Hackathon Idea Checklist',
    tags: ['#iiitl', '#hackathon', '#ideas'],
    updatedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    isFavorite: false,
    plainData: {
      content: `1. Ensure real-time interactivity
2. Use modern CSS Variables and Dark Mode aesthetics
3. Implement keyboard accessibility (Cmd+K)
4. Provide zero-knowledge privacy guarantees`
    }
  }
];
