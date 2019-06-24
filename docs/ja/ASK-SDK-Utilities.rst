*****************
ユーティリティ
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
    getDialogState(requestEnvelope: RequestEnvelope): string;
    getSlot(requestEnvelope: RequestEnvelope, slotName: string): Slot;
    getSlotValue(requestEnvelope: RequestEnvelope, slotName: string): string;
    getSupportedInterfaces(requestEnvelope: RequestEnvelope): SupportedInterfaces;
    isNewSession(requestEnvelope: RequestEnvelope): boolean;

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