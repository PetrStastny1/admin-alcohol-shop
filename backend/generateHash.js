const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'password123'; // Zadej jakékoli heslo
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Generated Hash:', hash);
  } catch (err) {
    console.error('Error during hashing:', err);
  }
}

generateHash();