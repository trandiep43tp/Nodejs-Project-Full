var express = require('express');
var router = express.Router();
const folderView   = __path_views_admin + 'pages/dashboard/';

/* GET dashboard page. */
router.get( '/', function(req, res, next) {
  res.render(folderView + 'index', { title: 'Dashboard page' });
});

module.exports = router;
