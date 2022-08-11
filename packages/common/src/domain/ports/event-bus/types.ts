import {Type} from "@type"
import { IntegrationEvent } from "@domain"

export enum EventBrokerType {
  Kafka = 'KAFKA',
  RabbitMQ = 'RABBITMQ'
} 

export const EVENT_BUS: symbol = Symbol('EVENT_BUS')

export enum Subjects {
  DataReceived = 'data:received'
}


export interface EventBusOptions {
  events: Type<IntegrationEvent>[],
}
