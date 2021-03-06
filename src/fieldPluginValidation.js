
/**
* Takes care of validation for a [Field](AFrame.Field.html), using an HTML5 based
* [FieldValidityState](AFrame.FieldValidityState.html).
* By default, a FieldPluginValidation is created for each Field.  This class
* can be subclassed and added as a plugin to a [Field](AFrame.Field.html) when
* specialized field validation is needed.  The following functions are added to
* the field:
*
* -   [getValidityState](#method_getValidityState)
* -   [validate](#method_validate)
* -   [setError](#method_setError)
* -   [setCustomValidity](#method_setCustomValidity)
* -   [checkValidity](#method_checkValidity)
*
* Unlike the HTML5 spec, Field validation does not occur in real time,
* for validation to occur, the checkValidity function must be called.
*
*    <input type="number" id="numberInput" />
*
*    ---------
*
*    var field = AFrame.Field.create( {
*        target: '#numberInput'
*    } );
*
*    // Set the value of the field, it is now displaying 3.1415
*    field.set(3.1415);
*
*    // Check the validity of the field
*    var isValid = field.checkValidity();
*
*    // The field is cleared, displays nothing
*    field.clear();
*
*    field.set('invalid set');
*
*    // This will return false
*    isValid = field.checkValidity();
*
*    // Get the validity state, as per the HTML5 spec
*    var validityState = field.getValidityState();
*
*
*##Example of using a custom validator##
*
*    var ValidatorPlugin = AFrame.FieldPluginValidation.extend( {
*        validate: function() {
*            var valid = ValidatorPlugin.sc.validate.call( this );
*            if( valid ) {
*                 // do custom validation setting valid variable
*            }
*            return valid;
*        }
*    } );
*
*    var field = AFrame.Field.create( {
*        target: '#numberInput',
*        plugins: [ ValidatorPlugin ]
*    } );
*
*    field.validate();
*
*
* @class AFrame.FieldPluginValidation
* @extends AFrame.Plugin
* @constructor
*/
AFrame.FieldPluginValidation = (function() {
    "use strict";

    var FieldPluginValidation = AFrame.Plugin.extend( {
        events: {
            'onChange plugged': onChange
        },

        init: function( config ) {
            this.calculateValidity = true;

            FieldPluginValidation.sc.init.call( this, config );

            var plugged = this.getPlugged();
            plugged.getValidityState = this.getValidityState.bind( this );
            plugged.validate = this.validate.bind( this );
            plugged.setError = this.setError.bind( this );
            plugged.setCustomValidity = this.setCustomValidity.bind( this );
            plugged.checkValidity = this.checkValidity.bind( this );
        },

        /**
        * Get the current validity state for a field.
        *
        *     var validityState = field.getValidityState( field );
        *
        * @method getValidityState
        * @return {AFrame.FieldValidityState} - the current validity state of the field.
        */
        getValidityState: function() {
            this.updateValidityState( true );
            return this.validityState;
        },

	    /**
	     * Validate the field.  A field will validate if 1) Its form element does not have the required
         * attribute, or 2) the field has a length.  Sub classes can override this to perform more
         * specific validation schemes.  The HTML5 spec specifies checkValidity as the method to use
         * to check the validity of a form field.  Calling this will reset any validation errors
         * previously set and start with a new state.
         *
         *    var isValid = field.checkValidity();
         *
	     * @method checkValidity
	     * @return {boolean} true if field is valid, false otw.
	     */
        checkValidity: function() {
            return this.validate();
        },

	    /**
	    * This should not be called directly, instead [checkValidity](#method_checkValidity) should be.
        * Do the actual validation on the field.  Should be overridden to do validations.
        *
        *    var isValid = field.validate();
        *
	    * @method validate
	    * @return {boolean} true if field is valid, false otw.
	    */
        validate: function() {
            this.updateValidityState();

            var field = this.getPlugged();
            var valid = true;
            var target = field.getTarget();

		    if( target[ 0 ].checkValidity ) {
			    // browser supports native validation
			    valid = target[ 0 ].checkValidity();
		    } else {
                var criteria = this.getCriteria();
                var val = field.get();

                AFrame.DataValidation.validate( {
                    data: val,
                    criteria: criteria,
                    fieldValidityState: this.validityState
                } );
                valid = this.validityState.valid;
		    }

            return valid;
        },

        /**
        * Update the field's validity state.
        * @private
        * @method updateValidityState
        * @param {boolean} validate - whether to perform actual validation or not
        */
        updateValidityState: function( validate ) {
            if( this.calculateValidity ) {
                this.validityState = AFrame.FieldValidityState.create( this.getPlugged().getTarget()[ 0 ].validity );

                if( validate ) {
                    this.validate();
                }

                this.calculateValidity = false;
            }
        },

	    /**
	    * Set an error.  See [AFrame.FieldValidityState](AFrame.FieldValidityState.html)
        *
        *    field.setError( 'valueMissing' );
        *
	    * @method setError
	    * @param {string} errorType
	    */
        setError: function( error ) {
            this.updateValidityState( true );
            AFrame.DOM.fireEvent( this.getPlugged().getTarget(), 'invalid' );

            return this.validityState.setError( error );
        },

	    /**
	    * Set a custom error.  In the AFrame.FieldValidityState object returned
	    *	by getValidityState, a custom error will have the customError field set to this
	    *	message
        *
        *    field.setCustomValidity( 'Names must start with a letter' );
        *
	    * @method setCustomValidity
	    * @param {string} customError - the error message to display
	    */
        setCustomValidity: function( customValidity ) {
            this.updateValidityState( true );
            AFrame.DOM.fireEvent( this.getPlugged().getTarget(), 'invalid' );

            return this.validityState.setCustomValidity( customValidity );
        },

        /**
        * Get the field's validation criteria
        * @method getCriteria
        * @return {object} criteria for the field
        * @private
        */
        getCriteria: function() {
            var target = this.getPlugged().getTarget();
            var hasAttr = AFrame.DOM.hasAttr;
            var getAttr = AFrame.DOM.getAttr;

            var type = getAttr( target, 'type' );
            if( !type || type == 'textarea' ) {
                type = 'text';
            }

            var criteria = {
                type: type
            };

            if( hasAttr( target, 'required' ) ) {
                criteria.required = true;
            }

            if( hasAttr( target, 'min' ) ) {
                criteria.min = parseFloat( getAttr( target, 'min' ) );
            }

            if( hasAttr( target, 'max' ) ) {
                criteria.max = parseFloat( getAttr( target, 'max' ) );
            }

            if( hasAttr( target, 'step' ) ) {
                criteria.step = parseFloat( getAttr( target, 'step' ) );
            }

            if( hasAttr( target, 'maxlength' ) ) {
                criteria.maxlength = parseInt( getAttr( target, 'maxlength' ), 10 );
            }

            if( hasAttr( target, 'pattern' ) ) {
                criteria.pattern = getAttr( target, 'pattern' );
            }

            return criteria;
        }
    } );

    function onChange() {
        this.calculateValidity = true;
    }


    return FieldPluginValidation;
} )();

