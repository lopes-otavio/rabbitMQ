import amqp from "amqplib";

interface Transaction {
	codigo: number;
	cedente: string;
	pagador: string;
	valor: number;
	vencimento: string;
}

export async function notifyAuthorities(transaction: Transaction) {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();

		const exchange = "notificacoes.autoridades";
		await channel.assertExchange(exchange, "fanout", { durable: false });

		await channel.assertQueue("policia.federal", { durable: true });
		await channel.assertQueue("receita.federal", { durable: true });

		await channel.bindQueue("policia.federal", exchange, "");
		await channel.bindQueue("receita.federal", exchange, "");

		const message = {
			tipo: "transacao_suspeita",
			dados: transaction,
		};

		channel.publish(exchange, "", Buffer.from(JSON.stringify(message)));

		console.log(
			`Notificação enviada para as autoridades: Transação ${transaction.codigo}`
		);

		setTimeout(() => {
			connection.close();
		}, 500);
	} catch (error) {
		console.error("Erro ao notificar autoridades:", error);
	}
}
