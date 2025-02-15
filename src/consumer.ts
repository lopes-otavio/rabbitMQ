import amqp from "amqplib";
import { notifyAuthorities } from "./notifier";

interface Transaction {
	codigo: number;
	cedente: string;
	pagador: string;
	valor: number;
	vencimento: string;
}

const NOTIFICATION_THRESHOLD = 40000;

async function consumer() {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();

		const queue = "transacoes.financeiras";
		await channel.assertQueue(queue, { durable: true });

		channel.prefetch(1);

		console.log("Aguardando transações financeiras...");

		channel.consume(queue, async (msg) => {
			if (msg !== null) {
				const transacao: Transaction = JSON.parse(msg.content.toString());
				console.log("Recebendo transação:");
				console.log("transacao", transacao);

				if (transacao.valor >= NOTIFICATION_THRESHOLD) {
					console.log(
						`Transação de alto valor detectada. Notificando autoridades...`
					);
					await notifyAuthorities(transacao);
				}

				await new Promise((resolve) => setTimeout(resolve, 1000));

				console.log(`Transação ${transacao.codigo} processada com sucesso!`);
				console.log(`-------------------------------------------------------`);

				channel.ack(msg);
			}
		});
	} catch (error) {
		console.error("Erro:", error);
	}
}

consumer();
