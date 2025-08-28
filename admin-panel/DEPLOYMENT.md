# Deployment Guide

This guide will help you deploy the CoHub Admin Panel to production.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**
   In your Vercel dashboard, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_APP_NAME`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect your Git repository

3. **Set Environment Variables**
   In Netlify dashboard under Site Settings > Environment Variables

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=0 /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf

   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   events {
     worker_connections 1024;
   }

   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;

     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
         try_files $uri $uri/ /index.html;
       }
     }
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t cohub-admin .
   docker run -p 80:80 cohub-admin
   ```

## 🗄️ Database Setup

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your URL and anon key

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the contents of `src/lib/database-schema.sql`

3. **Create Admin User**
   ```sql
   -- First, sign up through Supabase Auth, then run:
   INSERT INTO admin_users (id, email, full_name, role) 
   VALUES ('your-auth-user-id', 'admin@yourdomain.com', 'Admin Name', 'super_admin');
   ```

### Production Database Considerations

1. **Backup Strategy**
   - Enable automatic backups in Supabase
   - Set up point-in-time recovery
   - Regular data exports

2. **Security**
   - Review RLS policies
   - Enable database SSL
   - Monitor access logs

3. **Performance**
   - Add indexes for large datasets
   - Monitor query performance
   - Set up connection pooling if needed

## 🔐 Security Checklist

### Environment Variables
- [ ] All sensitive data in environment variables
- [ ] No hardcoded secrets in code
- [ ] Different keys for staging/production

### Authentication
- [ ] Strong password requirements
- [ ] Session timeout configured
- [ ] Admin user access audited

### Database
- [ ] RLS policies active
- [ ] Regular security updates
- [ ] Access logs monitored

### Application
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Error messages don't leak info

## 📊 Monitoring & Analytics

### Error Tracking
```bash
# Add Sentry (optional)
npm install @sentry/react
```

### Performance Monitoring
- Monitor Core Web Vitals
- Track API response times
- Monitor database query performance

### User Analytics
- Track admin actions
- Monitor system usage
- Generate usage reports

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Scaling Considerations

### Frontend Scaling
- Use CDN for static assets
- Implement code splitting
- Optimize bundle size
- Add service worker for caching

### Backend Scaling
- Monitor Supabase usage
- Consider read replicas for high load
- Implement connection pooling
- Cache frequently accessed data

### Database Scaling
- Monitor table sizes
- Implement archiving for old data
- Add proper indexes
- Consider partitioning for large tables

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Authentication Issues**
   - Verify Supabase URL and key
   - Check admin_users table has entries
   - Verify RLS policies are correct

3. **Database Connection**
   - Check Supabase project status
   - Verify network connectivity
   - Check environment variables

4. **Performance Issues**
   - Monitor bundle size
   - Check for memory leaks
   - Optimize database queries

### Debug Commands

```bash
# Check build
npm run build

# Preview production build
npm run preview

# Check environment variables
echo $VITE_SUPABASE_URL

# Test database connection
# (Add to your app for debugging)
```

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Check Supabase dashboard
4. Contact your hosting provider

## 🔄 Updates & Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review security patches
- [ ] Monitor error logs
- [ ] Backup database regularly
- [ ] Test deployment pipeline

### Version Updates
1. Test in staging first
2. Update dependencies
3. Run full test suite
4. Deploy to production
5. Monitor for issues

---

Happy deploying! 🚀