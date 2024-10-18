const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.GITHUB_WEBHOOK_PORT || 3000;

// Secret key (set this same key in GitHub Webhook settings)
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'mysecret';

// Middleware to parse JSON payloads and verify GitHub signature
app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    const signature = req.headers['x-hub-signature'];

    if (!signature) {
      throw new Error('No signature provided');
    }

    const hmac = crypto.createHmac('sha1', SECRET);
    const digest = `sha1=${hmac.update(buf).digest('hex')}`;

    if (signature !== digest) {
      throw new Error('Invalid signature');
    }
  }
}));

// Handle webhook events
app.post('/', (req, res) => {
  const event = req.headers['x-github-event'];

  if (event === 'push') {

    const { exec } = require('child_process');
    console.log('Executing webhook script');
    exec('sh ' + process.env.GITHUB_WEBHOOK_SCRIPT_PATH,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing script: ${error}`);
            return res.status(500).send('Error executing script');
          }
          console.log(stdout);
          console.log(stderr);
          res.status(200).send('Webhook handled successfully');
        });
  } else {
    res.status(200).send(`Event ${event} received but not handled`);
  }
});

// Error handling middleware for signature validation
app.use((err, req, res, next) => {
  if (err.message === 'Invalid signature' || err.message === 'No signature provided') {
    return res.status(403).send(err.message);
  }
  next(err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Listening for webhooks on port ${PORT}`);
});
