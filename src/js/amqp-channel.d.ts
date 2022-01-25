/// <reference types="node" />
import AMQPQueue from './amqp-queue.js';
import AMQPConsumer from './amqp-consumer.js';
import AMQPMessage from './amqp-message.js';
import AMQPBaseClient from './amqp-base-client.js';
import { AMQPProperties } from './amqp-properties.js';
/**
 * Represents an AMQP Channel. Almost all actions in AMQP are performed on a Channel.
 */
export default class AMQPChannel {
    readonly connection: AMQPBaseClient;
    readonly id: number;
    readonly consumers: Map<string, AMQPConsumer>;
    readonly promises: [(arg0: any) => void, (err?: Error) => void][];
    private readonly unconfirmedPublishes;
    private closed;
    /** Used for string -> arraybuffer when publishing */
    private static textEncoder;
    /** Frame buffer, reuse when publishes to avoid repated allocations */
    private readonly buffer;
    confirmId: number;
    delivery?: AMQPMessage;
    getMessage?: AMQPMessage;
    returned?: AMQPMessage;
    /**
     * @param connection - The connection this channel belongs to
     * @param id - ID of the channel
     */
    constructor(connection: AMQPBaseClient, id: number);
    /**
     * Declare a queue and return an AMQPQueue instance.
     */
    queue(name?: string, { passive, durable, autoDelete, exclusive }?: {
        passive?: boolean | undefined;
        durable?: boolean | undefined;
        autoDelete?: boolean | undefined;
        exclusive?: boolean | undefined;
    }, args?: {}): Promise<AMQPQueue>;
    /**
     * Alias for basicQos
     * @param prefetchCount - max inflight messages
     */
    prefetch(prefetchCount: number): Promise<any>;
    /**
     * Default handler for Returned messages
     * @param message returned from server
     */
    onReturn(message: AMQPMessage): void;
    /**
     * Close the channel gracefully
     * @param [reason] might be logged by the server
     */
    close(reason?: string, code?: number): Promise<any>;
    /**
     * Synchronously receive a message from a queue
     * @param queue - name of the queue to poll
     * @param param
     * @param [param.noAck=true] - if message is removed from the server upon delivery, or have to be acknowledged
     * @return - returns null if the queue is empty otherwise a single message
     */
    basicGet(queue: string, { noAck }?: {
        noAck?: boolean | undefined;
    }): Promise<AMQPMessage | null>;
    /**
     * Consume from a queue. Messages will be delivered asynchronously.
     * @param queue - name of the queue to poll
     * @param param
     * @param [param.tag=""] - tag of the consumer, will be server generated if left empty
     * @param [param.noAck=true] - if messages are removed from the server upon delivery, or have to be acknowledged
     * @param [param.exclusive=false] - if this can be the only consumer of the queue, will return an Error if there are other consumers to the queue already
     * @param [param.args={}] - custom arguments
     * @param {function(AMQPMessage) : void} callback - will be called for each message delivered to this consumer
     */
    basicConsume(queue: string, { tag, noAck, exclusive, args }: {
        tag?: string | undefined;
        noAck?: boolean | undefined;
        exclusive?: boolean | undefined;
        args?: {} | undefined;
    } | undefined, callback: (msg: AMQPMessage) => void): Promise<AMQPConsumer>;
    /**
     * Cancel/stop a consumer
     * @param tag - consumer tag
     */
    basicCancel(tag: string): Promise<AMQPChannel>;
    /**
     * Acknowledge a delivered message
     * @param deliveryTag - tag of the message
     * @param [multiple=false] - batch confirm all messages up to this delivery tag
     */
    basicAck(deliveryTag: number, multiple?: boolean): Promise<void>;
    /**
     * Acknowledge a delivered message
     * @param deliveryTag - tag of the message
     * @param [requeue=false] - if the message should be requeued or removed
     * @param [multiple=false] - batch confirm all messages up to this delivery tag
     */
    basicNack(deliveryTag: number, requeue?: boolean, multiple?: boolean): Promise<void>;
    /**
     * Acknowledge a delivered message
     * @param deliveryTag - tag of the message
     * @param [requeue=false] - if the message should be requeued or removed
     */
    basicReject(deliveryTag: number, requeue?: boolean): Promise<void>;
    /**
     * Tell the server to redeliver all unacknowledged messages again, or reject and requeue them.
     * @param [requeue=false] - if the message should be requeued or redeliviered to this channel
     */
    basicRecover(requeue?: boolean): Promise<any>;
    /**
     * Publish a message
     * @param exchange - the exchange to publish to, the exchange must exists
     * @param routingKey - routing key
     * @param data - the data to be published, can be a string or an uint8array
     * @param [mandatory] - if the message should be returned if there's no queue to be delivered to
     * @param [immediate] - if the message should be returned if it can't be delivered to a consumer immediately (not supported in RabbitMQ)
     * @return - fulfilled when the message is enqueue on the socket, or if publish confirm is enabled when the message is confirmed by the server
     */
    basicPublish(exchange: string, routingKey: string, data: string | Uint8Array | ArrayBuffer | Buffer | null, properties?: AMQPProperties, mandatory?: boolean, immediate?: boolean): Promise<number>;
    /**
     * Set prefetch limit.
     * Recommended to set as each unacknowledge message will be store in memory of the client.
     * The server won't deliver more messages than the limit until messages are acknowledged.
     * @param prefetchCount - number of messages to limit to
     * @param prefetchSize - number of bytes to limit to (not supported by RabbitMQ)
     * @param global - if the prefetch is limited to the channel, or if false to each consumer
     */
    basicQos(prefetchCount: number, prefetchSize?: number, global?: boolean): Promise<any>;
    /**
     * Enable or disable flow. Disabling flow will stop the server from delivering messages to consumers.
     * Not supported in RabbitMQ
     * @param active - false to stop the flow, true to accept messages
     */
    basicFlow(active?: boolean): Promise<any>;
    /**
     * Enable publish confirm. The server will then confirm each publish with an Ack or Nack when the message is enqueued.
     */
    confirmSelect(): Promise<any>;
    /**
     * Declare a queue
     * @param name - name of the queue, if empty the server will generate a name
     * @param params
     * @param [params.passive=false] - if the queue name doesn't exists the channel will be closed with an error, fulfilled if the queue name does exists
     * @param [params.durable=true] - if the queue should survive server restarts
     * @param [params.autoDelete=false] - if the queue should be deleted when the last consumer of the queue disconnects
     * @param [params.exclusive=false] - if the queue should be deleted when the channel is closed
     * @param args - optional custom queue arguments
     * @return fulfilled when confirmed by the server
     */
    queueDeclare(name?: string, { passive, durable, autoDelete, exclusive }?: {
        passive?: boolean | undefined;
        durable?: boolean | undefined;
        autoDelete?: boolean | undefined;
        exclusive?: boolean | undefined;
    }, args?: {}): Promise<any>;
    /**
     * Delete a queue
     * @param name - name of the queue, if empty it will delete the last declared queue
     * @param params
     * @param [params.ifUnused=false] - only delete if the queue doesn't have any consumers
     * @param [params.ifEmpty=false] - only delete if the queue is empty
     */
    queueDelete(name?: string, { ifUnused, ifEmpty }?: {
        ifUnused?: boolean | undefined;
        ifEmpty?: boolean | undefined;
    }): Promise<any>;
    /**
     * Bind a queue to an exchange
     * @param queue - name of the queue
     * @param exchange - name of the exchange
     * @param routingKey - key to bind with
     * @param args - optional arguments, e.g. for header exchanges
     * @return fulfilled when confirmed by the server
     */
    queueBind(queue: string, exchange: string, routingKey: string, args?: {}): Promise<any>;
    /**
     * Unbind a queue from an exchange
     * @param queue - name of the queue
     * @param exchange - name of the exchange
     * @param routingKey - key that was bound
     * @param args - arguments, e.g. for header exchanges
     * @return fulfilled when confirmed by the server
     */
    queueUnbind(queue: string, exchange: string, routingKey: string, args?: {}): Promise<any>;
    /**
     * Purge a queue
     * @param queue - name of the queue
     * @return fulfilled when confirmed by the server
     */
    queuePurge(queue: string): Promise<{
        messageCount: number;
    }>;
    /**
     * Declare an exchange
     * @param name - name of the exchange
     * @param type - type of exchange (direct, fanout, topic, header, or a custom type)
     * @param param
     * @param [param.passive=false] - if the exchange name doesn't exists the channel will be closed with an error, fulfilled if the exchange name does exists
     * @param [param.durable=true] - if the exchange should survive server restarts
     * @param [param.autoDelete=false] - if the exchange should be deleted when the last binding from it is deleted
     * @param [param.internal=false] - if exchange is internal to the server. Client's can't publish to internal exchanges.
     * @param args - optional arguments
     * @return Fulfilled when the exchange is created or if it already exists
     */
    exchangeDeclare(name: string, type: string, { passive, durable, autoDelete, internal }?: {
        passive?: boolean | undefined;
        durable?: boolean | undefined;
        autoDelete?: boolean | undefined;
        internal?: boolean | undefined;
    }, args?: {}): Promise<any>;
    /**
     * Delete an exchange
     * @param name - name of the exchange
     * @param param
     * @param [param.ifUnused=false] - only delete if the exchange doesn't have any bindings
     * @return Fulfilled when the exchange is deleted or if it's already deleted
     */
    exchangeDelete(name: string, { ifUnused }?: {
        ifUnused?: boolean | undefined;
    }): Promise<any>;
    /**
     * Exchange to exchange binding.
     * @param destination - name of the destination exchange
     * @param source - name of the source exchange
     * @param routingKey - key to bind with
     * @param args - optional arguments, e.g. for header exchanges
     * @return fulfilled when confirmed by the server
     */
    exchangeBind(destination: string, source: string, routingKey?: string, args?: {}): Promise<any>;
    /**
     * Delete an exchange-to-exchange binding
     * @param destination - name of destination exchange
     * @param source - name of the source exchange
     * @param routingKey - key that was bound
     * @param args - arguments, e.g. for header exchanges
     * @return fulfilled when confirmed by the server
     */
    exchangeUnbind(destination: string, source: string, routingKey?: string, args?: {}): Promise<any>;
    /**
     * Set this channel in Transaction mode.
     * Rember to commit the transaction, overwise the server will eventually run out of memory.
     */
    txSelect(): Promise<any>;
    /**
     * Commit a transaction
     */
    txCommit(): Promise<any>;
    /**
     * Rollback a transaction
     */
    txRollback(): Promise<any>;
    private txMethod;
    /**
     * Resolves the next RPC promise
     * @ignore
     */
    resolvePromise(value?: any): boolean;
    /**
     * Rejects the next RPC promise
     * @return true if a promise was rejected, otherwise false
     */
    private rejectPromise;
    /**
     * Send a RPC request, will resolve a RPC promise when RPC response arrives
     * @param frame with data
     * @param frameSize - bytes the frame actually is
     */
    private sendRpc;
    /**
     * Marks the channel as closed
     * All outstanding RPC requests will be rejected
     * All outstanding publish confirms will be rejected
     * All consumers will be marked as closed
     * @ignore
     * @param [err] - why the channel was closed
     */
    setClosed(err?: Error): void;
    /**
     * @return Rejected promise with an error
     */
    private rejectClosed;
    /**
     * Called from AMQPBaseClient when a publish is confirmed by the server.
     * Will fulfill one or more (if multiple) Unconfirmed Publishes.
     * @ignore
     * @param deliveryTag
     * @param multiple - true if all unconfirmed publishes up to this deliveryTag should be resolved or just this one
     * @param nack - true if negative confirm, hence reject the unconfirmed publish(es)
     */
    publishConfirmed(deliveryTag: number, multiple: boolean, nack: boolean): void;
    /**
     * Called from AMQPBaseClient when a message is ready
     * @ignore
     * @param message
     */
    onMessageReady(message: AMQPMessage): void;
    /**
     * Deliver a message to a consumer
     * @ignore
     */
    deliver(message: AMQPMessage): void;
}
//# sourceMappingURL=amqp-channel.d.ts.map