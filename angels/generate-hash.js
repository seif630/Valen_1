const bcrypt = require('bcryptjs');

const password = 'Seif@1234'; // Change this to your desired password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Password:', password);
    console.log('Hash:', hash);
  }
});
