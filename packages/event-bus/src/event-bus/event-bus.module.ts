import {DynamicModule, Module, OnModuleDestroy, Provider} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {EventBrokerType, EventBusOptions, EVENT_BUS, IEventBus, IEventBusSubscriptionsManager} from "@type";
import {EventBusSubscriptionsManager} from "./event-bus.subscriptions-manager";
import {KafkaEventBus, KafkaSingleton} from "./kafka";
import {RabbitMQEventBus, RabbitMQSingleton} from "./rabbitmq";

@Module({})
export class EventBusModule implements OnModuleDestroy {
  private static eventBus: IEventBus

  static register(options: EventBusOptions): DynamicModule {
    const eventBusFactory: Provider = {
      provide: EVENT_BUS,
      useFactory: async (configService: ConfigService, subsManager: IEventBusSubscriptionsManager) => {
        const brokerType = configService.get('EVENT_BROKER_TYPE')
        const application = configService.get('APPLICATION')
        const eventBus = brokerType === EventBrokerType.Kafka
          ? await this.getKafkaEventBus(configService, subsManager, options, application)
          : await this.getRabbitMQEventBus(configService, subsManager, options, application)
        this.eventBus = eventBus
        return this.eventBus
      },
      inject: [ConfigService, EventBusSubscriptionsManager],
    }

    return {
      global: true,
      module: EventBusModule,
      imports: [ConfigModule],
      providers: [eventBusFactory, EventBusSubscriptionsManager],
      exports: [eventBusFactory, EventBusSubscriptionsManager],
    }
  }

  private static async getKafkaEventBus(
    config: ConfigService,
    subsManager: IEventBusSubscriptionsManager,
    options: EventBusOptions,
    application: string
  ): Promise<IEventBus> {
    const brokers = config.get('KAFKA_BROKERS').split(',')
    const kafkaConfig = {brokers}
    const kafkaClient = KafkaSingleton.getInstance(kafkaConfig);
    return new KafkaEventBus(kafkaClient, subsManager, options, application);
  }

  private static async getRabbitMQEventBus(
    config: ConfigService,
    subsManager: IEventBusSubscriptionsManager,
    options: EventBusOptions,
    application: string
  ): Promise<IEventBus> {
    const connectOptions = config.get('RABBITMQ_URI')
    const connection = await RabbitMQSingleton.getInstance(connectOptions)
    return new RabbitMQEventBus(connection, subsManager, options, application);
  }

  async onModuleDestroy() {
    await EventBusModule.eventBus.destroy()
  }
}
