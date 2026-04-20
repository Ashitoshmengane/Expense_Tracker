import incomeModel from "../models/incomeModel.js";
import XLSX from 'xlsx'
import getDateRange from "../utils/dateFilter.js";



// add income 
export async function addIncome(req, res) {
    const userId = req.user._id
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are REQUIRED!"
            });

        }
        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        });
        await newIncome.save()
        res.json({
            success: true,
            message: "Income Added SUCCESSFULLY"
        });


    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }
}


// to get all the income 
export async function getAllIncome(req, res) {
    const userId = req.user._id
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        res.json(income)

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }
}


// updating income
export async function updatedIncome(req, res) {
    const { id } = req.params;

    const userId = req.user._id
    const { description, amount, category, date } = req.body;
    try {
        const updatedIncome = await incomeModel.findOneAndUpdate({
            _id: id, userId
        },
            {
                description,
                amount,
                category,
                ...(date ? { date: new Date(date) } : {}),
            },
            {
                new: true
            });
        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found."
            })
        }

        res.json({
            success: true,
            message: "Income updated successfully.", data:
                updatedIncome

        })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }
}


// to delete an income 
export async function deleteIncome(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.findOneAndDelete({
            _id: req.params.id,
            userId
        });
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income Not found"
            })

        }

        return res.json({
            success: true,
            message: "income deleted successfully"
        })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }

}


// to download the data in an excel sheet

export async function downloadIncomeExcel(req, res) {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: - 1 });
        const plaindata = income.map((inc) => ({
            Description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(plaindata);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
        XLSX.writeFile(workbook, "income_details.xlsx")
        res.download("income_details.xlsx")

    }

    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }
}

// to get income overview
export async function getIncomeoverview(req, res) {
    try {

        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);
        const income = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 });

        const totalIncome = income.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = income.length > 0 ? totalIncome / income.length : 0;
        const numberOfTransactions = income.length;
        const recentTransactions = income.slice(0, 9);

        res.json({
            success : true,
            data : {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })
    } 
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }
}
