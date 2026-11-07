/** Scenario inputs, not provider quotations. All amounts in BRL; no network calls. */
const args = Object.fromEntries(process.argv.slice(2).map(value => value.replace(/^--/, "").split("=")));
function value(key: string, fallback: number) { const n = Number(args[key] ?? fallback); if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${key}`); return n; }
const price = value("price", 49.9), fees = value("fees", 0), taxRate = value("tax-rate", 0);
const storageGB = value("storage-gb", .01), storageRate = value("storage-rate", 1);
const bandwidthGB = value("bandwidth-gb", .1), bandwidthRate = value("bandwidth-rate", 1);
const supportMinutes = value("support-minutes", 1), hourly = value("support-hourly", 60);
const infrastructure = value("infra-monthly", .1);
const monthly = storageGB * storageRate + bandwidthGB * bandwidthRate + supportMinutes / 60 * hourly + infrastructure;
const net = price * (1 - taxRate / 100) - fees;
console.log("CENÁRIO ILUSTRATIVO — substitua por métricas e custos reais. Não inclui inflação, câmbio ou crescimento do uso.");
console.table([12, 36, 60, 120].map(months => ({ months, netRevenue: net.toFixed(2), monthlyCost: monthly.toFixed(2), totalCost: (monthly * months).toFixed(2), contribution: (net - monthly * months).toFixed(2) })));
console.log(`Meses até consumir a receita líquida: ${monthly ? Math.max(0, net / monthly).toFixed(1) : "não calculável (custo zero)"}`);
