import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Discord OAuth2 endpoints
const DISCORD_API_BASE = 'https://discord.com/api/v10';

app.get('/api/login', (req, res) => {
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.redirect(discordAuthUrl);
});

app.get('/api/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info
    const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userResponse.json();

    // Get user guilds
    const guildsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userGuilds = await guildsResponse.json();

    // Get bot guilds to filter
    const botGuildsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });
    const botGuilds = await botGuildsResponse.json();
    const botGuildIds = new Set(botGuilds.map(guild => guild.id));

    // Filter user guilds to only show where bot is present
    const filteredGuilds = userGuilds.filter(guild => botGuildIds.has(guild.id));

    // Return success with user data and guilds
    res.redirect(`http://localhost:5173/dashboard?token=${tokenData.access_token}&user=${encodeURIComponent(JSON.stringify(userData))}&guilds=${encodeURIComponent(JSON.stringify(filteredGuilds))}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/guilds/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Get user guilds
    const guildsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userGuilds = await guildsResponse.json();

    // Get bot guilds to filter
    const botGuildsResponse = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });
    const botGuilds = await botGuildsResponse.json();
    const botGuildIds = new Set(botGuilds.map(guild => guild.id));

    // Filter user guilds to only show where bot is present
    const filteredGuilds = userGuilds.filter(guild => botGuildIds.has(guild.id));

    res.json({ guilds: filteredGuilds });
  } catch (error) {
    console.error('Guilds fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});