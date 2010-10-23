function testForm( Y ) {
	var TestRunner = Y.Test.Runner;
	var Assert = Y.Assert;
	var TestCase = Y.Test.Case;
	
	var test = new TestCase( {
		
		name: "TestCase AFrame.Form",
		
		setUp: function() {
			this.dataContainer = AFrame.construct( {
				type: 'AFrame.DataContainer'
			} );

			this.validateCount = 0;
			this.validateReturn = true;

			var validate = function() {
				this.validateCount++;
				return this.validateReturn;
			}.bind( this );

			this.saveCount = 0;
			var save = function() {
				this.saveCount++;
			}.bind( this );

			this.resetCount = 0;
			var reset = function() {
				this.resetCount++;
			}.bind( this );

			this.clearCount = 0;
			var clear = function() {
				this.clearCount++;
			}.bind( this );
			
			this.form = AFrame.construct( {
				type: 'AFrame.Form',
				config: {
					target: '#AFrame_Form',
					dataContainer: this.dataContainer,
					fieldOptions: {
						immediateSet: true
					},
					formFieldFactory: function( formElement, collection, fieldOptions ) {
						this.factoryFormElement = formElement;
						this.factoryCollection = collection;
						this.factoryFieldOptions = fieldOptions;
						
						return {
							validate: validate,
							save: save,
							reset: reset,
							clear: clear
						};
					}.bind( this )
				}
			} );
		},
		
		tearDown: function () {
			this.form.teardown();
			this.form = null;
			delete this.form;
		},

		testGetFormElements: function() {
			var formElements = this.form.getFormElements();
			Assert.areEqual( 1, formElements.length, 'formElement was found' );
		},

		testGetFormFields: function() {
			var formFields = this.form.getFormFields();
			Assert.areEqual( 1, formFields.length, 'formField was created' );
		},

		testFactoryPassedWithCorrectData: function() {
			Assert.areEqual( this.dataContainer, this.factoryCollection, 'collection passed correctly' );
			Assert.isTrue( this.factoryFieldOptions.immediateSet, 'fieldOptions passed correctly' );
			
			var expectedFormElement = $( '#textFormElement' )[ 0 ];
			Assert.areEqual( expectedFormElement, this.factoryFormElement[ 0 ], 'formElement passed correctly' );
		},

		testValidate: function() {
			Assert.areEqual( 0, this.validateCount, 'field\'s validate has not been called' );

			this.validateReturn = true;
			var valid = this.form.validate();
			
			Assert.areEqual( true, valid, 'valid correctly returns form is valid' );
			Assert.areEqual( 1, this.validateCount, 'field\'s validate has been called' );

			this.validateReturn = false;
			valid = this.form.validate();
			Assert.areEqual( false, valid, 'valid correctly returns form is invalid' );
			Assert.areEqual( 2, this.validateCount, 'field\'s validate has been called' );
		},
		
		testClear: function() {
			Assert.areEqual( 0, this.clearCount, 'clear has not been called yet' );
			this.form.clear();
			Assert.areEqual( 1, this.clearCount, 'clear has been called' );
		},
		
		testReset: function() {
			Assert.areEqual( 0, this.resetCount, 'reset has not been called yet' );
			this.form.reset();
			Assert.areEqual( 1, this.resetCount, 'reset has been called' );
		},
		
		testSave: function() {
			Assert.areEqual( 0, this.saveCount, 'save has not been called yet' );
			this.form.save();
			Assert.areEqual( 1, this.saveCount, 'save has been called' );
		}
	} );

	
	TestRunner.add( test );
}