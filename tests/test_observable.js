testsToRun.push( {

		name: "TestCase AFrame.Observable",

		setUp : function () {
			this.observable = AFrame.Observable.create();
			this.boundCalled = false;
			this.args;
			var me=this;
			this.bindFunc = function() {
			    me.boundCalled = true;
			    me.args = Array.prototype.slice.call( arguments, 0 );
			    this.thisBound = true;
			};
		},

		tearDown : function () {
			this.observable.unbindAll();
			this.observable = null;
			delete this.observable;
		},

		testBindTrigger: function() {
		    this.observable.bind( this.bindFunc );
		    this.observable.trigger();

		    Assert.isTrue( this.boundCalled, 'bindFunc function called' );
		    Assert.areEqual( 0, this.args.length, 'arguments length is 0' );

		    this.observable.trigger( 1, 2 );
		    Assert.areEqual( 2, this.args.length, 'arguments length correctly passed' );
		},

		testUnbind: function() {
		    var bindID = this.observable.bind( this.bindFunc );
		    this.observable.unbind( bindID );
		    this.observable.trigger();
		    Assert.isFalse( this.boundCalled, 'bound function unbound' );
		},

		testUnbindAll: function() {
		    var secondBound = false;
		    var secondBindFunc = function() {
			secondBound = true;
		    };

		    this.observable.bind( this.bindFunc );
		    this.observable.bind( secondBound );

		    this.observable.unbindAll();

		    this.observable.trigger();
		    Assert.isFalse( this.boundCalled, 'bound function unbound' );
		    Assert.isFalse( secondBound, 'secondBound function unbound' );
		},

		testIsTriggered: function() {
		    Assert.isFalse( this.observable.isTriggered(), 'observable has not been triggered' );

		    this.observable.trigger();

		    Assert.isTrue( this.observable.isTriggered(), 'observable has been triggered' );
		},

		testTeardown: function() {
		    this.observable.teardown();
		},

		testUniqueIDsAcrossObservables: function() {
			var observable1 = AFrame.Observable.create();
			var observable2 = AFrame.Observable.create();

			var id1 = observable1.bind( function() {} );
			var id2 = observable2.bind( function() {} );

			Assert.areNotEqual( id1, id2, 'ids are unique' );
		}
} );
