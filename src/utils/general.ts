export const getAverage = (array: string[]):number => {
    if (array.length === 0) {
        return 0;
    }
    var soma = 0;
    for (var i = 0; i < array.length; i++) {
        soma += parseFloat(array[i]);
    }
    var media = soma / array.length;
    return media;
}