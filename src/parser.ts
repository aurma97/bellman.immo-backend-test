import { TAccountWithRecordItems, TParsingResult, TRecordItem } from "./types";
import * as csv from "csvtojson";
import { formatDate, formatNumber, getLabel } from "./utils";

export const parse = async (inputCSVFile: string): Promise<TParsingResult> => {
	const map: Map<string, TAccountWithRecordItems> = new Map();
	const data = await csv({
		delimiter: ",",
	}).fromFile(inputCSVFile);

	let acc = [],
		recordItems: TRecordItem[] = [];

	const accountsRaw = data
		.filter((item) => item["Compte"])
		.filter((item) => item["Compte"] !== "Compte")
		.filter((item) => Number(item["page"]))
		.filter((item) => !item["Solde"].startsWith("Page"))
		.filter((item) => item["Libellé"] !== "Edition du Grand Livre");

	accountsRaw.forEach((currentItem, i) => {
		if (formatDate(currentItem["Compte"]).toString() !== "Invalid Date") {
			recordItems.push({
				label: getLabel(data, i++, currentItem["Libellé"]),
				debit: formatNumber(currentItem["Débit"]),
				credit: formatNumber(currentItem["Crédit"]),
				date: formatDate(currentItem["Compte"]),
				invoiceNumber: undefined,
			});
		} else {
			if (acc) {
				const accountByCode = accountsRaw.filter(
					(item) => item["Compte"] === currentItem["Compte"],
				);

				if (map.has(currentItem["Compte"]) && recordItems.length) {
					map.set(currentItem["Compte"], {
						...map.get(currentItem["Compte"]),
						recordItems: map
							.get(currentItem["Compte"])
							.recordItems.concat(recordItems),
					});
				} else {
					map.set(currentItem["Compte"], {
						code: currentItem["Compte"],
						label: acc["Libellé"],
						totalDebit: formatNumber(
							accountByCode[accountByCode.length - 1]["Débit"],
						),

						totalCredit: formatNumber(
							accountByCode[accountByCode.length - 1]["Crédit"],
						),

						recordItems,
					});
				}

				recordItems = [];
			}
			acc = currentItem;
		}
	});

	const accounts: TAccountWithRecordItems[] = Array.from(map.values()).filter(
		(item) => item.code !== "Compte",
	);

	const summary = data.find(
		(item) => item["Libellé"] === "Total général de la Société",
	);

	return {
		records: [],
		accounts,
		balance: {
			totalDebit: formatNumber(summary["Débit"]),
			totalCredit: formatNumber(summary["Crédit"]),
		},
	};
};
