====================
Alexa Service Client
====================

The SDK includes service clients that you can use to call Alexa APIs
from within your skill logic.

Service clients can be used in any request handler, exception handler,
and request and response interceptor. The ``ServiceClientFactory``
contained inside the ``HandlerInput`` allows you to retrieve client
instances for every supported Alexa service. The
``ServiceClientFactory`` are only available when you `configure the skill
instance <Skill-Builders.html>`__ with an ``ApiClient``.

The following example shows the ``handle`` function for a request
handler that creates an instance of the device address service client.
Creating a service client instance is as simple as calling the
appropriate factory function.

.. code:: javascript

   const handle = async function(handlerInput) {
         const { requestEnvelope, serviceClientFactory } = handlerInput;
         const { deviceId } = requestEnvelope.context.System.device;
         const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
         const address = await deviceAddressServiceClient.getFullAddress(deviceId);
         // other handler logic goes here
   }
