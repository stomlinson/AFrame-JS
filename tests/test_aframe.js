function SuperClass() {
}
SuperClass.prototype = {
	hasFunc: function() {
		return true;
	},
	
	sharedFunc: function() {
	    this.sharedFuncCalled = true;
	    return true;
	}
};

function SubClass() {
}
AFrame.extend( SubClass, SuperClass, { 
    superExtendedFunc: function() {
	return true;
    },
    
    sharedFunc: function() {
	return SubClass.sc.sharedFunc.call( this );
    },
    
    init: function() {
      this.initCalled = true;
    },
    
    itemToRemove: true
}, {
	funcsFromSecondMixin: function() {
	}
}  );

var A = {
    SubClass: function() {
	this.init = function() {};
	return true;
    }
};

testsToRun.push( {
 
		name: "TestCase AFrame.extend",
	 
		setUp : function () {		
			this.subInstance = new SubClass();
		},
	 
		tearDown : function () {
			this.subInstance = null;
			delete this.subInstance;
		},
	 
		testExtendSuperclass: function () {
		    Assert.isFunction( this.subInstance.hasFunc, 'superExtendedFunc exists' );
		    Assert.isTrue( this.subInstance.hasFunc(), 'subclass function returns true' );
		    Assert.isObject( SubClass.sc, 'sc exists' );
		    Assert.areEqual( SubClass.sc.hasFunc, SuperClass.prototype.hasFunc, 'sc points to super\'s function' );
			
			Assert.isFunction( this.subInstance.funcsFromSecondMixin, 'extend works with more than one mixin' );
		},
		
		testExtendExtraFuncs: function () {
		    Assert.isFunction( this.subInstance.superExtendedFunc, 'superExtendedFunc exists' );
		    Assert.isTrue( this.subInstance.superExtendedFunc(), 'superExtendedFunc returns correctly' );
		},
		
		testExtendSuperclassInheritedFuncCall: function () {
 		    Assert.isTrue( this.subInstance.sharedFunc(), 'sharedFunc calls super class' );
 		    Assert.isTrue( this.subInstance.sharedFuncCalled, 'sharedFunc calls super class sets value' );
		}
} );

testsToRun.push( {
		name: "TestCase AFrame.mixin",
	 
		setUp : function () {		
			this.subInstance = new SubClass();
			AFrame.mixin( this.subInstance, {
			    mixedFunction: function() {
				return true;
			    }
			} );
		},
	 
		tearDown : function () {
			this.subInstance = null;
			delete this.subInstance;
		},
		
		testMixin: function() {
		    Assert.isFunction( this.subInstance.mixedFunction, 'mixedFunction added' );
		    Assert.isTrue( this.subInstance.mixedFunction(), 'mixedFunction can be called' );
		}
} );

testsToRun.push( {
		name: "TestCase AFrame.remove",
	 
		setUp : function () {		
		    this.subInstance = new SubClass();
		},
	 
		tearDown : function () {
		    this.subInstance = null;
		    delete this.subInstance;
		},
		
		testRemove: function() {
		    Assert.isTrue( this.subInstance.itemToRemove, 'itemToRemove exists' );
		    AFrame.remove( this.subInstance, 'itemToRemove' );
		    Assert.isFalse( this.subInstance.hasOwnProperty( 'itemToRemove' ), 'item is removed' );
		}
} );


testsToRun.push( {
		name: "TestCase AFrame.construct",
	 
		testConstructOneLevel: function() {
		    this.subInstance = AFrame.construct( {
				type: SubClass
		    } );
		    
		    Assert.isTrue( this.subInstance.initCalled, 'init called' );

		    this.subInstance = null;
		    delete this.subInstance;
		},
		
		testTypeWithDot: function() {
		    var instance = AFrame.construct( {
				type: A.SubClass
		    } );
		    
		    Assert.isObject( instance, 'object with dot created' );
		}

} );

testsToRun.push( {
		name: 'TestCase AFrame.getUniqueID',

		testGetUniqueID: function() {
			var id1 = AFrame.getUniqueID();
			var id2 = AFrame.getUniqueID();

			Assert.areNotEqual( id1, id2, 'ids are unique' );
		}
} );
	

