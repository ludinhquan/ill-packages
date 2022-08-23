import {DynamicModule, Module, OnModuleDestroy, Provider} from "@nestjs/common";
import {EventBusConfig, EventBusEnum, EventBusModuleAsyncOptions, IEventBus, IEventBusSubscriptionsManager, KafkaOptions, RmqOptions} from "../intefaces";
import {EventBusOptionToken, EventBusToken} from "./event-bus.constants";
import {EventBusSubscriptionsManager} from "./event-bus.subscriptions-manager";
import {KafkaEventBus} from "./kafka";
import {RabbitMQEventBus} from "./rabbitmq";
 
@Module({})
export class EventBusModule implements OnModuleDestroy {
  private static eventBus: IEventBus

  static registerAsync(options: EventBusModuleAsyncOptions): DynamicModule {
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

  // static register(): DynamicModule {
  // }

  async onModuleDestroy() {
    await EventBusModule.eventBus.destroy()
  }
}
