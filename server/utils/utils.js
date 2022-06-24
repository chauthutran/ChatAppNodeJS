class Utils {
	findItemFromList(list, value, propertyName) {}
}
  
class ServerUtils extends Utils {

	constructor() {
		super();
	}

    findItemFromList = function( list, value, propertyName ) {
		let item;

		if( list )
		{
			// If propertyName being compare to has not been passed, set it as 'id'.
			if ( propertyName === undefined )
			{
				propertyName = "id";
			}

			for( let i = 0; i < list.length; i++ )
			{
				let listItem = list[i];

				if ( listItem[propertyName] == value )
				{
					item = listItem;
					break;
				}
			}
		}

		return item;
	}

}

module.exports = {
    ServerUtils
};
  