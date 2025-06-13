# Call Tracker Pro - Installation & Setup Guide

This guide will walk you through setting up and running the Call Tracker Pro application with Twilio Voice integration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Twilio Configuration](#twilio-configuration)
- [Running the Application](#running-the-application)
- [Testing Voice Calls](#testing-voice-calls)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

- **Node.js** 14.0 or higher installed
- **npm** (comes with Node.js)
- **Twilio Account** with Voice capabilities
- **Modern web browser** (Chrome, Firefox, Safari, or Edge)
- **Microphone** for voice calls
- **ngrok** (for local development with Twilio webhooks)

## Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd call-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open browser** at `http://localhost:3000`

5. **Configure Twilio** via the web interface:
   - Click the Settings icon
   - Enter your Twilio credentials
   - The app will automatically create a TwiML app for you

## Detailed Setup

### Step 1: Install Dependencies

```bash
cd call-tracker-app
npm install
```

This installs:
- Express.js (web server)
- Twilio SDK (voice capabilities)
- CORS (cross-origin support)
- dotenv (environment variables)

### Step 2: Twilio Account Setup

1. **Sign up for Twilio** at https://www.twilio.com/try-twilio
2. **Verify your phone number** (required for trial accounts)
3. **Get your credentials** from the [Twilio Console](https://console.twilio.com/)

### Step 3: Environment Configuration (Optional)

You can configure Twilio credentials in two ways:

#### Option 1: Via Web Interface (Recommended)
1. Start the server and open the web app
2. Click the Settings icon
3. Enter your Twilio credentials:
   - Account SID
   - Auth Token (required for automatic TwiML app creation)
   - API Key SID & Secret (for voice tokens)
   - Default Phone Number (optional)
4. Click "Save Settings"
5. The app will automatically create and configure a TwiML app

#### Option 2: Via Environment Variables
Create a `.env` file in the project root:

```env
# Your Twilio Account SID (found on dashboard)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your Twilio Auth Token (keep secret!)
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API Key SID (create at console.twilio.com/project/api-keys)
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API Key Secret (shown once when creating API key)
TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# TwiML App SID (optional - will be created automatically if not provided)
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your Twilio Phone Number (optional, for default caller ID)
TWILIO_PHONE_NUMBER=+1234567890

# Server port (optional, defaults to 3000)
PORT=3000
```

## Twilio Configuration

### 1. Create API Keys

1. Go to [API Keys](https://console.twilio.com/project/api-keys)
2. Click "Create API Key"
3. Name: "Call Tracker Pro"
4. Type: "Standard"
5. Save the **SID** and **Secret** immediately (secret shown only once)

### 2. Purchase a Phone Number

1. Go to [Phone Numbers](https://console.twilio.com/develop/phone-numbers/manage/search)
2. Search for a number with "Voice" capabilities
3. Purchase the number
4. Note the phone number for your `.env` file

### 3. Create TwiML Application (Automatic)

**The app now creates TwiML applications automatically!**

When you configure your credentials via the web interface:
1. The app will check for existing "Call Tracker Pro" TwiML apps
2. If found, it will use the existing app and update the webhook URL
3. If not found, it will create a new TwiML app automatically
4. The webhook URL is configured automatically based on your server URL

**Manual Creation (Optional)**:
If you prefer to create manually:
1. Go to [TwiML Apps](https://console.twilio.com/develop/voice/manage/twiml-apps)
2. Click "Create new TwiML App"
3. Configure:
   - **Friendly Name**: Call Tracker Pro
   - **Voice Request URL**: `https://your-server.com/api/voice`
   - **Request Method**: HTTP POST
4. Save and copy the **TwiML App SID**

### 4. Set Up Webhook URL

For local development, use ngrok:

```bash
# Install ngrok (if not already installed)
# macOS: brew install ngrok
# Windows: choco install ngrok
# Linux: snap install ngrok

# Start ngrok tunnel
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and update your TwiML App:
- **Voice Request URL**: `https://abc123.ngrok-free.app/api/voice`

## Running the Application

### Development Mode

```bash
# Start the server
npm start

# Or with nodemon for auto-restart
npm run dev
```

You should see:
```
🚀 Call Tracker Pro Server running on http://localhost:3000
📱 Open http://localhost:3000 in your browser to access the app
📝 Twilio credentials can be configured via the web interface
   Click the settings icon in the app to add your Twilio credentials
```

Or if credentials are already configured via environment variables:
```
🚀 Call Tracker Pro Server running on http://localhost:3000
📱 Open http://localhost:3000 in your browser to access the app
✅ Twilio credentials loaded from environment variables
```

### Accessing the Application

1. Open `http://localhost:3000` in your browser
2. Configure Twilio credentials in Settings (if not in .env)
3. Your Twilio phone numbers will load automatically
4. Select a "From" number and start making calls!

## Testing Voice Calls

### Making Your First Call

1. **Select From Number**: Choose one of your Twilio numbers from the dropdown
2. **Enter Destination**: Type the phone number you want to call
3. **Click Call**: The call should connect through your browser
4. **Use Controls**: Mute, hold, or end the call as needed

### Test Checklist

- [ ] Phone numbers load in the dropdown
- [ ] Can select a from number
- [ ] Dialer accepts phone number input
- [ ] Call connects successfully
- [ ] Audio works both ways
- [ ] Call controls (mute, end) work
- [ ] Call is logged in history
- [ ] Statistics update correctly

## Troubleshooting

### Common Issues and Solutions

#### 1. "Application Error Occurred" During Calls

**Cause**: TwiML webhook URL is incorrect or inaccessible

**Solution**:
- Verify ngrok is running: `ngrok http 3000`
- Update TwiML App URL to include `/api/voice`
- Ensure URL is HTTPS, not HTTP
- Check server is running and accessible

#### 2. No Phone Numbers in Dropdown

**Cause**: Twilio credentials not configured or invalid

**Solution**:
- Check all credentials in `.env` file
- Verify Account SID starts with "AC"
- Ensure API Key starts with "SK"
- Click refresh button next to dropdown
- Check browser console for errors

#### 3. "Connection Declined" Error (Code 31002)

**Cause**: TwiML App not configured correctly

**Solution**:
- If using web interface configuration:
  - Click Settings and re-save your credentials
  - The app will auto-create/update the TwiML app
- If using manual configuration:
  - Create TwiML App in Twilio Console
  - Add TwiML App SID to `.env`
  - Restart the server
  - Ensure webhook URL is correct

#### 4. Cannot Hear Audio / Microphone Not Working

**Cause**: Browser permissions or HTTPS requirement

**Solution**:
- Allow microphone permissions when prompted
- Use HTTPS (localhost is exception)
- Check browser supports WebRTC
- Test microphone in browser settings

#### 5. Server Won't Start

**Cause**: Port already in use or missing dependencies

**Solution**:
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 6. Calls Not Logging

**Cause**: Local storage full or disabled

**Solution**:
- Clear browser cache/storage
- Check browser allows local storage
- Try incognito/private mode
- Check browser console for errors

### Debug Mode

To see detailed logs, check the server console while making calls. The server logs:
- Incoming webhook requests
- TwiML responses generated
- Error messages
- Token generation status

### Browser Console

Press F12 to open developer tools and check for:
- JavaScript errors
- Network request failures
- WebRTC connection issues

## Production Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=ACxxx...
heroku config:set TWILIO_AUTH_TOKEN=xxx...
# ... set all other variables

# Deploy
git push heroku main

# Update TwiML App URL
# https://your-app-name.herokuapp.com/api/voice
```

### Option 2: DigitalOcean/AWS/Azure

1. Deploy Node.js application
2. Set up environment variables
3. Configure HTTPS with SSL certificate
4. Update TwiML App with production URL
5. Set up process manager (PM2)

### Security Considerations

- **Never commit** `.env` file to version control
- **Use HTTPS** in production
- **Implement authentication** for production use
- **Rate limit** API endpoints
- **Monitor** for unusual activity
- **Rotate** API keys periodically

## Getting Help

### Resources

- **Twilio Docs**: https://www.twilio.com/docs/voice
- **Project Issues**: Submit issues on GitHub
- **Twilio Support**: https://support.twilio.com/

### Common Twilio Resources

- [Voice Quickstart](https://www.twilio.com/docs/voice/quickstart)
- [TwiML Documentation](https://www.twilio.com/docs/voice/twiml)
- [Twilio Device SDK](https://www.twilio.com/docs/voice/sdks/javascript)
- [Webhook Debugging](https://www.twilio.com/docs/usage/webhooks/debugging)

---

**Need more help?** Check the server logs and browser console for detailed error messages.