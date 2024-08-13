const isNil = (value) => {
    if (typeof value === 'string' && !value) return true;

    return value == null;
};

export default isNil;