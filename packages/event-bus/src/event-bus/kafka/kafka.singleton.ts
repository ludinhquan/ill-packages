import {Kafka, KafkaConfig} from "kafkajs";

export class KafkaSingleton {
  private static kafka: Kafka
  private constructor(){}

  static getInstance(config: KafkaConfig){
    if(!this.kafka) this.kafka = new Kafka(config);
    return this.kafka
  }
}
