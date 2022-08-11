import {
  EventBusOptions, 
  IEventBus, 
  IEventBusSubscriptionsManager, 
  IIntegrationEventHandler, 
  IntegrationEvent, 
  Type
} from "@ilotustech/common";
import {Channel, Connection, Options} from "amqplib";

export class RabbitMQEventBus implements IEventBus {
  private channel: Channel
  private subscribers: [Type<IntegrationEvent>, IIntegrationEventHandler][] = []

  constructor(
    private connection: Connection,
    private subsManager: IEventBusSubscriptionsManager,
    private options: EventBusOptions,
    private application: string
  ) {
    this.setup()
  }

  private getChannel(){
    return this.connection.createChannel()
  }

  private async setup(){
    this.channel = await this.getChannel()
    const {events} = this.options
    await Promise.all(events.map(async event => {
      const exchange = event.name;
      await this.channel.assertExchange(exchange, 'direct')
    }));
  
    while(this.subscribers.length > 0){
      const events = this.subscribers.pop()
      if(!events) return
      this.addSubscription(...events)
    }
  }

  async publish(event: IntegrationEvent) {
    const exchange = event.constructor.name
    const basicOptions: Options.Publish = {deliveryMode: 2, mandatory: true}
    this.channel.publish(exchange, '', Buffer.from(event.toString()), basicOptions)
  }

  async addSubscription(event: Type<IntegrationEvent>, handler: IIntegrationEventHandler) {
    const exchange = event.name;
    const queueName = [this.application, exchange, handler.constructor.name].join('.')
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

  async subscribe(event: Type<IntegrationEvent>, handler: IIntegrationEventHandler) {
    this.subsManager.addSubscription(event, handler);
    if(!this.channel) {
      this.subscribers.push([event, handler]);
      return
    }
    this.addSubscription(event, handler);
  }

  async destroy(){
    await this.channel.close()
    await this.connection.close()
  }
}
