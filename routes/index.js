var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.usersCount);
  res.render('index', { usersCount: req.usersCount });
});

module.exports = router;
