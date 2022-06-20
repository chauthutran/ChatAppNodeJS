function NumberUtils() {}

NumberUtils.THOUNSAND_SEPARATOR_SIGN = " ";

NumberUtils.formatDisplayNumber = function( num ) {
    var partValues = (num + "").split(".");
    var part1 = partValues[0].replace(/\B(?=(\d{3})+(?!\d))/g, "" + NumberUtils.THOUNSAND_SEPARATOR_SIGN);
    var value = "";

    if( partValues.length == 2 )
    {
        value = part1 + "." + partValues[1];
    }
    else{
        value = part1;
    }

    return value;
}

