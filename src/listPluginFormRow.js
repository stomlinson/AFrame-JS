/**
 * Create a form for each item in the list.  Adds the functions validate, save, clear,
 * and reset to the plugged object.
 * @class AFrame.ListPluginFormRow
 * @extends AFrame.ListPluginBindToCollection
 * @constructor 
 */
AFrame.ListPluginFormRow = function() {
	AFrame.ListPluginFormRow.superclass.constructor.apply( this, arguments );
};
AFrame.extend( AFrame.ListPluginFormRow, AFrame.ListPluginBindToCollection, {
	init: function( config ) {
		/**
		 * The factory to use to create form fields.  For each form element in each form,
		 * the factory function will be called with two parameters, the first is the element,
		 * the second is the meta data.
		 * @config formFieldFactory
		 * @type {function}
		 */
		this.formFieldFactory = config.formFieldFactory;
		
		this.forms = [];
		
		AFrame.ListPluginFormRow.superclass.init.apply( this, arguments );
	},
	
	setPlugged: function( plugged ) {
		plugged.bindEvent( 'onInsert', this.onInsertRow, this );
		plugged.bindEvent( 'onRemove', this.onRemoveRow, this );
		
		plugged.validate = this.validate.bind( this );
		plugged.save = this.save.bind( this );
		plugged.reset = this.reset.bind( this );
		plugged.clear = this.clear.bind( this );
		
		AFrame.ListPluginFormRow.superclass.setPlugged.apply( this, arguments );		
	},
	
	onInsertRow: function( data ) {
		var form = this.createForm( data.rowElement, data.meta );
		this.forms.splice( data.meta.index, 0, form );
	},
	
	onRemoveRow: function( data ) {
		this.forms.splice( data.meta.index, 1 );
	},
	
	createForm: function( rowElement, meta ) {
		var form = AFrame.construct( {
			type: 'AFrame.Form',
			config: {
				target: rowElement,
				formFieldFactory: function( element ) {
					return this.formFieldFactory( element, meta );
				}.bind( this )
			}
		} );
		
		return form;
	},
	
	/**
	 * Validate a form
	 * @method validate
	 * @param {index || cid} indexCID (optional) index or cid of row.  If not given,
	 * validate all rows.
	 * @return {boolean} true if form is valid, false otw.
	 */
	validate: function( indexCID ) {
		var valid = true;
		var index, form;
		
		if( AFrame.defined( indexCID ) ) {
			index = this.getIndex( indexCID );
			form = this.forms[ index ];
			if( form ) {
				valid = form.validate();				
			}
		}
		else {
			for( index = 0; valid && ( form = this.forms[ index ] ); ++index ) {
				valid = form.validate();
			}
		}
		
		return valid;
	},
	
	/**
	 * Save a form's data to its DataContainer
	 * @method save
	 * @param {index || cid} indexCID (optional) index or cid of row.  If not given,
	 * save all rows.
	 */
	save: function( indexCID ) {
		this.formFunc( indexCID, 'save' );
	},
	
	/**
	 * Reset a form
	 * @method reset
	 * @param {index || cid} indexCID (optional) index or cid of row.  If not given,
	 * reset all rows.
	 */
	reset: function( indexCID ) {
		this.formFunc( indexCID, 'reset' );
	},
	
	/**
	 * Clear a form
	 * @method clear
	 * @param {index || cid} indexCID (optional) index or cid of row.  If not given,
	 * clear all rows.
	 */
	clear: function( indexCID ) {
		this.formFunc( indexCID, 'clear' );
	},
	
	formFunc: function( indexCID, funcName ) {
		if( AFrame.defined( indexCID ) ) {
			var index = this.getIndex( indexCID );
			var form = this.forms[ index ];
			if( form ) {
				form[ funcName ]();				
			}
		}
		else {
			this.forms.forEach( function( form, index ) {
				form[ funcName ]();
			} );
		}
	}
} );