import {IEventBus, IEventBusSubscriptionsManager, RmqOptions} from "../../intefaces";
import {IEventHandler, IntegrationEvent} from "../../events";
import {Channel, Connection, Options} from "amqplib";
import {RabbitMQSingleton} from "./rabbitmq.singleton";

export class RabbitMQEventBus implements IEventBus {
  private channel: Channel
  private connection: Connection
  private subscribers: [ClassType<IntegrationEvent>, IEventHandler][] = []

  constructor(
    private config: RmqOptions,
    private subsManager: IEventBusSubscriptionsManager,
  ) {
    this.setup()
  }

  private async setup(){
    const {options} = this.config
    this.connection = await RabbitMQSingleton.getInstance(options)
    this.channel = await this.connection.createChannel()
 
    while(this.subscribers.length > 0){
      const events = this.subscribers.pop()
      if(!events) return
      this.addSubscription(...events)
    }
  }

  private async addSubscription(event: ClassType<IntegrationEvent>, handler: IEventHandler) {
    const exchange = event.name;
    const queueName = [exchange, handler.constructor.name].join('.')
    await this.channel.assertQueue(queueName)
    await this.channel.bindQueue(queueName, exchange, '')

    this.channel.consume(queueName, async (msg) => {
      if (!msg) return
      const eventData = new event(JSON.parse(msg.content.toString()))
      try {
        const result = await handler.handle(eventData)
        if (result.isOk()) this.channel.ack(msg)
      } catch (e: any) {
        console.log(e.message)
      }
    })
  }

  public async register(events: ClassType<IntegrationEvent>[]) {
    await Promise.all(events.map(async event => {
      const exchange = event.name;
      await this.channel.assertExchange(exchange, 'direct')
    }));
  }

  public async publish(event: IntegrationEvent) {
    const exchange = event.constructor.name
    const basicOptions: Options.Publish = {deliveryMode: 2, mandatory: true}
    this.channel.publish(exchange, '', Buffer.from(event.toString()), basicOptions)
  }

  public async subscribe(event: ClassType<IntegrationEvent>, handler: IEventHandler) {
    this.subsManager.addSubscription(event, handler);
    if(!this.channel) {
      this.subscribers.push([event, handler]);
      return
    }
    this.addSubscription(event, handler);
  }

  public async destroy(){
    await this.channel.close()
    await this.connection.close()
  }
}
