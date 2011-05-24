AFrame.Class = ( function() {
    "use strict";

    /**
    * A shortcut to create a new class with a default constructor.  A default
    *   constructor does nothing unless it has a superclass, where it calls the
    *   superclasses constructor.  If the first parameter to Class is a function,
    *   the parameter is assumed to be the superclass.  All other parameters
    *   should be objects which are mixed in to the new classes prototype.
    *
    * If a new class needs a non-standard constructor, the class constructor should
    *   be created manually and then any mixins/superclasses set up using the
    *   [AFrame.extend](#method_extend) function.
    *
    *     // Create a class that is not subclassed off of anything
    *     var Class = AFrame.Class( {
    *        anOperation: function() {
    *           // do an operation here
    *        }
    *     } );
    *
    *     // Create a Subclass of AFrame.AObject
    *     var SubClass = AFrame.Class( AFrame.AObject, {
    *        anOperation: function() {
    *           // do an operation here
    *        }
    *     } );
    *
    * @method Class
    * @param {function} superclass (optional) - superclass to use.  If not given, class has
    *   no superclass.
    * @param {object}
    * @return {function} - the new class.
    */
    var Class = function() {
        var args = Array.prototype.slice.call( arguments, 0 ), F;

        if( AFrame.func( args[ 0 ] ) ) {
	        // we have a superclass, do everything related to a superclass
        	F = chooseConstructor( args[ 1 ], function() {
				F.sc.constructor.call( this );
			} );
			doExtension( F, args[ 0 ] );
            args.splice( 0, 1 );
        }
        else {
        	F = chooseConstructor( args[ 0 ], function() {} );
        }

        for( var mixin, index = 0; mixin = args[ index ]; ++index ) {
            AFrame.mixin( F.prototype, mixin );
        }

        // Always set the constructor last in case any mixins overwrote it.
        F.prototype.constructor = F;

		addCreate( F );

		F.extend = Class.bind( null, F );
        return F;
    };

    /**
    * Walk the class chain of an object.  The object must be an AFrame.Class/AFrame.extend based.
    *
    *    // Walk the object's class chain
    *    // SubClass is an AFrame.Class based class
    *    var obj = SubClass.create();
    *    AFrame.Class.walkChain( function( currClass ) {
    *        // do something.  Context of function is the obj
    *    }, obj );
    *
    * @method AFrame.Class.walkChain
    * @param {function} callback - callback to call.  Called with two parameters, currClass and
    *   obj.
    * @param {AFrame.Class} obj - object to walk.
    */
    Class.walkChain = function( callback, obj ) {
        var currClass = obj.constructor;
        do {
            callback.call( obj, currClass );
            currClass = currClass.superclass;
        } while( currClass );
    };

	function chooseConstructor( checkForConst, alternate ) {
		var F;
		if( checkForConst && checkForConst.hasOwnProperty( 'constructor' ) ) {
			F = checkForConst.constructor;
		}
		else {
			F = alternate;
		}
		return F;
	}

	function doExtension( subClass, superClass ) {
		var F = function() {};
		F.prototype = superClass.prototype;
		subClass.prototype = new F;
		subClass.superclass = superClass;        // superclass and sc are different.  sc points to the superclasses prototype, superclass points to the superclass itself.
		subClass.sc = superClass.prototype;

		var mixins = Array.prototype.slice.call( arguments, 2 );
		for( var mixin, index = 0; mixin = mixins[ index ]; ++index ) {
			AFrame.mixin( subClass.prototype, mixin );
		}
		subClass.prototype.constructor = subClass;

		addCreate( subClass );
	}

	/**
	* @private
	* Add a create function to a Class if the Class has an init function.
	*  The create function is an alias to call AFrame.create with this
	*  class.
	*
	* @method addCreate
	* @param {function} Class
	*/
	function addCreate( Class ) {
		if( Class.prototype && AFrame.func( Class.prototype.init ) && !Class.create ) {
			// Add a create function so that every class with init has one.
			Class.create = AFrame.create.bind( null, Class );
		}
	}


    return Class;
}() );
