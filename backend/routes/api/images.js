const express = require("express");

const router = express.Router();

const { Image } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.delete("/:imageId", requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const { user } = req;

  const image = await Image.findByPk(imageId);

  if (!image) {
    res.status(404);
    return res.json({
      message: "Image couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === image.userId) {
    await image.destroy();

    return res.json({
      message: "Successfully deleted",
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

module.exports = router;
