# Call Tracker Pro

A professional web-based call tracking application powered by Twilio Voice SDK. Track, manage, and analyze your phone calls with a modern, responsive interface.

## Features

### 🎯 Core Functionality
- **Web-based Dialer**: Make calls directly from your browser
- **Two-way Voice Communication**: Full Twilio Voice SDK integration
- **Call Status Tracking**: Real-time call status indicators
- **In-call Controls**: Mute, hold, and end call functionality
- **Automatic Call Logging**: Calls are automatically logged after completion

### 📊 Call Management
- **Add/Edit/Delete Calls**: Complete CRUD operations for call records
- **Last 100 Calls**: Efficient storage of your most recent calls
- **Search & Filter**: Find calls by contact name, phone number, or type
- **Statistics Dashboard**: Visual overview of call metrics
- **CSV Export**: Export your call history for external analysis

### 🎨 User Experience
- **Modern UI**: Built with Tailwind CSS and Twilio brand colors
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live call status and timer updates
- **Secure Credentials**: Local storage with privacy protection

## Quick Start

### Prerequisites
- Node.js 14.0 or higher
- A Twilio account with Voice capabilities
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download the project**
   ```bash
   cd call-tracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Twilio credentials**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Twilio Setup Guide

### Getting Your Credentials

1. **Account SID & Auth Token**
   - Visit [Twilio Console](https://console.twilio.com/)
   - Find these on your dashboard

2. **API Key & Secret**
   - Go to [API Keys](https://console.twilio.com/project/api-keys)
   - Click "Create API Key"
   - Choose "Standard" key type
   - Save the SID and Secret securely

3. **TwiML Application** (Optional)
   - Go to [TwiML Apps](https://console.twilio.com/develop/voice/manage/twiml-apps)
   - Create new TwiML App
   - Set Voice webhook URL to: `https://yourdomain.com/api/voice`

4. **Phone Number** (Optional)
   - Go to [Phone Numbers](https://console.twilio.com/develop/phone-numbers/manage/search)
   - Purchase a phone number with Voice capabilities

### Security Notes
- ⚠️ **Never expose your Auth Token in frontend code**
- 🔒 Keep API secrets secure and never commit them to version control
- 🌐 Use HTTPS for production deployments
- 🛡️ Consider implementing user authentication for production use

## Usage Guide

### Making Calls
1. Enter a phone number in the dialer
2. Click the "Call" button
3. Use in-call controls for mute, hold, and end call
4. Call will be automatically logged after completion

### Managing Call History
1. **Add Manual Call**: Click "Add New Call" button
2. **Edit Call**: Click "Edit" button next to any call
3. **Delete Call**: Click "Delete" button (with confirmation)
4. **Search**: Use the search box to find specific calls
5. **Filter**: Use the dropdown to filter by call type

### Exporting Data
1. Click the "Export" button in the header
2. CSV file will download with your call history
3. Format: Contact Name, Phone Number, Type, Duration, Date & Time, Notes

### Settings Configuration
1. Click the "Settings" button in the header
2. Enter your Twilio credentials
3. Use the eye icon to toggle password visibility
4. Click "Test Connection" to verify setup
5. Save settings (stored locally in browser)

## API Endpoints

### `POST /api/token`
Generates Twilio access tokens for voice calls.

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "identity": "client-1234567890"
}
```

### `POST /api/voice`
TwiML webhook for handling voice calls.

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "twilio": {
    "configured": true,
    "accountSid": "ACxxxxxx..."
  }
}
```

### `GET /api/import-calls`
Import recent calls from Twilio (optional feature).

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restarts.

### File Structure
```
call-tracker-pro/
├── index.html          # Main application UI
├── script.js           # Frontend JavaScript
├── server.js           # Backend Node.js server
├── package.json        # Project dependencies
├── .env.example        # Environment variables template
└── README.md          # This file
```

### Customization

**Changing Colors:**
Edit the Tailwind configuration in `index.html`:
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary': '#your-color',
        'primary-dark': '#your-dark-color',
      }
    }
  }
}
```

**Buy Me a Coffee:**
Update the href in the Buy Me a Coffee button:
```html
<a href="https://www.buymeacoffee.com/yourusername" target="_blank">
```

## Deployment

### Option 1: Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy from Git repository

### Option 2: Netlify Functions
1. Adapt server endpoints to Netlify Functions
2. Deploy frontend to Netlify
3. Configure environment variables

### Option 3: DigitalOcean/AWS/Azure
1. Deploy to a VPS or cloud instance
2. Use PM2 for process management
3. Set up reverse proxy with Nginx
4. Configure SSL certificate

### Production Checklist
- [ ] Set all environment variables
- [ ] Configure HTTPS
- [ ] Set up proper domain
- [ ] Implement rate limiting
- [ ] Add user authentication (optional)
- [ ] Monitor server logs
- [ ] Set up backup strategy

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

### Requirements
- WebRTC support (for voice calls)
- Microphone permissions
- JavaScript enabled
- Local Storage support

## Troubleshooting

### Common Issues

**"Setup Required" Status**
- Check your Twilio credentials in Settings
- Verify your backend server is running
- Check browser console for errors

**"Connection Failed"**
- Verify internet connection
- Check if backend server is accessible
- Confirm Twilio credentials are correct

**Microphone Not Working**
- Check browser permissions
- Ensure HTTPS is used (required for microphone access)
- Try a different browser

**Calls Not Connecting**
- Verify Twilio account has sufficient balance
- Check if target phone number is valid
- Confirm TwiML App is configured correctly

### Debug Mode
Open browser developer tools and check the console for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- 📚 [Twilio Voice Documentation](https://www.twilio.com/docs/voice)
- 💬 [Twilio Community](https://community.twilio.com/)
- 🐛 [Report Issues](https://github.com/your-username/call-tracker-pro/issues)

---

**Call Tracker Pro** - Professional call management made simple with Twilio Voice SDK.