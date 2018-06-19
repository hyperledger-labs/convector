# Convector Base Storage

This module contains the storage interface to be used by any other final storage layer. This is necessary to keep the model invocation agnostic, and be able to provide different implementations based on the environment.

Create a new implementation by extending this one and implementing the corresponding methods. Make sure to assign your implementation instance to the `BaseStorage.current` property, that's how a model interact with your code.
