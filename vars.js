const checkApiKey = (req, res, next) => {
  if (req.headers.authorization === process.env.API_KEY) {
    return next();
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
};

const serverErrorMessage = "Server Error, We're trying to solve the Problem";
const invalidApiKeyMessage = "Invalid API Key";

module.exports = { checkApiKey, serverErrorMessage, invalidApiKeyMessage };
