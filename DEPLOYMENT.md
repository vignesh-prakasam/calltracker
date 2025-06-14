# 🚀 Deployment Guide - Call Tracker Pro

This guide covers deploying Call Tracker Pro to various free hosting platforms.

## 🌟 Recommended: Railway (Easiest)

**Why Railway?**
- ✅ $5 monthly credit (more than enough)
- ✅ Automatic HTTPS & custom domains
- ✅ Zero config deployment
- ✅ Great for Node.js apps

### Deploy to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project (in your app directory)
railway init

# 4. Deploy
railway up

# 5. Set custom domain (optional)
railway domain
```

**After deployment:**
1. Your app will be live at `https://your-app.railway.app`
2. Configure Twilio credentials via the web interface
3. Update TwiML webhook URL to your Railway URL + `/api/voice`

---

## 🎯 Alternative: Render (GitHub Integration)

**Why Render?**
- ✅ Completely free tier
- ✅ Auto-deploy from GitHub
- ✅ Built-in HTTPS

### Deploy to Render

1. **Push to GitHub** (if not already)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

3. **Configure**
   - Your app will be live at `https://your-app.onrender.com`
   - Note: Free tier sleeps after 15min inactivity

---

## ⚡ Alternative: Fly.io (Global Edge)

**Why Fly.io?**
- ✅ Global edge deployment
- ✅ 256MB RAM free
- ✅ Great performance

### Deploy to Fly.io

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Launch app (in your app directory)
fly launch

# 4. Deploy
fly deploy
```

**After deployment:**
- Your app will be live at `https://your-app.fly.dev`

---

## 🔧 Post-Deployment Setup

### 1. Configure Twilio Webhook
After deployment, update your Twilio TwiML app:

1. Go to [Twilio Console → TwiML Apps](https://console.twilio.com/develop/voice/manage/twiml-apps)
2. Find your "Call Tracker Pro" app
3. Update **Voice Request URL** to:
   ```
   https://your-deployed-url.com/api/voice
   ```

### 2. Test Your Deployment
1. Visit your deployed URL
2. Click Settings and configure Twilio credentials
3. The app will auto-configure the TwiML webhook
4. Test making a call

### 3. Custom Domain (Optional)
All platforms support custom domains:
- **Railway**: `railway domain add yourdomain.com`
- **Render**: Add custom domain in dashboard
- **Fly.io**: `fly certs add yourdomain.com`

---

## 💡 Deployment Tips

### Environment Variables
If you prefer using environment variables instead of web configuration:

**Railway:**
```bash
railway variables set TWILIO_ACCOUNT_SID=ACxxx...
railway variables set TWILIO_AUTH_TOKEN=xxx...
```

**Render:**
- Add environment variables in dashboard

**Fly.io:**
```bash
fly secrets set TWILIO_ACCOUNT_SID=ACxxx...
fly secrets set TWILIO_AUTH_TOKEN=xxx...
```

### Health Checks
All platforms will use the `/api/health` endpoint to monitor your app.

### Automatic Deployments
- **Railway**: Auto-deploys on git push
- **Render**: Auto-deploys on GitHub push
- **Fly.io**: Manual deployment with `fly deploy`

---

## 🆓 Free Tier Limitations

| Platform | RAM | Storage | Bandwidth | Sleep? |
|----------|-----|---------|-----------|--------|
| Railway | 512MB | - | Generous | No |
| Render | 512MB | - | 100GB/month | Yes (15min) |
| Fly.io | 256MB | 1GB | - | No |

**Recommendation**: Railway offers the best experience for this app.

---

## 🛠️ Troubleshooting

### "Application Error" during calls
- Check TwiML webhook URL is correct
- Ensure URL ends with `/api/voice`
- Verify app is running (not sleeping)

### Phone numbers not loading
- Check Twilio credentials are configured
- Verify API keys have correct permissions
- Check browser console for errors

### HTTPS Required
- All platforms provide automatic HTTPS
- Microphone access requires HTTPS in production

---

## 📞 Need Help?

- 📚 [Full Installation Guide](INSTALLATION.md)
- 🐛 [Report Issues](https://github.com/yourusername/call-tracker-app/issues)
- 💬 [Get Support](https://github.com/yourusername/call-tracker-app/discussions)

---

**Happy Deploying! 🚀**