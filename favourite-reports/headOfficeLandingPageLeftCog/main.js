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
            // AMONIS: 01/02/2018: Removed as non functional at time of pilot
            // View all devices installed
            // { name:'Clients', label:'Clients Search', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) },
            // AMONIS: 01/02/2018: Removed as non functional at time of pilot
            // View all devices installed
            // { name:'Clients', label:'Office Search', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) },
            // All Apps
            { name:'AllApps', label:'Apps', fn:function( data, evt ){ my[ 'on' + data.name ]( data, evt ); }.bind( this ) }
        ] );

        // AMONIS: 25/05/2018: State object for saving
        my.model.state = { savedReports:[] };

        my.model.allReports = phil.observe( [] );
        my.model.savedReports = phil.observe( [] );
        my.model.selectedReport = phil.observe( [] );

        my.model.onAddReport = function( data, evt ){
          // Fix issue where refixturing causes my.model.savedReports to become undefined.
          // Issue dosnt occur any other time.
          if( !my.model.savedReports() ) {
            console.log('my.model.savedReports is undefined');
            my.model.savedReports( [] );
          }

          // Prevent the same report from being added more than once
          for( var i=0; i < my.model.savedReports().length; i++ ) {
            var savedReport = my.model.savedReports()[ i ];

            // Check if the selected report is already in the saved reports list
            // if it is, then display a toast notification that it is
            if( my.model.selectedReport().label === savedReport.label ) {
              my.$alert( my.model.selectedReport().label + " - has already been saved" );
              return
            }
          }

          // JCARNEY 01/06/18: commented out and ported over to dashboard.js
          // my.addReport( my.model.selectedReport() );
          AddReport( my.model.selectedReport(), my.model.savedReports );

          // Update the appstate
          my.saveState();
        };

        my.model.onRemoveAll = function( data, evt ){
          // Clear the saved reports
          my.model.savedReports( [] );

          // Save the appState
          my.saveState();
        }

        // @JC 26/05/18: Navigate to the selected report
        my.model.redirectToReport = function( data ) {
          // Setup config for going to the selected report form
          var backpack = Forms.defaultBody.call( my, data.name, {} ); // Use call(my) to get around Forms call issue

          // Navigate to the default form space
          Navigation.navTo( "System.formSpace", backpack );
        };

        // Remove the selected report from the pinned reports section
        my.model.removeReport = function( data ) {
          for( var i=0;  i < my.model.savedReports().length; i++ ) {
            var reportId = my.model.savedReports()[i].id;

            if (data.id == reportId ) {
                my.model.savedReports.remove( data );
                my.saveState();
            }
          }
        };

    } );

    /**
     * Fired Once when the cog is initialised
     */
    my.$on( "postInit", function( params ){} );

    /**
     * Fired when the cog is shown
     */
    my.$on( "postShown", function( params ){
        // Request the User Profile from the user service
        my.$pulse( "internal.user.profile.request", {} );

        // JCARNEY: add in the category filter "iotaaFranchiseReporting"
        // This appears to give us the list of reports that are at
        // tools > admin tasks > franchise reporting
        my.$pulse( "pumpCo.form.list.request", { "category": [ "iotaaFranchiseReporting" ] } );

        // Get the list of saved reports ie AppState
        my.$pulse( "pumpCo.user.appState.list.request", {} );
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

    my.onSettings = function(){
        Navigation.navTo( "System.controlCentreSpace", {} );
    }

    my.onClients= function(){
        my.$alert( "Note: Search not implemented in demo" );
        // Navigation.navTo( "System.deviceManagementSpace", {} );
    };

    my.onNotifications = function(){
        Navigation.navTo( "System.notificationsSpace", {} );
    };

    my.onAllApps = function(){
        Navigation.navTo( "System.HomeSpace", {} );
    };

    // #### Pulse responses #### //

    my.$on( "pumpCo.form.list.response", function( pulse ) {
      // JCARNEY 01/06/18: commented out and ported over to dashboard.js
      // my.processReportsList( __get( "pulseBody.questionnaire", pulse ) );
      ProcessReportsList( __get( "pulseBody.questionnaire", pulse ), my.model.allReports );
    });

    my.$on( "pumpCo.user.appState.list.response", function( pulse ) {
      // JCARNEY 01/06/18: commented out and ported over to dashboard.js
      // my.loadState( __get( "pulseBody.state", pulse ) );
      var loadState = LoadState( __get( "pulseBody.state", pulse ), my.model.state, my.model.savedReports );
      my.model.state = loadState;
    });

    // confirmation we have saved a favourite report
    my.$on( "pumpCo.user.appState.save.response", function( pulse ) {
      // AMONIS: 25/05/2018: No action required
    });

    // #### Custom methods #### //

    /**
     * ### processReportsList
     * AMONIS: 25/05/2018: Dedicated processor of Forms data
     * TODO: remove "saved" items from this list
     * {
       "id": "5b080202b50597727f876595",
       "name": "iotaa.form.reporting.franchise.actions.localOffice",
       "label": "Actions Report",
       "type": "TYPE_FORM",
       "categories": [
         "iotaaFranchiseReporting"
       ],
       "context": {},
       "sortOrder": 2147483647,
       "requirements": {}
     }
     * @param  {[type]} list [description]
     * @return {[type]}      [description]
     */
    // JCARNEY 01/06/18: commented out and ported over to dashboard.js
    // my.processReportsList = function( list ){
    //   // Add all items to list
    //   my.model.allReports( list );
    // };

    /**
     * ### addReport
     * @param  {[type]} report [description]
     * @return {[type]}        [description]
     */
    // JCARNEY 01/06/18: commented out and ported over to dashboard.js
    // my.addReport = function( report ){
    //   // Save the model states
    //   my.model.savedReports.push( report );
    //   // Update the appstate
    //   my.saveState();
    // };

    /**
     * ### saveState
     * AMONIS: 25/05/2018: Save the internal state using the pulse
     * @return {[type]} [description]
     */
    my.saveState = function(){
      // Update state, from observable
      my.model.state[ "savedReports" ] = my.model.savedReports();

      // Store the state
      my.$pulse( "pumpCo.user.appState.save.request", { state:my.model.state } );
    };

    /**
     * ### loadState
     * AMONIS: 25/05/2018: Update the internal state from the pulse data
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */
    // JCARNEY 01/06/18: commented out and ported over to dashboard.js
    // my.loadState = function( state ){
    //   if( state ){
    //     // Update the state object
    //     my.model.state = state;
    //     // Update the observables
    //     my.model.savedReports(my.model.state[ "savedReports" ]);
    //   }
    // };

    // Initialise the Cog
    my.$init();
} );
