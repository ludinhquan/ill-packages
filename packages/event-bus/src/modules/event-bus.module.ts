import {DynamicModule, Module, OnModuleDestroy, Provider} from "@nestjs/common";
import {IntegrationEvent} from "src/events";
import {EventBusConfig, EventBusEnum, EventBusModuleAsyncOptions, IEventBus, IEventBusSubscriptionsManager, KafkaOptions, RmqOptions} from "../intefaces";
import {EventBusOptionToken, EventBusToken} from "./event-bus.constants";
import {EventBusSubscriptionsManager} from "./event-bus.subscriptions-manager";
import {KafkaEventBus} from "./kafka";
import {RabbitMQEventBus} from "./rabbitmq";
 
@Module({})
export class EventBusModule implements OnModuleDestroy {
  private static eventBus: IEventBus

  static forRoot(options: EventBusModuleAsyncOptions): DynamicModule {
    const customProvider: Provider = {
      provide: EventBusOptionToken,
      useFactory: options.useFactory,
      inject: options.inject
    }

    const eventBusProvider: Provider = {
      provide: EventBusToken,
      useFactory: async (config: EventBusConfig, subsManager: IEventBusSubscriptionsManager) => {
        if (config.type === EventBusEnum.Kafka) {
          this.eventBus = new KafkaEventBus(config as KafkaOptions, subsManager)
          return
        }
        this.eventBus = new RabbitMQEventBus(config as RmqOptions, subsManager)
        return this.eventBus
      },
      inject: [EventBusOptionToken, EventBusSubscriptionsManager],
    }

    return {
      global: options.global,
      module: EventBusModule,
      imports: options.imports,
      providers: [customProvider, eventBusProvider, EventBusSubscriptionsManager],
      exports: [EventBusToken],
    }
  }

  static async register(events: ClassType<IntegrationEvent>[]): Promise<DynamicModule> {
    await EventBusModule.eventBus.register(events)
    return {
      module: EventBusModule,
    }
  }

  async onModuleDestroy() {
    await EventBusModule.eventBus.destroy()
  }
}
