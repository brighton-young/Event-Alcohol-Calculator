const getRandomCharacter = (arrayOrString) => {
    const index = Math.floor(Math.random() * arrayOrString.length);

    if (typeof arrayOrString === 'string') {
        return arrayOrString.substr(index, 1);
    }

    return arrayOrString[index];
};

export default getRandomCharacter;