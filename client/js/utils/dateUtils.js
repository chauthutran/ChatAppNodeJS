
function DateUtils() {}

DateUtils.MONTH_SHORT_NAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Get Current UTC DateTime
DateUtils.getDbCurrentDateTime = function()
{
	return new Date().toISOString();
}

/**
 * 
 * @param dateStr  UTC DateTime, such as "2022-02-01T13:02:17.882"
 * @returns Local DateTime, such as "2022 Feb 01 00:00:00"
 */
DateUtils.convertUTCToDisplayLocalDateTime = ( dateStr ) => {
	var localDbDateStr = DateUtils.convertUTCToDbLocalDate( dateStr );
	return DateUtils.formatDisplayDateTime( localDbDateStr);
}

/**
 * 
 * @param dateStr  UTC DateTime, such as "2022-02-01T13:02:17.882"
 * @returns Local DateTime, such as "2022-02-01 00:00:00"
 */
DateUtils.convertUTCToDbLocalDate = function( dateStr ) 
{
	var date = new Date(dateStr + "Z");
	const offsetMs = date.getTimezoneOffset() * 60 * 1000;
	const msLocal =  date.getTime() - offsetMs;
	const dateLocal = new Date(msLocal);
	const iso = dateLocal.toISOString();
	const isoLocal = iso.slice(0, 19);
	return isoLocal;
}


// -----------------------------------------------------------------------------------------------
// Format Date / DateTime

DateUtils.formatDisplayDate = function( dateStr )
{
	var arrDate = dateStr.substring( 0, 10 ).split("-");
	const month = eval( arrDate[1] * 1 ) - 1;
	return DateUtils.MONTH_SHORT_NAME[month] + " " + arrDate[2] + ", " + arrDate[0];
}

DateUtils.formatDisplayDateTime = function( dateStr ) 
{
	var time = dateStr.substring( 11, 16 );
	return DateUtils.formatDisplayDate( dateStr ) + " " + time;
}


// // ---------------------------------------------------------------------------------------
// // Convert Date to String AND vice via

// /**
//  * 
//  * @param dateStr a DateTime ( can be local datetime or UTC data time ), such as "2022-02-01T13:02:17.882"
//  * @returns Date object
//  */
// DateUtils.convertDateString_ToObj = function ( dateStr ) {
// 	const arrDate = dateStr.substring(0,10).split("-");
// 	const month = eval( arrDate[1] * 1)- 1;
// 	const day = eval( arrDate[2] * 1);

// 	let arrTime = dateStr.substring(11,19);
// 	if( arrTime == "" ) // No time in dateStr
// 	{
// 		// Return date without time
// 		return new Date( arrDate[0], month, day, 0, 0, 0 );
// 	}
   
// 	// Return date object with time
// 	arrTime = arrTime.split(":");
// 	return new Date( arrDate[0], month, day, arrTime[0], arrTime[1], arrTime[2] );
// }