/**
* DataContainers are the basic atom of data within the AFrameJS ecosystem.
* Used like a hash. They provide functionality allowing concerned parties
* to be notified when the data mutates. They are the "Model" in 
* Model-View-Controller.  DataContainer's make it possible to have multiple
* Views bound to a particular field update automatically when the underlying
* data is modified.
*
* Example:
*
*    var dataObject = {
*        firstName: 'Shane',
*        lastName: 'Tomlinson'
*    };
*
*    var dataContainer = AFrame.DataContainer.create( { data: dataObject } );
*    dataContainer.bindField( 'firstName', function( notification ) {
*        alert( 'new name: ' + notification.value );
*    } );
*
*    dataContainer.set( 'firstName', 'Charlotte' );
*
* @class AFrame.DataContainer
* @extends AFrame.AObject
* @uses AFrame.EnumerableMixin
*/

/**
 * Create a DataContainer.
 *
 *     var dataContainer = AFrame.DataContainer.create( { data: dataObject } );
 *
 * @method AFrame.DataContainer.create
 * @param {object || AFrame.DataContainer} data (optional) If given, creates a 
 * new AFrame.DataContainer for the data. If already an AFrame.DataContainer, 
 * returns self, if the data already has an AFrame.DataContainer associated with
 * it, then the original AFrame.DataContainer is used.
*/
AFrame.DataContainer = ( function() {
    "use strict";

    var DataContainer = AFrame.AObject.extend( {
        /**
        * Initialize the data container.
        * @method init
        */
        init: function( config ) {
            /**
            * Initial data
            * @config data
            * @type {object}
            * @default {}
            */
            var me=this,
                data = me.data = config.data || {};

            if( data.__dataContainer ) {
                throw Error( 'Cannot create a second DataContainer for an object' );
            }
            data.__dataContainer = me;

            me.fieldBindings = {};

            DataContainer.sc.init.call( me, config );
        },

        /**
        * Update a field.
        *
        *    // If passing two arguments, the first argument is
        *	 // the name of the field, the second is the value
        *    var prevVal = dataContainer.set( 'name', 'Shane Tomlinson' );
        *
        *    // If passing a single argument, it must be an
        *	 // object with key/value pairs.  prevVals will
        *    // be an object with the previous value of each
        *    // field that is updated.
        *    var prevVals = dataContainer.set( {
        *        name: 'Shane Tomlinson',
        *        employer: 'AFrame Foundary'
        *    } );
        *
        * @method set
        * @param {string} fieldName name of field
        * @param {variant} fieldValue value of field
        * @return {variant} previous value of field
        */
        set: function( fieldName, fieldValue ) {
        	if( 'object' === typeof( fieldName ) ) {
				var prevVals = {};
        		for( var key in fieldName ) {
					prevVals[ key ] = this.set( key, fieldName[ key ] );
        		}
        		return prevVals;
        	}

            var oldValue = this.data[ fieldName ];
            this.data[ fieldName ] = fieldValue;

            /**
            * Triggered whenever any item on the object is set.
            * @event onSet
            * @param {AFrame.Event} event - an event object. @see 
            *   [Event](AFrame.Event.html)
            * @param {string} event.fieldName - name of field affected.
            * @param {variant} event.value - the current value of the field.
            * @param {variant} event.oldValue - the previous value of the field
            *   (only applicable if data has changed).
            */
            this.triggerEvent( {
                fieldName: fieldName,
                oldValue: oldValue,
                value: fieldValue,
                type: 'onSet'
            } );
            /**
            * Triggered whenever an item on the object is set.  This is useful 
            * to bind to whenever a particular field is being changed.
            * @event onSet-fieldName
            * @param {AFrame.Event} event - an event object.  @see 
            *   [Event](AFrame.Event.html)
            * @param {string} event.fieldName - name of field affected.
            * @param {variant} event.value - the current value of the field.
            * @param {variant} event.oldValue - the previous value of the field
            *   (only applicable if data has changed).
            */
            this.triggerEvent( {
                fieldName: fieldName,
                oldValue: oldValue,
                value: fieldValue,
                type: 'onSet-' + fieldName
            } );

            return oldValue;
        },

        /**
        * Get the value of a field
        *
        *    var value = dataContainer.get( 'name' );
        *
        * @method get
        * @param {string} fieldName - name of the field to get
        * @return {variant} value of field
        */
        get: function( fieldName ) {
            return this.data[ fieldName ];
        },

        /**
        * Get an object with all fields contained in the DataContainer.
        *
        *    // Get an object with all fields contained in the DataContainer.
        *    var dataObject = dataContainer.toJSON();
        *
        * @method toJSON
        * @return {object}
        */
        toJSON: function() {
            var data = this.data,
                retval = {},
                key;
            for( key in data ) {
               if( key !== '__dataContainer' ) {
                   retval[ key ] = data[ key ];
               }
            }
            return retval;
        },

        /**
        * Bind a callback to a field.  Function is called once on initialization
        * as well as any time the field changes. When function is called, it is 
        * called with an event.
        *
        *    var onChange = function( event ) {
        *        console.log( 'Name: "' + event.fieldName + '" + value: "' 
        *           + event.value + '" oldValue: "' + event.oldValue + '"' );
        *    };
        *    var id = dataContainer.bindField( 'name', onChange );
        *    // use id to unbind callback manually, otherwise callback will 
        *    / /be unbound automatically.
        *
        * @method bindField
        * @param {string} fieldName name of field
        * @param {function} callback callback to call
        * @param {object} context context to call callback in
        * @return {id} id that can be used to unbind the field
        */
        bindField: function( fieldName, callback, context ) {
            this.setEventData( {
                container: this,
                fieldName: fieldName,
                oldValue: undefined,
                value: this.get( fieldName ),
                type: 'onSet:' + fieldName
            } );
            var event = this.getEventObject();
            callback.call( context, event );

            return this.bindEvent( 'onSet-' + fieldName, callback, context );
        },

        /**
        * Unbind a field.
        *
        *    var id = dataContainer.bindField(...
        *    dataContainer.unbindField( id );
        *
        * @method unbindField
        * @param {id} id given by bindField
        */
        unbindField: function( id ) {
            return this.unbindEvent( id );
        },

        /**
        * Iterate over each item in the dataContainer.  Callback will be called
        * with two parameters, the first the value, the second the key
        *
        *    dataCollection.forEach( function( item, index ) {
        *       // process item here
        *    } );
        *
        * @method forEach
        * @param {function} function to call
        * @param {object} context (optional) optional context
        */
        forEach: function( callback, context ) {
            for( var key in this.data ) {
                if( key !== '__dataContainer' ) {
                    callback.call( context, this.data[ key ], key );
                }
            }
        }
    },
 	AFrame.EnumerableMixin );
    DataContainer.create = function( config ) {
        config = config || {};
        var data = config.data = config.data || {};

        if( data instanceof DataContainer ) {
            return data;
        }
        else if( data.__dataContainer ) {
            return data.__dataContainer;
        }

        var dataContainer = AFrame.Class.create( DataContainer, config );

        return dataContainer;
    };

    return DataContainer;
}() );
