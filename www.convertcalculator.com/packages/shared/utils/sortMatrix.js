import isNumberLike from './isNumberLike';
import parseNumber from './parseNumber';

const compareNumbers = ({
    sortIndex,
    sortOrder
}) => {
    return (a, b) => {
        return (
            (parseNumber(a[sortIndex]) - parseNumber(b[sortIndex])) / sortOrder / -1
        );
    };
};

const compareStrings = ({
    sortIndex,
    sortOrder
}) => {
    return (a, b) => {
        if (
            String(a[sortIndex]).toLowerCase() < String(b[sortIndex]).toLowerCase()
        ) {
            return sortOrder;
        }

        if (
            String(a[sortIndex]).toLowerCase() > String(b[sortIndex]).toLowerCase()
        ) {
            return sortOrder / -1;
        }

        return 0;
    };
};

const sortMatrix = ({
    matrix,
    sortIndex,
    sortOrder
}) => {
    const isMatrix = Array.isArray(matrix) && Array.isArray(matrix[0]);

    if (!isMatrix) return [];

    const isNumber = isNumberLike(matrix[0][sortIndex]);

    const compareFn = isNumber ?
        compareNumbers({
            sortIndex,
            sortOrder
        }) :
        compareStrings({
            sortIndex,
            sortOrder
        });

    return matrix.sort(compareFn);
};

export default sortMatrix;