
const calculateUnitPrice = (importUnitPrice: number, quantityConversion: number): number => {
    const unitPrice = importUnitPrice / quantityConversion
    if (unitPrice < 1000) {
        return unitPrice * 1.15;
    }
    else if (unitPrice < 5000) {
        return unitPrice * 1.1;
    }
    else if (unitPrice < 100000) {
        return unitPrice * 1.07;
    }
    else if (unitPrice < 1000000) {
        return unitPrice * 1.05;
    }
    return unitPrice * 1.02;
}

export {
    calculateUnitPrice,
}