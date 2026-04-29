# 🚀 INSTALLATION & SETUP GUIDE

## Step 1: Install Dependencies

```bash
# Navigate to project directory
cd online-course-platform

# Install npm packages (if offline, use --no-save)
npm install --legacy-peer-deps

# OR if npm install fails, manually install key packages:
npm install express@4.18.2 pg@8.11.3 redis@4.6.12 kafkajs@2.2.4
npm install dotenv@16.3.1 bcryptjs@2.4.3 jsonwebtoken@9.0.2 telegraf@4.14.1 axios@1.6.2 uuid@9.0.1

# Dev dependencies
npm install -D typescript@5.3.3 @types/node@20.10.6 @types/express@4.17.21 @types/pg@8.11.6
npm install -D ts-node@10.9.2 eslint@8.56.0 prettier@3.1.1 @typescript-eslint/eslint-plugin@6.17.0
```

## Step 2: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your values
nano .env
# atau
code .env
```

**Important**: Update these values:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Random string (min 32 chars)
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token (optional for dev)
- `YOUTUBE_API_KEY` - YouTube API key (optional)

## Step 3: Start Docker Services

```bash
# Make sure Docker is installed and running
docker --version

# Start PostgreSQL, Redis, Kafka
npm run docker:up

# Check if all services are healthy
docker-compose logs -f

# Wait until all "healthcheck" show "healthy" status (usually 30-60 sec)
```

## Step 4: Build TypeScript

```bash
# Compile TypeScript to JavaScript
npm run build

# Check if dist folder created
ls -la dist/
```

## Step 5: Initialize Database (Optional)

```bash
# Run migrations (creates all tables)
npm run db:migrate
```

## Step 6: Start Development Server

```bash
# Start the API server
npm run dev

# Or directly with ts-node
node --loader ts-node/esm src/index.ts
```

**Expected Output:**
```
╔════════════════════════════════════════════════╗
║  🎓 ONLINE COURSE PLATFORM - API SERVER       ║
║  ✅ Running on port 3000                      ║
║  🌐 http://localhost:3000                     ║
║  📊 Health check: http://localhost:3000/health ║
╚════════════════════════════════════════════════╝
```

## Verify Everything Works

```bash
# Test API is running
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-04-28T...",
#   "uptime": 12.345
# }

# Test API endpoints
curl http://localhost:3000/api

# Test database connection
curl http://localhost:3000/api/courses
```

## Common Issues & Solutions

### Issue: "Cannot find module 'ts-node'"
**Solution:**
```bash
npm install -D ts-node
# Or use node directly:
node --loader ts-node/esm src/index.ts
```

### Issue: "Port 5432 already in use"
**Solution:**
```bash
# Stop existing PostgreSQL
docker-compose down
docker ps  # Check what's running

# Or use different port
sed -i 's/5432:5432/5433:5432/' docker-compose.dev.yml
```

### Issue: "Kafka not healthy"
**Solution:**
```bash
# Wait longer for Kafka to start
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka
```

### Issue: "ECONNREFUSED - Database connection failed"
**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Check .env file
cat .env | grep DB_

# Restart services
npm run docker:down
npm run docker:up
```

### Issue: "Cannot use ES6 modules"
**Solution:**
```bash
# Make sure package.json has: "type": "module"
# Check package.json
grep "type" package.json

# Should show: "type": "module"
```

## Folder Structure Check

```bash
# Verify all folders created
find src -type d | sort

# Should show:
# src/
# src/db
# src/db/pg
# src/db/migrations
# src/repositories
# src/services
# src/controllers
# src/routes
# src/kafka
# src/kafka/producers
# src/kafka/consumers
# src/cache
# src/auth
# src/telegram
# src/telegram/handlers
# src/utils
# src/types
# src/middlewares
# src/config
```

## File Checklist

```
✅ package.json
✅ tsconfig.json
✅ .env.example
✅ .env (after setup)
✅ docker-compose.dev.yml
✅ src/index.ts
✅ src/db/pg/client.ts
✅ src/db/pg/base.repository.ts
✅ src/types/index.ts
✅ src/db/migrations/*.sql (8 files)
```

## Next Steps

After successful setup:

1. **Create User Repository** - Handle user CRUD
2. **Create Teacher Repository** - Handle teacher CRUD
3. **Create Auth Service** - Login/Register logic
4. **Create API Routes** - Setup Express routes
5. **Create Controllers** - Handle requests
6. **Setup Kafka** - Event processing
7. **Setup Redis Cache** - Caching logic
8. **Create Telegram Bot** - Bot handlers

## Development Workflow

```bash
# 1. Make changes in src/
nano src/controllers/course.controller.ts

# 2. Save - TypeScript automatically recompiles (with npm run dev)

# 3. Test API
curl http://localhost:3000/api/courses

# 4. Check logs
npm run docker:logs

# 5. Debug database
docker exec -it online-course-postgres psql -U postgres -d online_course_db
```

## Stopping & Cleaning

```bash
# Stop all services
npm run docker:down

# Stop and remove volumes (DELETE DATA)
docker-compose down -v

# Clean build
rm -rf dist/
npm run build

# Stop development server
# Ctrl + C in terminal
```

## Production Deployment

When ready for production:

```bash
# Use docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d

# Build optimized
npm run build

# Start production server
npm start
```

---

**Status:** ✅ Ready to start development!

Next: Create User & Auth System