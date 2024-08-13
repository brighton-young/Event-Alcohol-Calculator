/* eslint-disable no-restricted-globals */
const isNumberLike = (value) => {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
        if (!value) return false;
        if (value.indexOf(',') > -1) return false;

        return !isNaN(value) && !isNaN(parseFloat(value));
    }

    return false;
};

export default isNumberLike;