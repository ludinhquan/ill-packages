import {Options} from "amqplib";
import {KafkaConfig} from 'kafkajs';
import {IntegrationEvent} from '../events';

export enum EventBusEnum {
  Kafka = 'KAFKA',
  RabbitMQ = 'RABBITMQ',
}

export declare type EventBusConfig = KafkaOptions | RmqOptions

export interface KafkaOptions extends EventBusEvents {
  type: EventBusEnum.Kafka,
  options: KafkaConfig,
}

export interface RmqOptions extends EventBusEvents {
  application: string,
  type: EventBusEnum.RabbitMQ,
  options: Options.Connect
}

export const EventBusToken = Symbol('EventBus')

export interface EventBusEvents {
  events?: ClassType<IntegrationEvent>[];
}
