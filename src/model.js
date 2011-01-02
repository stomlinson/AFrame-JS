/**
* A Model is a DataContainer that is associated with a Schema.  If no initial data is given, 
*   default values will be retreived from the schema.  When doing a set, only data that validates
*   will be set.  If data to set is invalid, set will return a [FieldValidityState](AFrame.FieldValidityState.html).
* @class AFrame.Model
* @extends AFrame.DataContainer
* @constructor
*/
AFrame.Model = ( function() {
    
    function Model() {
        Model.superclass.constructor.call( this );
    }
    AFrame.extend( Model, AFrame.DataContainer, {
        init: function( config ) {
            this.schema = config.schema;
            config.data = getInitialData( this.schema, config.data );
            
            Model.superclass.init.call( this, config );
        },
        
	    /**
	    * Set an item of data.  Model will only be updated if data validates.  If data validates, the previous
	    * value will be returned.  If data does not validate, a [FieldValidityState](AFrame.FieldValidityState.html)
	    * will be returned.
        *
        *    var retval = model.set( 'name', 'Shane Tomlinson' );
        *    if( retval instanceof AFrame.FieldValidityState ) {
        *        // something went wrong
        *    }
        *
	    * @method set
	    * @param {string} fieldName name of field
	    * @param {variant} fieldValue value of field
	    * @return {variant} previous value of field if correctly set, a 
	    *   [FieldValidityState](AFrame.FieldValidityState.html) otherwise
	    */
        set: function( fieldName, fieldValue ) {
            var data = {};
            data[ fieldName ] = fieldValue;

            var fieldValidity = this.schema.validate( data, true );
            var retval;
            if( true === fieldValidity ) {
                retval = Model.superclass.set.call( this, fieldName, fieldValue );
            }
            else {
                retval = fieldValidity[ fieldName ];
            }
            
            return retval;
        }
    } );
    
    return Model;
    
    function getInitialData( schema, initialData ) {
        if( !initialData ) {
            initialData = schema.getDefaults();
        }
        return initialData;
    }

    
} )();
