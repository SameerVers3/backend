const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        throw new Error('Error occurred while hashing the password');
    }
}

async function comparePassword(password, hashedPassword) {
    try {
        console.log(password, hashedPassword);
        console.log(await bcrypt.compare(password, hashedPassword));
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error('Error occurred while comparing passwords: ' + error.message);
    }
}



module.exports = {hashPassword, comparePassword}