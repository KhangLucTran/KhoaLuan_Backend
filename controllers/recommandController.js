const recommendService = require("../services/recommendSystemService");

const getRecommendations = async (req, res) => {
  const userId = req.user._id;
  const recommendations = await recommendService.getRecommendations(userId);
  res.json(recommendations);
};

const getContentBase = async (req, res) => {
  const userId = req.user._id;
  const recommendations = await recommendService.getContentBaseRecommendations(
    userId
  );
  res.json(recommendations);
};

const getPersonalized = async (req, res) => {
  const recommendations =
    await recommendService.getPersonalizedRecommnedations();
  res.json(recommendations);
};

const getCollaborative = async (req, res) => {
  const userId = req.user._id;
  const recommendations =
    await recommendService.getCollaborativeRecommendations(userId);
  res.json(recommendations);
};

module.exports = {
  getRecommendations,
  getContentBase,
  getPersonalized,
  getCollaborative,
};
