import { IntegrationEvent } from '../events';

export enum EventBrokerType {
  Kafka = 'KAFKA',
  RabbitMQ = 'RABBITMQ',
}

export const EVENT_BUS = 'EVENT_BUS'

export enum Subjects {
  DataReceived = 'data:received',
}

export interface EventBusOptions {
  events?: ClassType<IntegrationEvent>[];
}
