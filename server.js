// Call Tracker Pro - Node.js Backend Server
// Provides secure Twilio token generation for the frontend

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (Twilio webhooks)
app.use(express.static(path.join(__dirname)));

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid = process.env.TWILIO_API_KEY;
const apiKeySecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate required environment variables
const requiredEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_API_KEY',
    'TWILIO_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file');
}

// Initialize Twilio client (only if credentials are available)
let client = null;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

// Rate limiting for token endpoint
const tokenRequestCounts = new Map();
const TOKEN_RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

function rateLimitCheck(clientId) {
    const now = Date.now();
    const requests = tokenRequestCounts.get(clientId) || [];
    
    // Remove requests older than the rate limit window
    const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= TOKEN_RATE_LIMIT) {
        return false; // Rate limit exceeded
    }
    
    recentRequests.push(now);
    tokenRequestCounts.set(clientId, recentRequests);
    return true;
}

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate Twilio Access Token
app.post('/api/token', (req, res) => {
    try {
        // Basic rate limiting based on IP
        const clientId = req.ip || 'unknown';
        
        if (!rateLimitCheck(clientId)) {
            return res.status(429).json({
                error: 'Too many token requests. Please try again later.'
            });
        }
        
        // Check if required Twilio credentials are available
        if (!accountSid || !apiKeySid || !apiKeySecret) {
            return res.status(500).json({
                error: 'Twilio credentials not configured on server'
            });
        }
        
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;
        
        // Create an access token which we will sign and return to the client
        const token = new AccessToken(
            accountSid,
            apiKeySid,
            apiKeySecret,
            {
                identity: `client-${Date.now()}`, // Unique identity for this client
                ttl: 3600 // Token valid for 1 hour
            }
        );
        
        // Create a Voice grant and add it to the token
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: twimlAppSid,
            incomingAllow: true, // Allow incoming calls
        });
        
        // If no TwiML App is configured, we can still make outbound calls
        // but need to handle the webhook differently
        if (!twimlAppSid) {
            console.warn('No TwiML App SID configured. Outbound calls may not work properly.');
        }
        
        token.addGrant(voiceGrant);
        
        // Return the token as a JWT
        res.json({
            token: token.toJwt(),
            identity: `client-${Date.now()}`
        });
        
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({
            error: 'Failed to generate access token'
        });
    }
});

// TwiML endpoint for outbound calls
app.post('/api/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    console.log('=== TwiML ENDPOINT CALLED ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Request Query:', JSON.stringify(req.query, null, 2));
    console.log('Headers:', req.headers);
    console.log('============================');
    
    // Check if this is an outbound call from our client
    // When calling from Twilio Device, the To parameter contains the destination number
    const to = req.body.To || req.query.To;
    const from = req.body.From || req.query.From;
    const direction = req.body.Direction || req.query.Direction;
    
    // Determine call type based on parameters
    // When Twilio Device makes an outbound call, it sends the destination in 'To'
    // When it's an incoming call to your Twilio number, it has a CallSid and From
    
    if (to && !req.body.CallSid) {
        // This is an outbound call from Twilio Device to external number
        console.log(`Outbound call: dialing ${to} from ${from}`);
        
        const dial = twiml.dial({
            callerId: from || phoneNumber,
            timeout: 30,
            record: 'do-not-record'
        });
        dial.number(to);
        
    } else if (req.body.CallSid && req.body.From && !to) {
        // This is an incoming call to our Twilio number
        console.log(`Incoming call from ${req.body.From} to ${req.body.To}`);
        
        twiml.say('Hello! This call is being connected to your Call Tracker application.');
        
        const dial = twiml.dial({
            timeout: 30
        });
        dial.client('call-tracker-client');
        
    } else if (to) {
        // Fallback: if we have a 'To' parameter, treat as outbound
        console.log(`Fallback outbound call: dialing ${to}`);
        
        const dial = twiml.dial({
            callerId: from || phoneNumber,
            timeout: 30
        });
        dial.number(to);
        
    } else {
        // Unknown call type
        console.log('Unknown call type, providing default response');
        console.log('Request body:', req.body);
        twiml.say('Welcome to Call Tracker Pro. Please check your configuration.');
    }
    
    console.log('TwiML Response:', twiml.toString());
    
    res.type('text/xml');
    res.send(twiml.toString());
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        twilio: {
            configured: !!(accountSid && apiKeySid && apiKeySecret),
            accountSid: accountSid ? `${accountSid.substring(0, 8)}...` : 'not configured'
        }
    });
});

// Fetch phone numbers from Twilio account
app.get('/api/phone-numbers', async (req, res) => {
    try {
        if (!client) {
            return res.status(500).json({
                error: 'Twilio client not configured'
            });
        }
        
        // Fetch phone numbers from Twilio account
        const phoneNumbers = await client.incomingPhoneNumbers.list();
        
        // Transform phone number data
        const transformedNumbers = phoneNumbers.map(number => ({
            sid: number.sid,
            phoneNumber: number.phoneNumber,
            friendlyName: number.friendlyName || number.phoneNumber,
            capabilities: {
                voice: number.capabilities.voice,
                sms: number.capabilities.sms,
                mms: number.capabilities.mms
            },
            status: 'active'
        }));
        
        res.json({
            phoneNumbers: transformedNumbers,
            count: transformedNumbers.length
        });
        
    } catch (error) {
        console.error('Error fetching phone numbers:', error);
        res.status(500).json({
            error: 'Failed to fetch phone numbers from Twilio'
        });
    }
});

// Import calls from Twilio (optional endpoint)
app.get('/api/import-calls', async (req, res) => {
    try {
        if (!client) {
            return res.status(500).json({
                error: 'Twilio client not configured'
            });
        }
        
        // Fetch recent calls from Twilio
        const calls = await client.calls.list({
            limit: 100,
            status: 'completed'
        });
        
        // Transform Twilio call data to our format
        const transformedCalls = calls.map(call => ({
            id: call.sid,
            contactName: call.direction === 'inbound' ? call.from : call.to,
            phoneNumber: call.direction === 'inbound' ? call.from : call.to,
            callType: call.direction === 'inbound' ? 'incoming' : 'outgoing',
            duration: Math.ceil(call.duration / 60), // Convert seconds to minutes
            dateTime: call.startTime.toISOString(),
            notes: `Imported from Twilio - ${call.status}`
        }));
        
        res.json({
            calls: transformedCalls,
            count: transformedCalls.length
        });
        
    } catch (error) {
        console.error('Error importing calls:', error);
        res.status(500).json({
            error: 'Failed to import calls from Twilio'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`\n🚀 Call Tracker Pro Server running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser to access the app`);
    
    if (missingVars.length > 0) {
        console.log(`\n⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
        console.log('📝 Please create a .env file with your Twilio credentials');
    } else {
        console.log('\n✅ All Twilio credentials configured');
    }
    
    console.log('\n📋 Environment variables needed:');
    console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (optional)');
    console.log('   TWILIO_PHONE_NUMBER=+1234567890 (optional)');
});