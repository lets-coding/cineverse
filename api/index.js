// Vercel Serverless Function entry point for CineVerse Express API
const { createApp } = require('../server/dist/app.js');

const app = createApp();

module.exports = app;
