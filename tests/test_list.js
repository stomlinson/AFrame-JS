function testList( Y ) {
	var TestRunner = Y.Test.Runner;
	var Assert = Y.Assert;
	var TestCase = Y.Test.Case;
	
	var test = new TestCase( {
		
		name: "TestCase AFrame.List",
		
		setUp: function() {
			this.list = AFrame.construct( {
				type: 'AFrame.List',
				config: {
					target: '#AFrame_List .list',
					createListElementCallback: function( index, data ) {
						this.insertedIndex = index;
						this.insertedData = data;
						var rowElement = $( '<li id="' + ( data.id ? data.id : 'inserted' + index ) + '">Inserted Element</li>' );
						return rowElement;
					}.bind( this )
					
				}
			} );
		},
		
		tearDown : function () {
			$( '#AFrame_List .list' ).html( '' );
			
			this.list.teardown();
			this.list= null;
			delete this.list;
		},

		testInsert: function() {
			this.list.insert( { field: 'fieldValue' }, 0 );
			
			Assert.areEqual( 0, this.insertedIndex, 'create function called for correct index' );
			Assert.areEqual( 'fieldValue', this.insertedData.field, 'create function called with correct data' );
			Assert.areEqual( 1, $( 'ul > li#inserted0' ).length, 'list element inserted' );

			this.list.insert( { field: 'fieldValue' }, 1 );
			Assert.areEqual( 1, $( 'ul > li#inserted1' ).length, 'second list element inserted' );

			this.list.insert( { id: 'insertedBefore1' }, 1 );
			Assert.areEqual( 1, $( 'ul > li#insertedBefore1' ).length, 'third list element inserted' );

			Assert.areEqual( 1, $( 'li#insertedBefore1 + li#inserted1' ).length, 'third inserted in correct order' );

			this.list.insert( { id: 'insertedOutOfOrder' }, 10 );
			Assert.areEqual( 1, $( 'li#insertedOutOfOrder' ).length, 'out of order insert inserts at end' );

			var insertData;
			this.list.bindEvent( 'onInsert', function( data ) {
				insertData = data;
			} );
			this.list.insert( { id: 'insertWithObservable' }, Infinity );
			Assert.areEqual( 'insertWithObservable', insertData.data.id, 'onInsert data set correctly' );
			Assert.isNotUndefined( insertData.index, 'onInsert data index set correctly' );
		},

		testInsertElement: function() {
			this.list.insertElement( $( '<li id="insertRowInsert">Insert Row Insert</li>' ), 0 );
			Assert.areEqual( 1, $( 'li#insertRowInsert' ).length, 'insertRow correctly working' );
		}
	} );

	TestRunner.add( test );
}
    