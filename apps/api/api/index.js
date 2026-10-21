// Vercel Function entry: delegates every request to the compiled Nest app.
module.exports = require('../dist/src/serverless').default;
