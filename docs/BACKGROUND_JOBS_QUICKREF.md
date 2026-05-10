# 🚀 Background Jobs - Quick Reference

## 📋 Common Operations

### Start All Services
```bash
npm run dev:all
```

### Create a Job (Client)
```tsx
const { createJob } = useBackgroundJobs({ userId, authToken });

await createJob({
  type: 'career-insights',
  domain: 'Software Engineering',
  userId: 'user-123',
});
```

### Check Job Status (API)
```bash
curl http://localhost:3000/api/jobs/{jobId}/status \
  -H "x-user-id: user-123"
```

### Cancel Job
```tsx
const { cancelJob } = useBackgroundJobs({ userId, authToken });
await cancelJob(jobId);
```

---

## 📊 Job Types

| Type | Queue | Data Required |
|------|-------|---------------|
| `resume-optimization` | RESUME_OPTIMIZATION | resumeText, targetRole |
| `skill-gap-analysis` | SKILL_GAP_ANALYSIS | targetRole, industry, currentSkills |
| `career-insights` | CAREER_INSIGHTS | domain, currentRole?, experienceLevel?, location? |
| `resume-generation` | RESUME_GENERATION | resumeData |
| `interview-prep` | INTERVIEW_PREP | role, level |

---

## 🔧 Environment Variables

```bash
# Required
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-32-char-secret

# Optional
REDIS_PASSWORD=
SOCKET_PORT=3001
CORS_ORIGIN=http://localhost:3000
WORKER_CONCURRENCY=5
WORKER_MAX_JOBS=10
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 🐛 Troubleshooting

### Worker not processing jobs?
```bash
# Check Redis connection
redis-cli ping

# Check worker logs
npm run worker

# View queue status
redis-cli KEYS "bull:*"
```

### Socket not connecting?
```bash
# Check socket server running
curl http://localhost:3001/health

# Verify JWT token
# Check CORS_ORIGIN matches your domain
```

### Jobs stuck?
```bash
# Check active jobs
redis-cli LRANGE bull:career-insights:active 0 -1

# Cleanup old jobs (via code)
jobManager.cleanupOldJobs(24); // 24 hours
```

---

## 📦 Key Files

```
src/lib/queue/config.ts         # Types & configuration
src/lib/queue/job-manager.ts    # Job CRUD operations
src/lib/queue/worker.ts          # Worker process
src/lib/socket-server.ts         # Socket.IO server
src/hooks/use-background-jobs.ts # React hook
src/app/api/jobs/route.ts        # API endpoints
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Manual test
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"type":"career-insights","domain":"AI","userId":"test-user"}'
```

---

## ☁️ Deploy Commands

```bash
# Worker
gcloud run deploy careerlens-worker \
  --image gcr.io/PROJECT_ID/careerlens-worker \
  --set-env-vars REDIS_HOST=10.0.0.3

# Socket
gcloud run deploy careerlens-socket \
  --image gcr.io/PROJECT_ID/careerlens-socket \
  --port 3001 \
  --set-env-vars REDIS_HOST=10.0.0.3
```

---

## 📚 Documentation

- **Full Guide**: `BACKGROUND_JOBS_README.md`
- **Summary**: `BACKGROUND_JOBS_SUMMARY.md`
- **Dependencies**: `PACKAGE_ADDITIONS.md`

---

**Last Updated**: 2024-11-21
