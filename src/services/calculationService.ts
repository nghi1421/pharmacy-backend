
const calculateUnitPrice = (importPrice: number): number => {
    if (importPrice < 1000) {
        return importPrice * 1.15;
    }
    else if (importPrice < 5000) {
        return importPrice * 1.1;
    }
    else if (importPrice < 100000) {
        return importPrice * 1.07;
    }
    else if (importPrice < 1000000) {
        return importPrice * 1.05;
    }
    return importPrice * 1.02;
}

export {
    calculateUnitPrice,
}