/**
 * A basic form.  A Form is a Composite of form fields.  Each Field contains at least 
 * the following functions, clear, save, reset, validate.  A generic Form is not 
 * bound to any data, it is only a collection of form fields.  Note, by default,
 * the form creates an AFrame.Field for each field found.  If specialized field
 * creation is needed, fieldFactory can be overridden through either subclassing
 * or passing in a fieldFactory function to configuration.
 *
 *    <div id="nameForm">
 *       <input type="text" data-field="name" />
 *    </div>
 *   
 *    ---------
 *   
 *    // Set up the form to look under #nameForm for elements with the "data-field" 
 *    //   attribute.  This will find one field in the above HTML
 *    //
 *    var form = AFrame.construct( {
 *       type: AFrame.Form,
 *       config: {
 *           target: '#nameForm'
 *       }
 *    } );
 *   
 *    // do some stuff, user enters data.
 *
 *    // Check the validity of the form
 *    var isValid = form.checkValidity();
 *   
 *    // do some other stuff.
 *   
 *    form.clear();
 *
 *##Using a Specialized fieldFactory##
 *   
 *    // Sets up the field constructor, right now there is only one type of field
 *    var fieldFactory = function( element ) {
 *       return AFrame.construct( {
 *           type: AFrame.SpecializedField,
 *           config: {
 *               target: element
 *           }
 *       } );
 *    };
 *   
 *    // Set up the form to look under #nameForm for elements with the "data-field" 
 *    //   attribute.  This will find one field in the above HTML
 *    //
 *    var form = AFrame.construct( {
 *       type: AFrame.Form,
 *       config: {
 *           target: '#nameForm',
 *           formFieldFactory: fieldFactory
 *       }
 *    } );
 *    
 * @class AFrame.Form
 * @extends AFrame.Display
 * @uses AFrame.EnumerableMixin
 * @constructor
 */
/**
 * The factory to use to create form fields.
 *
 *     // example field factory in a Form's config.
 *     formFieldFactory: function( element ) {
 *       return AFrame.construct( {
 *           type: AFrame.SpecializedField,
 *           config: {
 *               target: element
 *           }
 *       } );
 *     };
 *
 * @config formFieldFactory
 * @type {function}
 * @default this.formFieldFactory;
 */
AFrame.Form = ( function() {
    "use strict";
    
    var Form = function() {
        Form.sc.constructor.apply( this, arguments );
    };
    AFrame.extend( Form, AFrame.Display, AFrame.EnumerableMixin, {
        init: function( config ) {
            this.formFieldFactory = config.formFieldFactory || this.formFieldFactory;
            this.formElements = [];
            this.formFields = [];
            
            Form.sc.init.apply( this, arguments );

            this.bindFormElements();
        },

        /**
        * The factory used to create fields.
        *
        *     // example of overloaded formFieldFactory
        *     formFieldFactory: function( element ) {
        *       return AFrame.construct( {
        *           type: AFrame.SpecializedField,
        *           config: {
        *               target: element
        *           }
        *       } );
        *     };
        *
        * @method formFieldFactory
        * @param {Element} element - element where to create field
        * @return {AFrame.Field} field for element.
        */
        formFieldFactory: function( element ) {
           return AFrame.construct( {
                type: AFrame.Field,
                config: {
                    target: element
                }
            } );
        },

        bindFormElements: function() {
            var formElements = AFrame.DOM.getDescendentElements( '[data-field]', this.getTarget() );
            
            formElements.each( function( index, formElement ) {
                this.bindFormElement( formElement );
            }.bind( this ) );
        },

        teardown: function() {
            this.forEach( function( formField, index ) {
                formField.teardown();
                this.formFields[ index ] = null;
            }, this );
            this.formFields = null;
            this.formElements = null;
            Form.sc.teardown.apply( this, arguments );
        },
        
        /**
         * bind a form element to the form
         *
         *    // Bind a field in the given element.
         *    var field = form.bindFormElement( '#button' );
         *
         * @method bindFormElement
         * @param {selector || element} formElement the form element to bind to.
         * @returns {AFrame.Field}
         */
        bindFormElement: function( formElement ) {
            var target = AFrame.DOM.getElements( formElement );
            this.formElements.push( target );

            var formField = this.formFieldFactory( target );
            this.formFields.push( formField );
            
            return formField;
        },
        
        /**
         * Get the form field elements
         *
         *    // Get the form field elements
         *    var fields = form.getFormElements();
         *
         * @method getFormElements
         * @return {array} the form elements
         */
        getFormElements: function() {
            return this.formElements;
        },

        /**
         * Get the form fields
         *
         *    // Get the form fields
         *    var fields = form.getFormFields();
         *
         * @method getFormFields
         * @return {array} the form fields
         */
        getFormFields: function() {
            return this.formFields;
        },

        /**
         * Validate the form.
         *
         *    // Check the validity of the form
         *    var isValid = form.checkValidity();
         *
         * @method checkValidity
         * @return {boolean} true if form is valid, false otw.
         */
        checkValidity: function() {
            var valid = true;

            for( var index = 0, formField; ( formField = this.formFields[ index ] ) && valid; ++index ) {
                valid = formField.checkValidity();
            }
            
            return valid;
        },

        /**
         * Clear the form, does not affect data
         *
         *    // Clear the form, does not affect data.
         *    form.clear();
         *
         * @method clear
         */
        clear: function() {
            this.fieldAction( 'clear' );
        },

        /**
         * Reset the form to its original state
         *
         *    // Resets the form to its original state.
         *    form.reset();
         *
         * @method reset
         */
        reset: function() {
            this.fieldAction( 'reset' );
        },

        /**
         * Have all fields save their data if the form is valid
         *
         *    // Have all fields save their data if the form is valid
         *    var saved = form.save();
         *
         * @method save
         * @return {boolean} true if the form was valid and saved, false otw.
         */
        save: function() {
            var valid = this.checkValidity();
            if( valid ) {
                this.fieldAction( 'save' );
            }
            
            return valid;
        },

        fieldAction: function( action ) {
            this.forEach( function( formField, index ) {
                formField[ action ]();
            } );
        },
        
        forEach: function( callback, context ) {
            this.formFields && this.formFields.forEach( callback, context );
        }
    } );
    
    return Form;
}() );
