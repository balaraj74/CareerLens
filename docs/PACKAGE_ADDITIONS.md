# Add these dependencies to your package.json

{
  "dependencies": {
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.2",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5",
    "concurrently": "^8.2.2"
  },
  "scripts": {
    "dev": "next dev",
    "worker": "ts-node --project tsconfig.node.json src/lib/queue/worker.ts",
    "socket": "ts-node --project tsconfig.node.json src/lib/socket-server.ts",
    "dev:all": "concurrently -n \"next,worker,socket\" -c \"cyan,magenta,green\" \"npm run dev\" \"npm run worker\" \"npm run socket\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:integration": "jest tests/integration"
  }
}

# Create tsconfig.node.json for worker/socket compilation

{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true
  },
  "include": ["src/lib/queue/**/*", "src/lib/socket-server.ts"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
