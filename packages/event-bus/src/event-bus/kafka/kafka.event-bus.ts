import {EventBusOptions, IEventBus, IEventBusSubscriptionsManager} from "@type";
import {IEventHandler, IntegrationEvent} from "@event";
import {Admin, Consumer, Kafka, Producer} from "kafkajs";

export class KafkaEventBus implements IEventBus {
  private admin: Admin
  private producer: Producer
  private consumerMap: Map<string, Consumer> = new Map()

  constructor(
    private kafkaClient: Kafka,
    private subsManager: IEventBusSubscriptionsManager,
    private options: EventBusOptions,
    private application: string
  ) {
    this.setup()
  }

  async setup(){
    const {events} = this.options
    this.admin = this.kafkaClient.admin()
    this.producer = this.kafkaClient.producer()
    await this.admin.createTopics({topics: events.map(event => ({topic: event.name}))});
    await this.producer.connect();
  }

  async getConsumer(event: ClassType<IntegrationEvent>, handler: IEventHandler): Promise<Consumer>{
    const consumerName = handler.constructor.name
    if (this.consumerMap.get(consumerName)) return this.consumerMap.get(consumerName)!;

    const consumer = this.kafkaClient.consumer({groupId: consumerName});
    consumer.subscribe({topic: event.name, fromBeginning: true})
    await consumer.connect()
    this.consumerMap.set(consumerName, consumer)
    return consumer
  }

  async publish(event: IntegrationEvent) {
    await this.producer.send({
      topic: event.constructor.name,
      messages: [{value: event.toString()}],
    })
  }

  async subscribe(event: ClassType<IntegrationEvent>, handler: IEventHandler) {
    this.subsManager.addSubscription(event, handler);
    const consumer = await this.getConsumer(event, handler);
    consumer.run({
      autoCommit: false,
      eachMessage: async (payload) => {
        try{
          const message = payload.message.value?.toString() ?? ''
          const data = new event(JSON.parse(message))
          const result = await handler.handle(data)
          console.log(payload.topic, handler.constructor.name)
          if(result.isOk()) await consumer.commitOffsets([
            {topic: payload.topic, partition: payload.partition, offset: payload.message.offset}
          ])
        }catch(e){}
      }
    })
  }

  async destroy() {
    await Promise.all([
      this.admin.disconnect(),
      this.producer.disconnect(),
      [...this.consumerMap].map(([consumer]) => this.consumerMap.get(consumer)?.disconnect())
    ]) 
  }
}
