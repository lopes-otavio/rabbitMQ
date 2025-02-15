import amqp from "amqplib";

async function policiaFederalConsumer() {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();

		const queue = "policia.federal";
		await channel.assertQueue(queue, { durable: true });

		console.log("Polícia Federal: Aguardando notificações...");

		channel.consume(queue, (msg) => {
			if (msg !== null) {
				const notificacao = JSON.parse(msg.content.toString());
				console.log("Polícia Federal recebeu notificação:");
				console.log(JSON.stringify(notificacao, null, 2));
				channel.ack(msg);
			}
		});
	} catch (error) {
		console.error("Erro no consumidor da Polícia Federal:", error);
	}
}

policiaFederalConsumer();
