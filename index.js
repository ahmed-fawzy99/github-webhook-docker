const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');  
require('dotenv').config();

const app = express();
const PORT = process.env.GITHUB_WEBHOOK_PORT || 3000;

// Secret key (set this same key in GitHub Webhook settings)
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'mysecret';

// Middleware to parse JSON payloads
app.use(bodyParser.json());

// Helper to verify the signature from GitHub
function verifySignature(req, res, buf) {
  const signature = req.headers['x-hub-signature'];
  if (!signature) {
    return res.status(403).send('Signature required');
  }

  const hmac = crypto.createHmac('sha1', SECRET);
  const digest = `sha1=${hmac.update(buf).digest('hex')}`;

  if (signature !== digest) {
    return res.status(403).send('Invalid signature');
  }
}

// Apply signature verification middleware
app.use((req, res, next) => {
  bodyParser.json({ verify: verifySignature })(req, res, next);
});

// Handle webhook events
app.post('/', (req, res) => {
  const event = req.headers['x-github-event'];

  if (event === 'push') {
    const commits = req.body.commits;
    const repository = req.body.repository.name;

    // Execute shell script
    const { exec } = require('child_process');
    console.log('Executing webhook script');
    exec('sh ' + process.env.GITHUB_WEBHOOK_SCRIPT_PATH,
        (error, stdout, stderr) => {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
            console.log(`exec error: ${error}`);
          }
        });
  }

  res.status(200).send('Received webhook');
});

app.listen(PORT, () => {
  console.log(`Listening for webhooks on port ${PORT}`);
});
