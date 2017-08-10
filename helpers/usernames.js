const animals = require('./animals');
const adjectives = require('./adjectives');

const randomName = () => {
    randomAnimal = animals[Math.floor(animals.length*Math.random())];
    randomAdjective = adjectives[Math.floor(adjectives.length*Math.random())];
    var name = randomAdjective + '-' + randomAnimal;
    return name;
}

module.exports = randomName;