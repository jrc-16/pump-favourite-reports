/*
 * Pump API and Application 1.0.0
 * Copyright(c) 2016 PumpCo Inc.
 * licensing@pumpco.co.uk
 * http://www.pumpco.co.uk/license
 */
the.App.onReady(function () {
    /**
     * Fired when the App has created the basic model structure for you to extend
     * my.model
     */
    my.$on( "postModelCreate", function(){
        my.model.logo       = phil.observe( params.basePath + params.imageName )
        // **observable** {JSON} vcard
        my.model.vcard      = phil.observe( {} );
        // **observable** {JSON} propfile
        my.model.profile    = phil.observe( {} );

        my.model.actions    = phil.observe( [
            // View all alerts
            { name:'Notifications', label:'Alerts', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) },
            // View all alerts
            { name:'Notifications', label:'Notifications', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) },
            // User profile screen
            { name:'Actions', label:'Actionable Insights', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) }
            // User profile screen
            // { name:'ConvCentre', label:'Messages', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) },
            // All Apps
            // { name:'AllApps',   label:'Apps',           fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) }
            // View all devices installed
            // AMONIS: 01/02/2018: non functional at time
            // { name:'Clients', label:'Client Search', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) },
            // All Apps
            // { name:'CareGiverSearch', label:'CAREGiver Search', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) }
        ] );

        // @JC 24/05/18: i think i need a observable array
        my.model.appflowList = phil.observe( [] );


    } );

    /**
     * Fired Once when the cog is initialised
     */
    my.$on( "postInit", function( params ){} );

    /**
     * Fired when the cog is shown
     *
     * // #### pulse requests #### ///
     */
    my.$on( "postShown", function( params ){
        // Request the User Profile from the user service
        my.$pulse( "internal.user.profile.request", {} );

        // @JC 24/05/18 - favourite reports: requst the pulse when the cog has shown.
        // Better than requesting outside of postShown.
        my.$pulse( "pumpCo.form.list.request", {} );
    } );

    /**
     * Fired when the cog is hidden
     */
    my.$on( "postHidden", function( params ){} );

    /**
     * ###postCardCreate
     * Cards are loaded Async sych, such that postInit can/will complete BEFORE the CARDS are ready.
     * If you are using Cards, you MUST wait until this completes, before creating any cards.
     */
    my.$on( "postCardCreate", function( data ){} );

    /*
        Event Handlers
     */
    my.$on( "internal.user.profile.response", function( pulse ){
        // pulse = mockPulse

        // Get the VCard information from the pulse.
        my.model.vcard( __get( "pulseBody.vcard", pulse ) );
        // Get the Profile information from the pulse.
        my.model.profile( __get( "pulseBody.profileBody", pulse ) );
    } );

    my.onProfile = function(){
        console.log( "TBC: nav Profile" );
        Navigation.navTo( "System.ProfileSpace", {
            "key": "system.coreBook.book",
            "package": {
                "_key": "system.coreBook.book",
                "bookId": "pump:userProfileBook"
            }
        } );
    };

    my.onActions = function(){
        Navigation.navTo( "System.actionSpace", {} );
    }

    my.onClients= function(){
        my.$alert( "TBC: All Clients List" );
        // Navigation.navTo( "System.deviceManagementSpace", {} );
    };

    my.onNotifications = function(){
        Navigation.navTo( "System.notificationsSpace", {} );
    };

    my.onAllApps = function(){
        Navigation.navTo( "System.HomeSpace", {} );
    };

    my.onConvCentre = function(){
        Navigation.navTo( "System.convCentreSpace", {} );
    };

    my.onCareGiverSearch = function(){
        my.$alert("CAREGiver search not implemented for demo");
    };

    // #### pulse responses #### ///
    my.$on( "pumpCo.form.list.response", function( pulse ) {

      console.log("// reached listResponse");

      // my.model.appflowList( __get( "pulseBody.questionnaire", pulse ) );
      // console.log(my.model.appflowList());

      var list = __get( "pulseBody.questionnaire", pulse );


debugger
      for( var i=0; i < list.length; i++ ) {
    	   // var appflowItem = my.model.appflowList()[i];
         // console.log( appflowItem.label );

         var listItem = list[i];
         console.log( listItem.label );

         my.model.appflowList.push( listItem.label );

         console.log( my.model.appflowList() );

      }
    } );

    // Initialise the Cog
    my.$init();
} );
