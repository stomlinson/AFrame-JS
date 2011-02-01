$( function() {
    
    // Instead of creating a model, create a SchemaConfig.  A Model in AFrame is an instance of
    //  data combined with a Schema.  The schema config will be used when creating the model.
    var friendSchemaConfig = {
        name: { type: 'text' }
    };

    // Our friends collection is an array.  Instead of binding directly to an event of the
    //  collection, when creating the list, we bind the list to the collection.  
    //  The ListPluginBindToCollection will take care of the updating of the list.
    var friendsCollection = AFrame.construct( {
        type: AFrame.CollectionArray,
        plugins: [ {
            type: AFrame.CollectionPluginModel,
            config: {
                schema: friendSchemaConfig
            }
        } ]
    } );
    
    // This is the friends list.  It is bound to the friendsCollection, so any time a model
    //  is added or removed from the friends collection, the listElementFactory will update
    //  the list.
    var friendsList = AFrame.construct( {
        type: AFrame.List,
        config: {
            target: '#friendList',
            listElementFactory: function( model, index ) {
                return AFrame.DOM.createElement( 'li', model.get( 'name' ) );
            }
        },
        plugins: [ {
            type: AFrame.ListPluginBindToCollection,
            config: {
                collection: friendsCollection
            }
        } ]
    } );
    
    // we insert into the friendsCollection once we have a name.  The list will be 
    //  automatically updated.
    $( '#add-friend' ).click( function( event ) {
           var friend_name = prompt("Who is your friend?");
           // Add new model will be created when adding to the friend collection.
           friendsCollection.insert( { name: friend_name } );
    } );
} );