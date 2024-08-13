import isNumberLike from './isNumberLike';

const parseNumber = (text) => {
    return isNumberLike(text) ? parseFloat(text) : text;
};

export default parseNumber;