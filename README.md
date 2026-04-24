# bfhl-project

This was built for the BFHL SRM Full Stack Developer Challenge. The backend is a simple Express API and the frontend is plain HTML/JS — no frameworks, nothing fancy.

## Stack

Node.js + Express on the backend, vanilla HTML and JS on the frontend. Deployed the API on Render and the frontend on Netlify.

## Getting it running locally

Make sure you have Node installed, then:

```bash
git clone https://github.com/senviii/bfhl-project.git
cd bfhl-project
npm install
node index.js
```

Then just open `index.html` in your browser. The server runs on port 3000 by default.

## API

Single endpoint:

```
POST /bfhl
```

Takes a JSON body, processes it as per the challenge spec, and returns the response. Check `index.js` for the exact logic.

## Deploying

For the backend, I used Render — connect the repo, set build command as `npm install` and start command as `node index.js`, done. For the frontend, Netlify's manual deploy works fine, just drag and drop the folder.

Before deploying the frontend, update the API URL in `index.html` to point to your Render service URL.
