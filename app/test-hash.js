const bcrypt = require('bcryptjs');

const password = 'x0420EZS2025*';
const hash = '$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO';

console.log('Testing password:', password);
console.log('Against hash:', hash);
console.log('Hash prefix:', hash.substring(0, 7));

bcrypt.compare(password, hash).then(result => {
  console.log('Result:', result);
  if (result) {
    console.log('✅ Password matches hash!');
  } else {
    console.log('❌ Password does NOT match hash');
  }
  
  // Generate new hash for comparison
  bcrypt.hash(password, 10).then(newHash => {
    console.log('\nNew hash generated:', newHash);
    bcrypt.compare(password, newHash).then(newResult => {
      console.log('New hash verification:', newResult);
    });
  });
}).catch(err => {
  console.error('Error:', err);
});
