# Render Deployment Guide

This guide will help you deploy the ACT Coaching For Life application on Render with separate frontend and backend services.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Supabase Project**: Set up your Supabase database
4. **Environment Variables**: Prepare your environment configuration

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub**: Ensure all your code is committed and pushed to your GitHub repository
2. **Verify render.yaml**: The `render.yaml` file is already configured for both services

### Step 2: Deploy Backend Service

1. **Go to Render Dashboard**: Navigate to [dashboard.render.com](https://dashboard.render.com)
2. **Create New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**: Connect your GitHub repository
4. **Configure Service**:

   - **Name**: `therapist-matcher-backend`
   - **Root Directory**: `therapist-matcher/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (or your preferred plan)

5. **Environment Variables**:

   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ANON_KEY=your-anon-key
   JWT_SECRET=your-jwt-secret
   BCRYPT_ROUNDS=12
   ```

6. **Deploy**: Click "Create Web Service"

### Step 3: Deploy Frontend Service

1. **Create Another Web Service**: Click "New +" → "Web Service"
2. **Connect Repository**: Use the same GitHub repository
3. **Configure Service**:

   - **Name**: `therapist-matcher-frontend`
   - **Root Directory**: `therapist-matcher/frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (or your preferred plan)

4. **Environment Variables**:

   ```
   NODE_ENV=production
   PORT=10000
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://your-backend-service-url.onrender.com
   NEXT_PUBLIC_APP_NAME=ACT Coaching For Life
   NEXT_PUBLIC_ENABLE_PAYMENTS=false
   NEXT_PUBLIC_ENABLE_VIDEO_SESSIONS=false
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   NEXT_PUBLIC_DEBUG_MODE=false
   NEXT_PUBLIC_LOG_LEVEL=error
   ```

5. **Deploy**: Click "Create Web Service"

### Step 4: Update CORS Configuration

1. **Get Backend URL**: Copy the URL of your deployed backend service
2. **Update Frontend Environment**: In the frontend service settings, update `NEXT_PUBLIC_API_URL` to point to your backend URL
3. **Update Backend CORS**: In the backend service settings, add environment variable:
   ```
   CORS_ORIGIN=https://your-frontend-service-url.onrender.com
   ```

### Step 5: Test Your Deployment

1. **Test Backend**: Visit `https://your-backend-url.onrender.com/api/test`
2. **Test Frontend**: Visit your frontend URL and test the login functionality
3. **Test API Calls**: Ensure the frontend can successfully call the backend APIs

## Environment Variables Reference

### Backend Environment Variables

| Variable                    | Description               | Example                              |
| --------------------------- | ------------------------- | ------------------------------------ |
| `NODE_ENV`                  | Environment mode          | `production`                         |
| `PORT`                      | Server port               | `10000`                              |
| `CORS_ORIGIN`               | Allowed frontend origin   | `https://your-frontend.onrender.com` |
| `SUPABASE_URL`              | Supabase project URL      | `https://your-project.supabase.co`   |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...`                             |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key    | `eyJ...`                             |
| `JWT_SECRET`                | JWT signing secret        | `your-secret-key`                    |
| `BCRYPT_ROUNDS`             | Password hashing rounds   | `12`                                 |

### Frontend Environment Variables

| Variable                            | Description             | Example                             |
| ----------------------------------- | ----------------------- | ----------------------------------- |
| `NODE_ENV`                          | Environment mode        | `production`                        |
| `PORT`                              | Server port             | `10000`                             |
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase project URL    | `https://your-project.supabase.co`  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase anonymous key  | `eyJ...`                            |
| `NEXT_PUBLIC_API_URL`               | Backend API URL         | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_APP_NAME`              | Application name        | `ACT Coaching For Life`             |
| `NEXT_PUBLIC_ENABLE_PAYMENTS`       | Enable payment features | `false`                             |
| `NEXT_PUBLIC_ENABLE_VIDEO_SESSIONS` | Enable video sessions   | `false`                             |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`  | Enable notifications    | `true`                              |
| `NEXT_PUBLIC_DEBUG_MODE`            | Enable debug mode       | `false`                             |
| `NEXT_PUBLIC_LOG_LEVEL`             | Logging level           | `error`                             |

## Security Considerations

### Content Security Policy

- **Development**: Allows localhost connections for local development
- **Production**: Only allows HTTPS connections for security

### CORS Configuration

- **Development**: Allows multiple localhost origins
- **Production**: Only allows the specific frontend URL

### Environment Variables

- Never commit sensitive environment variables to Git
- Use Render's environment variable management
- Rotate secrets regularly

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Ensure `CORS_ORIGIN` is set correctly in backend
   - Check that frontend URL matches exactly

2. **API Connection Errors**:

   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check that backend service is running

3. **Build Failures**:

   - Check build logs for missing dependencies
   - Ensure all environment variables are set

4. **Runtime Errors**:
   - Check application logs in Render dashboard
   - Verify database connections

### Monitoring

1. **Render Dashboard**: Monitor service health and logs
2. **Application Logs**: Check for errors and performance issues
3. **Database Monitoring**: Monitor Supabase usage and performance

## Cost Optimization

### Render Plans

- **Starter**: $7/month per service (suitable for development)
- **Standard**: $25/month per service (suitable for production)
- **Pro**: $50/month per service (high-traffic applications)

### Recommendations

- Start with Starter plans for development
- Upgrade to Standard for production traffic
- Monitor usage and optimize as needed

## Next Steps

1. **Domain Setup**: Configure custom domain if needed
2. **SSL Certificate**: Render provides automatic SSL
3. **Monitoring**: Set up monitoring and alerting
4. **Backup Strategy**: Implement database backups
5. **CI/CD**: Set up automatic deployments from Git

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Support**: Available through dashboard
- **Application Issues**: Check logs and environment variables
