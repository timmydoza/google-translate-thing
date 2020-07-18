const express = require('express');
const router = express.Router();
const path = require('path');
const { getVoice, translateText, getVoiceZip, init } = require('./functions');

router.use('/audio', express.static(path.join(__dirname, 'audio')));

router.use('/logs', express.static(path.join(__dirname, 'logfile.txt')));

router.post('/translate', express.json(), async (req, res) => {
  console.log(req.body);
  const text = await translateText(req.body.text, req.body.language);
  const filename = await getVoice(text, req.body.voice);
  const zip = await getVoiceZip(text, req.body.voice);
  res.json({ filename, text, zip });
});

router.get('/init', async (req, res) => {
  const initdata = await init();
  res.json(initdata);
});

router.use(express.static(path.join(__dirname, 'client')));

if (require.main === module) {
  const app = express();
  app.use(router);
  app.listen(3002);
  console.log('up on 3002');
} else {
  return router;
}
