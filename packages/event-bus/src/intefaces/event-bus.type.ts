import {ModuleMetadata} from "@nestjs/common";
import {Options} from "amqplib";
import {KafkaConfig} from 'kafkajs';
import {IntegrationEvent} from '../events';

export enum EventBusEnum {
  Kafka = 'KAFKA',
  RabbitMQ = 'RABBITMQ',
}

export declare type EventBusConfig = KafkaOptions | RmqOptions

export interface KafkaOptions {
  type: EventBusEnum.Kafka,
  options: KafkaConfig,
}

export interface RmqOptions {
  type: EventBusEnum.RabbitMQ,
  options: string | Options.Connect
}

export interface EventBusRegisterEvents {
  events?: ClassType<IntegrationEvent>[];
}

export interface EventBusModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean,
  inject?: any[]
  useFactory: (...args: any[]) => EventBusConfig,
}
