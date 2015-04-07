"use strict";
var amqp_cb = require('amqplib/callback_api'),
    amqp = require('amqplib'),
    when = require('when'),
    channel, connection;
    

var get_conn = function(cb){
  if(!channel){
    amqp_cb.connect("amqp://localhost",{},function(err, conn){
        if (err !== null)  cb(err,null)
        connection = conn;
        connection.createChannel(function(err, ch){
          cb(null,ch);
        })
    })
  } else{
      cb(null,channel);
  }
}
// Both the below APIs make a durable queue with persistent messages.
module.exports = {
  // This is an asynchronous function.
  // Needs cb, but can be scaled up to 3K messages per second. Tested on Mac.
    send_message_async: function(q,msg, cb){
      get_conn(function(err,ch){
        channel = ch;
        ch.assertQueue(q, {durable: true}, function(err, ok) {
          if (err !== null) return bail(err, conn);
          ch.sendToQueue(q, new Buffer(msg), {deliveryMode: true});
          console.log(" [x] Sent '%s'", msg);
          cb()
        });
      });
    },
    // Use below method to close the connection created to avoid the process hanging around.
    close_async_connection: function(){
      channel.close(function() {
        connection.close(); 
      });
    },
  // This is a synchronous function, can be used for real time queing.
  // But wont be able to handle much load, should be limited to <100 messages per second.
   send_message_sync: function(q,msg){
    amqp.connect('amqp://localhost').then(function(conn) {
      return when(conn.createChannel().then(function(ch) {

        var ok = ch.assertQueue(q, {durable: true});
        
        return ok.then(function(_qok) {
          ch.sendToQueue(q, new Buffer(msg), {deliveryMode: true});
          console.log(" [x] Sent '%s'", msg);
          return ch.close();
        });
      })).ensure(function() { conn.close(); });;
    }).then(null, console.warn);
   }
}
