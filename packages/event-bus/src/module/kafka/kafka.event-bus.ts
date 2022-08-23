import {Admin, Consumer, Kafka, Producer} from "kafkajs";
import {IEventHandler, IntegrationEvent} from "../../events";
import {IEventBus, IEventBusSubscriptionsManager, KafkaOptions} from "../../types";
import {KafkaSingleton} from "./kafka.singleton";

export class KafkaEventBus implements IEventBus {
  private client: Kafka

  private admin: Admin
  private producer: Producer
  private consumerMap: Map<string, Consumer> = new Map()

  constructor(
    private config: KafkaOptions,
    private subsManager: IEventBusSubscriptionsManager,
  ) {
    this.client = KafkaSingleton.getInstance(this.config.options)
    this.setup(config)
  }

  private async setup(config: KafkaOptions){
    const {events = []} = config
    this.admin = this.client.admin()
    this.producer = this.client.producer()
    this.admin.createTopics({topics: events.map(item => ({topic: item.name}))})
    await this.producer.connect();
  }

  private async getConsumer(event: ClassType<IntegrationEvent>, handler: IEventHandler): Promise<Consumer>{
    const consumerName = handler.constructor.name
    if (this.consumerMap.get(consumerName)) return this.consumerMap.get(consumerName)!;
    const consumer = this.client.consumer({groupId: consumerName});
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
