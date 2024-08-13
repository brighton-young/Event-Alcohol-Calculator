import parseNumber from './parseNumber';

const evalByQuery = ({
    leftHandValue,
    query
}) => {
    if (typeof query === 'undefined') return false;

    const lhvMaybeNumber = parseNumber(leftHandValue);

    const [queryValue, ...rest] = String(query)
        .split(/(=|>|<)/g)
        .reverse();
    const queryValueMaybeNumber = parseNumber(queryValue);

    const operator = [...rest].reverse().join('');

    if (operator === '=' || operator === 'eq') {
        return lhvMaybeNumber === queryValueMaybeNumber;
    }

    if (operator === '<>' || operator === 'ne') {
        return lhvMaybeNumber !== queryValueMaybeNumber;
    }

    if (operator === '>' || operator === 'gt') {
        return lhvMaybeNumber > queryValueMaybeNumber;
    }

    if (operator === '>=' || operator === 'gte') {
        return lhvMaybeNumber >= queryValueMaybeNumber;
    }

    if (operator === '<' || operator === 'lt') {
        return lhvMaybeNumber < queryValueMaybeNumber;
    }

    if (operator === '<=' || operator === 'lte') {
        return lhvMaybeNumber <= queryValueMaybeNumber;
    }

    return lhvMaybeNumber === queryValueMaybeNumber;
};

export default evalByQuery;