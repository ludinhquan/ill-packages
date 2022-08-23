import {DynamicModule, Module, OnModuleDestroy, Provider} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {EventBusConfig, EventBusEnum, EventBusToken, IEventBus, IEventBusSubscriptionsManager, KafkaOptions, RmqOptions} from "../types";
import {EventBusSubscriptionsManager} from "./event-bus.subscriptions-manager";
import {KafkaEventBus} from "./kafka";
import {RabbitMQEventBus} from "./rabbitmq";

@Module({})
export class EventBusModule implements OnModuleDestroy {
  private static eventBus: IEventBus

  static register(config: EventBusConfig): DynamicModule {
    const eventBusFactory: Provider = {
      provide: EventBusToken,
      useFactory: async (subsManager: IEventBusSubscriptionsManager) => {
        if(config.type === EventBusEnum.Kafka)
          this.eventBus = new KafkaEventBus(config as KafkaOptions, subsManager)
        if(config.type === EventBusEnum.RabbitMQ)
          this.eventBus = new RabbitMQEventBus(config as RmqOptions, subsManager)
      },
      inject: [EventBusSubscriptionsManager],
    }

    return {
      global: true,
      module: EventBusModule,
      imports: [ConfigModule],
      providers: [eventBusFactory, EventBusSubscriptionsManager],
      exports: [eventBusFactory, EventBusSubscriptionsManager],
    }
  }

  async onModuleDestroy() {
    await EventBusModule.eventBus.destroy()
  }
}
