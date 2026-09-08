const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(404).json({
        message: 'Recurso no encontrado'
      });
    }

    next();
  };
};

module.exports = authorizeRoles;