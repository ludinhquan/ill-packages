import {DynamicModule, Module, OnModuleDestroy, Provider} from "@nestjs/common";
import {IntegrationEvent} from "src/events";
import {EventBusConfig, EventBusEnum, EventBusModuleAsyncOptions, IEventBus, KafkaOptions, RmqOptions} from "../intefaces";
import {EventBusOptionToken, EventBusToken} from "./event-bus.constants";
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
      useFactory: async (config: EventBusConfig) => {
        if (config.type === EventBusEnum.Kafka) {
          this.eventBus = new KafkaEventBus(config as KafkaOptions)
          return
        }
        this.eventBus = new RabbitMQEventBus(config as RmqOptions)
        return this.eventBus
      },
      inject: [EventBusOptionToken],
    }

    return {
      global: options.global,
      module: EventBusModule,
      imports: options.imports,
      providers: [customProvider, eventBusProvider],
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
