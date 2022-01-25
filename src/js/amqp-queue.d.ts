import AMQPMessage from './amqp-message.js';
import AMQPChannel from './amqp-channel.js';
import { AMQPProperties } from './amqp-properties.js';
import AMQPConsumer from './amqp-consumer.js';
/**
 * Convience class for queues
 */
export default class AMQPQueue {
    readonly channel: AMQPChannel;
    readonly name: string;
    /**
     * @param channel - channel this queue was declared on
     * @param name - name of the queue
     */
    constructor(channel: AMQPChannel, name: string);
    /**
     * Bind the queue to an exchange
     */
    bind(exchange: string, routingKey?: string, args?: {}): Promise<AMQPQueue>;
    /**
     * Delete a binding between this queue and an exchange
     */
    unbind(exchange: string, routingKey?: string, args?: {}): Promise<AMQPQueue>;
    /**
     * Publish a message directly to the queue
     * @param body - the data to be published, can be a string or an uint8array
     * @param properties - publish properties
     * @return fulfilled when the message is enqueue on the socket, or if publish confirm is enabled when the message is confirmed by the server
     */
    publish(body: string | Uint8Array | ArrayBuffer, properties?: AMQPProperties): Promise<AMQPQueue>;
    /**
     * Subscribe to the queue
     * @param params
     * @param [params.noAck=true] - if messages are removed from the server upon delivery, or have to be acknowledged
     * @param [params.exclusive=false] - if this can be the only consumer of the queue, will return an Error if there are other consumers to the queue already
     * @param [params.tag=""] - tag of the consumer, will be server generated if left empty
     * @param [params.args={}] - custom arguments
     * @param {function(AMQPMessage) : void} callback - Function to be called for each received message
     */
    subscribe({ noAck, exclusive, tag, args }: {
        noAck?: boolean | undefined;
        exclusive?: boolean | undefined;
        tag?: string | undefined;
        args?: {} | undefined;
    } | undefined, callback: (msg: AMQPMessage) => void): Promise<AMQPConsumer>;
    /**
     * Unsubscribe from the queue
     */
    unsubscribe(consumerTag: string): Promise<AMQPQueue>;
    /**
     * Delete the queue
     */
    delete(): Promise<AMQPQueue>;
    /**
     * Poll the queue for messages
     * @param params
     * @param params.noAck - automatically acknowledge messages when received
     */
    get({ noAck }?: {
        noAck?: boolean | undefined;
    }): Promise<AMQPMessage | null>;
    purge(): Promise<{
        messageCount: number;
    }>;
}
//# sourceMappingURL=amqp-queue.d.ts.map