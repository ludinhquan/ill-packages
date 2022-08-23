import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {EventBusEnum} from "src/intefaces";
import {EventBusModule} from "./event-bus.module";

@Module({
  imports: [
    EventBusModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const EVENT_BROKER_TYPE = configService.get('EVENT_BROKER_TYPE');
        if (EVENT_BROKER_TYPE === EventBusEnum.Kafka)
          return {
            type: EventBusEnum.Kafka,
            options: {
              brokers: [configService.getOrThrow('KAFKA_BROKERS')],
            }
          }
        return {
          type: EventBusEnum.RabbitMQ,
          options: configService.getOrThrow('HOST_AMQP')
        }
      },
      inject: [ConfigService],
      imports: [ConfigModule]
    })
  ]
})
export class TestModule {}
