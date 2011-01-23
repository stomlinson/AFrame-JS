function DOMTest( adapter, name ) {
    var events;
    var DOM = adapter;
    var eventType;
    
    var genericHandler = function( event ) {
        events[ ( event && event.type ) || eventType ] = true;
    };
    
    var origDOMAdapter;
    
    return {
        name: "TestCase DOM - " + name,
        
        setUp: function() {
            events = {};
            $( '.DOMSelection' ).empty().append( '<div>Part 1</div><div>Part 2</div><div>Part 3</div>' );
        },
        
        tearDown: function() {
        },
        
        testGetElements: function() {
            var elements = DOM.getElements( 'body' );
            
            Assert.areSame( 1, elements.length, 'getElements returns an array' );
        },
        
        testGetDescendentElements: function() {
            var body = DOM.getElements( 'body' );
            var buttons = DOM.getDescendentElements( '.button', body );
            
            Assert.isNumber( buttons.length, 'getDescendentElements returns an array like object' );
        },

        testGetElementsIncludeRoot: function() {
            var root = DOM.getElements( '.DOMSelection' );
            var divsIncludingRoot = DOM.getElementsIncludeRoot( 'div', root );
            
            Assert.areSame( 4, divsIncludingRoot.length, 'getElementsIncludeRoot gets the correct number of elements' );
        },
        
        testGetChildren: function() {
            var children = DOM.getChildren( '.DOMSelection' );
            Assert.areSame( 3, children.length, 'getChildren returns the children' );
        },
        
        testGetNthChild: function() {
            var child = DOM.getNthChild( '.DOMSelection', 0 );
            Assert.isObject( child, 'we got a child' );
        },
        
        testIterate: function() {
            var children = DOM.getChildren( '.DOMSelection' );
            var maxIndex = -1;
            var context;
            DOM.forEach( children, function( element, index ) {
                maxIndex = index;
                context = this;
            }, this );
            
            Assert.areSame( 2, maxIndex, 'iterator sending arguments in expected order' );
            Assert.areSame( this, context, 'context set correctly' );
        },
        
        testBindFireEvent: function() {
            DOM.bindEvent( '.DOMSelection', 'click', genericHandler );
            
            eventType = 'click';
            DOM.fireEvent( '.DOMSelection', 'click' );
            Assert.isTrue( events.click, 'fireEvent is working right' );
        },
        
        testUnbindEvent: function() {
            DOM.unbindEvent( '.DOMSelection', 'click', genericHandler );
            
            eventType = 'click';
			AFrame.DOM.fireEvent( '.DOMSelection', 'click' );
            
            Assert.isUndefined( events.click, 'unbindEvent is working right' );
        },
        
        testSetInnerInput: function() {
            DOM.setInner( '#validationField', 'test element value' );
            
            Assert.areSame( 'test element value', $( '#validationField' ).val(), 'setInner working on input' );
        },
        
        testSetInnerNonInput: function() {
            DOM.setInner( '#testSetInnerNonInput', 'test element value' );
            
            Assert.areSame( 'test element value', $( '#testSetInnerNonInput' ).html(), 'setInner working on div' );
        },
        
        testGetInnerInput: function() {
            DOM.setInner( '#validationField', 'test element value' );
            
            Assert.areSame( 'test element value', DOM.getInner( '#validationField' ), 'getInner working on input' );

            DOM.setInner( '#validationField', 'test element value' );
            
            Assert.areSame( 'test element value', DOM.getInner( DOM.getElements( '#validationField' ) ), 'getInner working with getElements' );
        },
        
        testGetInnerNonInput: function() {
            DOM.setInner( '#testSetInnerNonInput', 'test element value' );
            
            Assert.areSame( 'test element value', DOM.getInner( '#testSetInnerNonInput' ), 'getInner working on div' );
        },
        
        testSetAttr: function() {
            DOM.setAttr( '#testSetInnerNonInput', 'data-attr', 'test attr' );
            
            Assert.areSame( 'test attr', $( '#testSetInnerNonInput' ).attr( 'data-attr' ), 'setAttr working' );
        },
        
        testGetAttr: function() {
            DOM.setAttr( '#testSetInnerNonInput', 'data-attr', 'test attr' );
            
            Assert.areSame( 'test attr', DOM.getAttr( '#testSetInnerNonInput', 'data-attr' ), 'getAttr working' );
        },
        
        testHasAttr: function() {
            Assert.isTrue( DOM.hasAttr( '#testSetInnerNonInput', 'data-attr' ), 'hasAttr working with element with attribute' );
            Assert.isFalse( DOM.hasAttr( '#validationField', 'data-attr' ), 'hasAttr working with element without attribute' );
        },
        
        testAddClass: function() {
            DOM.addClass( '#testSetInnerNonInput', 'testClass' );
            
            Assert.isTrue( $( '#testSetInnerNonInput' ).hasClass( 'testClass' ), 'addClass is working' );
        },
        
        testRemoveClass: function() {
            DOM.addClass( '#testSetInnerNonInput', 'testClass' );
            DOM.removeClass( '#testSetInnerNonInput', 'testClass' );
            
            Assert.isFalse( $( '#testSetInnerNonInput' ).hasClass( 'testClass' ), 'removeClass is working' );
        },

        testHasClass: function() {
            DOM.addClass( '#testSetInnerNonInput', 'testClass' );
            Assert.isTrue( DOM.hasClass( '#testSetInnerNonInput', 'testClass' ), 'hasClass is working when class exists' );

            DOM.removeClass( '#testSetInnerNonInput', 'testClass' );
            Assert.isFalse( DOM.hasClass( '#testSetInnerNonInput', 'testClass' ), 'hasClass is working when no class' );
        },
        
        testCreateElement: function() {
            var contents = 'some <span>html contents</span>';
            var element = DOM.createElement( 'div', contents );
            
            Assert.isTrue( $( element ).is( 'div' ), 'element created' );
            Assert.areSame( contents, $( element ).html(), 'element has contents set' );
        },
        
        testAppendTo: function() {
            $( '.DOMSelection' ).empty();
            
            DOM.appendTo( DOM.createElement( 'div', 'empty div' ), '.DOMSelection' );
            
            Assert.areSame( 1, $( '.DOMSelection' ).children().length, 'appendTo appends' );
        },
        
        testInsertBefore: function() {
            $( '.DOMSelection' ).empty();
            
            var first = DOM.createElement( 'div', 'first div' );
            DOM.appendTo( first, '.DOMSelection' );
            DOM.insertBefore( DOM.createElement( 'div', 'second div' ), first );
            
            Assert.areSame( 2, $( '.DOMSelection' ).children().length, 'appendTo appends' );
        },
        
        testInsertAsNthChild: function() {
            var second = DOM.createElement( 'div', '2nd child' );
            DOM.addClass( second, 'second' );
            
            DOM.insertAsNthChild( second, '.DOMSelection', 1 );
            
            Assert.areSame( 4, $( '.DOMSelection' ).children().length, 'appendTo appends' );
        },
        
        testRemoveElement: function() {
            DOM.removeElement( '.second' );
            
            Assert.areSame( 0, $( '.second' ).length, 'remove has worked' );
        }
    };
}
testsToRun.push( DOMTest( AFrame.DOM, 'jQuery' ) );
testsToRun.push( DOMTest( AFrame.DOMMOO, 'MooTools' ) );