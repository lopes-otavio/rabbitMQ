import amqp from "amqplib";

async function receitaFederalConsumer() {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();

		const queue = "receita.federal";
		await channel.assertQueue(queue, { durable: true });

		console.log("Receita Federal: Aguardando notificações...");

		channel.consume(queue, (msg) => {
			if (msg !== null) {
				const notificacao = JSON.parse(msg.content.toString());
				console.log("Receita Federal recebeu notificação:");
				console.log(JSON.stringify(notificacao, null, 2));
				channel.ack(msg);
			}
		});
	} catch (error) {
		console.error("Erro no consumidor da Receita Federal:", error);
	}
}

receitaFederalConsumer();
