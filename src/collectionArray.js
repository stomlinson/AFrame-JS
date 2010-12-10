/**
* an array to be used MVC style.  The item's index will be added to all meta information in all events.  Items
* are inserted by index, but can be retreived either by index or by id.
* @class AFrame.CollectionArray
* @extends AFrame.CollectionHash
* @uses AFrame.ArrayCommonFuncsMixin
* @constructor
*/
AFrame.CollectionArray = function() {
	AFrame.CollectionArray.superclass.constructor.apply( this, arguments );
};
AFrame.extend( AFrame.CollectionArray, AFrame.AObject, AFrame.ArrayCommonFuncsMixin, {
	init: function() {
		this.itemCIDs = [];
		this.hash = AFrame.construct( {
			type: AFrame.CollectionHash
		} );
		this.proxyEvents( this.hash, [ 'onBeforeInsert', 'onInsert', 'onBeforeRemove', 'onRemove', 'onBeforeSet', 'onSet' ] );
		
		AFrame.CollectionArray.superclass.init.apply( this, arguments );
	},
	
	teardown: function() {
		this.itemCIDs.forEach( function( id, index ) {
			this.itemCIDs[ index ] = null;
		}, this );
		AFrame.remove( this, 'itemCIDs' );
		
		this.hash.teardown();
		
		AFrame.CollectionArray.superclass.teardown.apply( this, arguments );
	},
	
	/**
	* Insert an item into the array.  ID is assigned by hash unless specified
	* 	in the meta parameter's id field.  Index is retrieved from meta.index, if exists.  If
	* 	not defined, insert at the end of the list.
	* @method insert
	* @param {variant} item to insert
	* @param {object} meta information
	* @return {id} cid of the item
	*/
	insert: function( item, meta ) {
		var index = meta && 'number' == typeof( meta.index ) ? meta.index : -1;
		var realInsertIndex = this.getActualInsertIndex( index );
		var cid = this.hash.insert( item, this.getArrayMeta( realInsertIndex, meta ) );
		
		this.itemCIDs.splice( realInsertIndex, 0, cid );
		
		return cid;
	},
	
	/**
	* Get an item from the array.
	* @method get
	* @param {number || id} index - index or cid of item to get
	* @return {variant} item if it exists, undefined otw.
	*/
	get: function( index ) {
		var cid = this.getCID( index );
		var retval;
		if( cid ) {
			retval = this.hash.get( cid );
		}
		return retval;
	},
	
	/** 
	* Remove an item from the array
	* @method remove
	* @param {number || id} index of item to remove.
	* @param {object} meta information
	*/
	remove: function( index, meta ) {
		var cid;
		if( 'string' == typeof( index ) ) {
			cid = index;
			index = this.getIndex( index );
		}
		else {
			index = this.getActualRemoveIndex( index );
			cid = this.getCID( index );
		}

		
		var retval;
		if( index > -1 ) {
			this.itemCIDs.splice( index, 1 );
			retval = this.hash.remove( cid, this.getArrayMeta( index, meta ) );
		}
		
		return retval;
	},
	
	/**
	* Clear the array
	* @method clear
	*/
	clear: function() {
		this.itemCIDs.forEach( function( cid, index ) {
			this.hash.remove( cid, this.getArrayMeta( index ) );
			this.itemCIDs[ index ] = null;
		}, this );
		
		this.itemCIDs = [];
	},
	
	/**
	* Get the current count of items
	* @method getCount
	* @return {number} current count
	*/
	getCount: function() {
		return this.itemCIDs.length;
	},
	
	/**
	* Get an array representation of the CollectionArray
	* @method getArray
	* @return {array} array representation of CollectionArray
	*/
	getArray: function() {
		var array = [];
		this.itemCIDs.forEach( function( cid, index ) {
			array[ index ] = this.hash.get( cid );
		} );
		
		return array;
	},

	/**
	 * @private
	 */
	getArrayMeta: function( index, meta ) {
		meta = meta || {};
		meta.index = index;
		meta.collection = this;
		return meta;
	},
	
	/**
	 * Given an index or cid, get the cid.
	 * @method getCID
	 * @param {id || number} index
	 * @private
	 */
	getCID: function( index ) {
		var cid = index;
		
		if( 'number' == typeof( index ) ) {
			cid = this.itemCIDs[ index ];
		}
		
		return cid;
	},

	/**
	 * Given an index or cid, get the index.
	 * @method getIndex
	 * @param {id || number} index
	 * @private
	 */
	getIndex: function( index ) {
		if( 'string' == typeof( index ) ) {
			index = this.itemCIDs.indexOf( index );
		}
		
		return index;
	}
} );