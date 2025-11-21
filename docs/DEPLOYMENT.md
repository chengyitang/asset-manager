# Deployment Guide

This guide covers different deployment options for the Asset Manager application.

## 🚀 Vercel (Recommended)

Vercel is the easiest and recommended way to deploy Next.js applications.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/assetManager)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   - Go to your project in Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all variables from `.env.local`:
     - `GOOGLE_SHEET_ID`
     - `GOOGLE_CLIENT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `FINNHUB_API_KEY` (optional)

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

---

## 🐳 Docker Deployment

### Build Docker Image

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:20-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build the image**:
   ```bash
   docker build -t asset-manager .
   ```

3. **Run the container**:
   ```bash
   docker run -p 3000:3000 \
     -e GOOGLE_SHEET_ID="your_sheet_id" \
     -e GOOGLE_CLIENT_EMAIL="your_email" \
     -e GOOGLE_PRIVATE_KEY="your_key" \
     -e FINNHUB_API_KEY="your_key" \
     asset-manager
   ```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  asset-manager:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}
      - GOOGLE_CLIENT_EMAIL=${GOOGLE_CLIENT_EMAIL}
      - GOOGLE_PRIVATE_KEY=${GOOGLE_PRIVATE_KEY}
      - FINNHUB_API_KEY=${FINNHUB_API_KEY}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## ☁️ AWS Deployment

### AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New app" > "Host web app"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Add Environment Variables**
   - Navigate to App settings > Environment variables
   - Add all required variables

### AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - Select t2.micro (or larger)
   - Configure security group (allow ports 22, 80, 443)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

4. **Clone and Setup**
   ```bash
   git clone https://github.com/yourusername/assetManager.git
   cd assetManager
   npm install
   ```

5. **Configure Environment**
   ```bash
   nano .env.local
   # Add your environment variables
   ```

6. **Build and Start**
   ```bash
   npm run build
   pm2 start npm --name "asset-manager" -- start
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/asset-manager
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/asset-manager /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🌐 Netlify

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add Environment Variables**
   - Go to Site settings > Environment variables
   - Add all required variables

4. **Deploy**
   - Netlify will automatically deploy on push

---

## 🔧 Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `GOOGLE_SHEET_ID` - Your Google Sheet ID
- [ ] `GOOGLE_CLIENT_EMAIL` - Service account email
- [ ] `GOOGLE_PRIVATE_KEY` - Service account private key
- [ ] `FINNHUB_API_KEY` - Finnhub API key (optional)

---

## 🔒 Security Considerations

### Production Checklist

- [ ] All environment variables are set correctly
- [ ] `.env.local` is not committed to version control
- [ ] Google Service Account has minimal required permissions
- [ ] HTTPS is enabled (automatic on Vercel/Netlify)
- [ ] API keys are rotated periodically
- [ ] Error messages don't expose sensitive information

### Google Sheets Security

- Only share the sheet with the service account email
- Don't share the sheet publicly
- Regularly audit sheet access permissions
- Use a dedicated sheet for production data

---

## 📊 Monitoring & Maintenance

### Vercel Analytics

Enable Vercel Analytics for:
- Page view tracking
- Performance monitoring
- Error tracking

### Logs

- **Vercel**: View logs in the Vercel dashboard
- **Docker**: `docker logs asset-manager`
- **PM2**: `pm2 logs asset-manager`

### Updates

Keep dependencies updated:
```bash
npm outdated
npm update
```

---

## 🆘 Troubleshooting

### Build Failures

- Check Node.js version (requires 20.x or higher)
- Verify all dependencies are installed
- Check for TypeScript errors: `npm run lint`

### Runtime Errors

- Verify environment variables are set correctly
- Check Google Sheets API permissions
- Review application logs

### Performance Issues

- Enable caching for API responses
- Optimize image loading
- Use Vercel Edge Functions for better performance

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [AWS Amplify Guide](https://docs.amplify.aws/)
