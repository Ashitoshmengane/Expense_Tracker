import incomeModel from "../models/incomeModel.js";
import expenseModel from "../models/expenseModel.js";

async function getReferenceDate(req, userId) {
    const requestedDate = req.query.date || req.body?.date;

    if (!requestedDate) {
        return getLatestTransactionDate(userId);
    }

    const parsedDate = new Date(requestedDate);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

async function getLatestTransactionDate(userId) {
    const [latestIncome, latestExpense] = await Promise.all([
        incomeModel.findOne({ userId }).sort({ date: -1 }).lean(),
        expenseModel.findOne({ userId }).sort({ date: -1 }).lean()
    ]);

    const latestDate = [latestIncome?.date, latestExpense?.date]
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0];

    return latestDate ? new Date(latestDate) : new Date();
}

async function getMonthlyTransactions(userId, referenceDate) {
    const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
    endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

    const [income, expense] = await Promise.all([
        incomeModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean(),
        expenseModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean()
    ]);

    return { income, expense };
}

export async function getDashboardOverview(req, res) {
    const userId = req.user._id;

    try {
        const referenceDate = await getReferenceDate(req, userId);
        let { income, expense } = await getMonthlyTransactions(userId, referenceDate);

        if (income.length === 0 && expense.length === 0) {
            const latestDate = await getLatestTransactionDate(userId);
            ({ income, expense } = await getMonthlyTransactions(userId, latestDate));
        }

        const monthlyIncome = income.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const monthlyExpense = expense.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        const recentTransactions = [
            ...income.map((item) => ({ ...item, type: "income" })),
            ...expense.map((item) => ({ ...item, type: "expense" })),
        ]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        const spendByCategory = {};
        for (const exp of expense) {
            const category = exp.category || "Other";
            spendByCategory[category] = (spendByCategory[category] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
            category,
            amount,
            percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        }));

        return res.status(200).json({
            success: true,
            data: {
                monthlyIncome,
                monthlyExpense,
                savings,
                savingsRate,
                recentTransactions,
                spendByCategory,
                expenseDistribution
            }
        });
    }
    catch (err) {
        console.error("GetDashboardOverview Error", err);
        return res.status(500).json({
            success: false,
            message: "Dashbaord Fetch failed!"
        });
    }
}
