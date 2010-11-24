/**
* An object that keeps track of a field's validity, mirrors the HTML5 spec
* @class AFrame.FieldValidityState
* @constructor
*/
AFrame.FieldValidityState = function( config ) {
	if( config ) {
		AFrame.mixin( this, config );
	}
};
/**
* Get an instance of the FieldValidityState object
* @method AFrame.FieldValidityState.getInstance
* @param {object} config - object with a list of fields to set on the validity object
* @returns {AFrame.FieldValidityState}
*/
AFrame.FieldValidityState.getInstance = function( config ) {
	return new AFrame.FieldValidityState( config || {} );
};
AFrame.FieldValidityState.prototype = {
	valueMissing: false,
	typeMismatch: false,
	patternMismatch: false,
	tooLong: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	customError: false,
	valid: true,
	
	setError: function( errorType ) {
		this[ errorType ] = true;
		this.valid = false;
	},
	
	setCustomError: function( customError ) {
		if( customError ) {
			this.valid = false;
			this.customError = customError;
		}
	}
};