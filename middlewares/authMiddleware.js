function isLoggedIn(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session.adminId) return next();
  res.redirect('/admin/login');
}

module.exports = { isLoggedIn, isAdmin };
