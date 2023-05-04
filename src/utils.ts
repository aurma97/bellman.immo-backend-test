export const formatDate = (date: string) => {
	const dateParts: number[] = date.split("/").map((item) => +item);
	return new Date(dateParts[2], dateParts[1] - 1, +dateParts[0]);
};

export const formatNumber = (strNumber: string) => {
	return parseFloat(strNumber.replace(/\s/g, "")) || 0;
};

export const getLabel = (
	data: Record<string, string>[],
	index: number,
	currentLabel: string,
) => {
	return data[index] && !data[index]["Compte"]
		? currentLabel + " " + data[index]["Libellé"]
		: currentLabel;
};
