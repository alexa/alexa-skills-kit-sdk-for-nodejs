*****************
ASK SDK Utilities
*****************

The SDK provides mutiple utility functions that aims to reduce boilerplate code so that you can focus on skill business logic.

RequestEnvelopeUtils
====================

The ``RequestEnvelopeUtils`` provides functions for getting frequently used attributes from the ``RequestEnvelope`` with error checking logic.

Available Methods
-----------------

.. code-block:: typescript

    getLocale(requestEnvelope: RequestEnvelope): string;
    getRequestType(requestEnvelope: RequestEnvelope): string;
    getIntentName(requestEnvelope: RequestEnvelope): string;
    getAccountLinkingAccessToken(requestEnvelope: RequestEnvelope): string;
    getApiAccessToken(requestEnvelope: RequestEnvelope): string;
    getDeviceId(requestEnvelope: RequestEnvelope): string;
    getUserId(requestEnvelope: RequestEnvelope): string;
    getDialogState(requestEnvelope: RequestEnvelope): string;
    getSlot(requestEnvelope: RequestEnvelope, slotName: string): Slot;
    getSlotValue(requestEnvelope: RequestEnvelope, slotName: string): string;
    getSupportedInterfaces(requestEnvelope: RequestEnvelope): SupportedInterfaces;
    isNewSession(requestEnvelope: RequestEnvelope): boolean;

Example
-------

The following code example shows how you can use the request envelope utilities.

.. code-block:: javascript

    const ExampleIntentHandler = {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExampleIntent';
        },
        handle(handlerInput) {
            const userId = Alexa.getUserId(handlerInput.requestEnvelope);
            const deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope);
            const locale = Alexa.getLocale(handlerInput.requestEnvelope);
            const slotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'slotName');
            // Code to handle the intent and return a response ...
        }
    };

SsmlUtils
=========

The ``SsmlUtils`` provides a function for escaping invalid SSML characters in a speech string.

Available Methods
-----------------

.. code-block:: typescript

    escapeXmlCharacters(input: string): string

ViewportUtils
=============

The ``ViewportUtils`` provides functions for checking the viewport profile and other device characteristics such as display size or dpi in the ``RequestEnvelope``.

Available Methods
-----------------

.. code-block:: typescript

    getViewportOrientation(width: number, height: number): ViewportOrientation;
    getViewportSizeGroup(size: number): ViewportSizeGroup;
    getViewportDpiGroup(dpi: number): ViewportDpiGroup;
    getViewportProfile(requestEnvelope: RequestEnvelope): ViewportProfile;