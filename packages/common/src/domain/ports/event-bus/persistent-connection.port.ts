export interface IPersistentConnection{
  isConnected(): boolean
  tryConnect(): Promise<void>
}

export interface IProducerPersistentConnection<Producer> extends IPersistentConnection {
  getProducer(): Producer
}

export interface IConsumerPersistentConnection<Consumer> extends IPersistentConnection {
  getConsumer(): Consumer
}
