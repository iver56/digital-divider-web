// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    window.addEventListener("resize", onViewStateChanged);


    function onViewStateChanged(eventArgs) {
        var viewStates = Windows.UI.ViewManagement.ApplicationViewState, msg;
        var newViewState = Windows.UI.ViewManagement.ApplicationView.value;
        if (newViewState === viewStates.snapped) {
            showMenu('snapped');
        } else if (newViewState === viewStates.filled) {
            showMenu('filled');
        } else if (newViewState === viewStates.fullScreenLandscape) {
            showMenu('landscape');
        } else if (newViewState === viewStates.fullScreenPortrait) {
            showMenu('portrait');
        }

    }

    function showMenu(event) {
        if (event === 'snapped') {
            snappedMode.style.visibility = 'visible';
            gameArea.style.visibility = 'hidden';
            rotateDevice.style.visibility = 'hidden';
            filledMode.style.visibility = 'hidden';
        }
        else if (event === 'filled') {
            snappedMode.style.visibility = 'hidden';
            gameArea.style.visibility = 'hidden';
            rotateDevice.style.visibility = 'hidden';
            filledMode.style.visibility = 'visible';
        }
        else if (event === 'portrait') {
            snappedMode.style.visibility = 'hidden';
            gameArea.style.visibility = 'hidden';
            rotateDevice.style.visibility = 'visible';
            filledMode.style.visibility = 'hidden';
        }
        else {
            snappedMode.style.visibility = 'hidden';
            gameArea.style.visibility = 'visible';
            rotateDevice.style.visibility = 'hidden';
            filledMode.style.visibility = 'hidden';
        }
    }

    app.onsettings = function (e) {
        e.detail.applicationcommands = {
            "about": {
                href: "/pages/about/about.html",
                title: "About"
            },
            "privacy": {
                href: "/pages/privacy/privacy.html",
                title: "Privacy Policy"
            }
        }

        WinJS.UI.SettingsFlyout.populateSettings(e);
    };


    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            var viewStates = Windows.UI.ViewManagement.ApplicationViewState, msg;
            var newViewState = Windows.UI.ViewManagement.ApplicationView.value;
            if (newViewState === viewStates.snapped) {
                showMenu('snapped');
            } else if (newViewState === viewStates.filled) {
                showMenu('filled');
            } else if (newViewState === viewStates.fullScreenLandscape) {
                showMenu('landscape');
            } else if (newViewState === viewStates.fullScreenPortrait) {
                showMenu('portrait');
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
})();
