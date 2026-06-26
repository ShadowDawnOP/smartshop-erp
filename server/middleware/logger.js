const logger = (req, res, next) => {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}]  ${req.method}  ${req.url}`);
  next(); 
};

module.exports = logger;