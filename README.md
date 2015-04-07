# rabbitMQ
NodeJS RabbitMQ client based on amqlib.

This module provides both callback&promise based functions to interact with RabbitMQ.

Callback based function reuses connection/channel, ideal for async based function calls. Connections needs to be 
closed explicitly after usage, provided a function for same purpose.


Promise based function doesn't reuse connection, closes after each request.
