# Cite YouTube
Cite Youtube is a tool that will spit out an MLA citation given a YouTube link.

# Usage
`node dist/citeYoutube.js <link>`

Example:  <br />
`node dist/citeYoutube.js https://www.youtube.com/watch?v=K-wTQtXOI9g` <br />
"Presage Exotic Mission Developer Deep Dive.", YouTube, uploaded by Bungie, 7 Apr. 2021, https://www.youtube.com/watch?v=K-wTQtXOI9g

# installation
```
git clone https://github.com/oribix/Cite-YouTube.git
npm i
tsc
```

You must provide a valid google API key in the `GoogleAPIKey` file.
https://developers.google.com/youtube/v3/getting-started
