import amqp from "amqplib";
import fs from "fs";
import { parse } from "csv-parse";

interface Transaction {
	codigo: number;
	cedente: string;
	pagador: string;
	valor: number;
	vencimento: string;
}

async function producer() {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();

		const queue = "transacoes.financeiras";
		await channel.assertQueue(queue, { durable: true });

		fs.createReadStream("transacoes.csv")
			.pipe(
				parse({
					columns: true,
					cast: (value, context) => {
						if (context.column === "codigo") {
							return parseInt(value);
						}
						if (context.column === "valor") {
							return parseFloat(value);
						}
						return value;
					},
				})
			)
			.on("data", async (row: Transaction) => {
				console.log("row", row);
				channel.sendToQueue(queue, Buffer.from(JSON.stringify(row)), {
					persistent: true,
				});
				console.log(`Transação enviada: Código ${row.codigo}`);
			})
			.on("end", () => {
				console.log("Todas as transações foram enviadas");
				setTimeout(() => {
					connection.close();
					process.exit(0);
				}, 500);
			});
	} catch (error) {
		console.error("Erro:", error);
	}
}

producer();
