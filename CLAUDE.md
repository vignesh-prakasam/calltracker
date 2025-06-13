# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon (auto-restart)
- Server runs on `http://localhost:3000` by default

### Testing
- No automated test suite currently configured
- Manual testing available via `test-basic-functionality.html`
- Use browser developer tools to debug frontend issues

## Application Architecture

### Core Structure
This is a **single-page web application** for call tracking powered by **Twilio Voice SDK**. The app consists of:

- **Frontend**: Single-page app (`index.html` + `script.js`) using Tailwind CSS
- **Backend**: Express.js server (`server.js`) providing Twilio token generation and webhooks
- **Storage**: Browser localStorage (last 100 calls) - no database required

### Key Components

#### Backend Server (`server.js`)
- **Token Generation**: `/api/token` - Generates Twilio access tokens for Voice SDK
- **Voice Webhooks**: `/api/voice` - TwiML webhook for call routing
- **Phone Numbers**: `/api/phone-numbers` - Fetches available Twilio numbers
- **Configuration**: `/api/configure` - Dynamic Twilio credential setup
- **Health Check**: `/api/health` - Server and Twilio status

#### Frontend Application (`script.js`)
- **CallTracker Class**: Main application controller
- **Twilio Device Integration**: Real-time voice calling via WebRTC
- **Call Management**: CRUD operations for call records (stored in localStorage)
- **UI State Management**: Real-time call status, statistics, and table updates

### Data Flow

1. **Credential Setup**: Twilio credentials configured via web UI or environment variables
2. **Token Generation**: Frontend requests access token from backend for Twilio Device
3. **Voice Calls**: WebRTC calls handled by Twilio Device SDK
4. **Call Logging**: Automatic logging to localStorage (outgoing/incoming/missed calls)
5. **Webhook Processing**: Twilio sends call events to `/api/voice` endpoint

### Configuration Management

#### Twilio Credentials (Two Methods)
1. **Environment Variables** (`.env` file):
   ```
   TWILIO_ACCOUNT_SID=ACxxx...
   TWILIO_AUTH_TOKEN=xxx...
   TWILIO_API_KEY=SKxxx...
   TWILIO_API_SECRET=xxx...
   ```

2. **Web Interface**: Dynamic configuration via Settings modal
   - Credentials stored in browser localStorage
   - Automatic TwiML app creation/configuration
   - Real-time credential validation

#### TwiML App Management
- App automatically creates TwiML applications named "Call Tracker Pro"
- Webhook URL configured to point to `/api/voice` endpoint
- Supports both local development (ngrok) and production deployment

### Storage Architecture

#### Call Records (localStorage)
- **Limit**: 100 most recent calls (automatically pruned)
- **Structure**: `{ id, contactName, phoneNumber, callType, duration, dateTime, notes }`
- **Types**: incoming, outgoing, missed
- **Export**: CSV download functionality

#### Settings (localStorage)
- Twilio credentials (encrypted/obfuscated display)
- Selected default phone number
- UI preferences

### Voice SDK Integration

#### Twilio Device Setup
- Access tokens generated server-side with appropriate capabilities
- WebRTC connection established in browser
- Real-time call status updates (connecting, connected, disconnected)
- Call controls: mute, hold, end call

#### Call Routing
- Outgoing calls: Browser → Twilio → Destination
- Incoming calls: Twilio → TwiML webhook → Browser (if configured)
- All calls automatically logged with metadata

## Development Notes

### Local Development Setup
1. Install dependencies: `npm install`
2. Configure Twilio credentials via web interface or `.env` file
3. For webhooks, use ngrok: `ngrok http 3000`
4. Update TwiML app webhook URL to ngrok HTTPS URL + `/api/voice`

### Debugging
- **Server logs**: Check console output for webhook requests and errors
- **Browser console**: WebRTC connection issues and frontend errors
- **Twilio Console**: Call logs and webhook debugging tools

### Security Considerations
- API tokens generated server-side only
- Credentials stored in browser localStorage (not in code)
- Rate limiting on token endpoint (10 requests/minute per client)
- Auth token required for TwiML app creation but not stored in frontend

### Deployment Considerations
- Set `PORT` environment variable for production
- Configure all Twilio credentials as environment variables
- Ensure HTTPS for production (required for microphone access)
- Update TwiML app webhook URL to production domain