const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Debes indicar una contraseña.');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then((hash) => {
    console.log(hash);
  })
  .catch((error) => {
    console.error('Error generando el hash:', error.message);
  });