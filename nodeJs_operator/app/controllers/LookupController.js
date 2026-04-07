
const Order = require("../models/order");

const Customer = require("../models/customer");

const StatusCode = require("../utils/StatusCode");

class LookupController {
  async allCustomersByOrders(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customerDetails",
          },
        },
        {
          $unwind: "$customerDetails",
        },
        {
          $group: {
            _id: "$customerDetails._id",
            name: { $first: "$customerDetails.name" },
            email: { $first: "$customerDetails.email" },
            city: { $first: "$customerDetails.city" },
            totalCustomers: { $sum: 1 },
            orders: {
              $push: {
                _id: "$_id",
                totalAmount: "$totalAmount",
                status: "$status",
                createdAt: "$createdAt",
              },
            },
          },
        },
        {
          $sort: { totalCustomers: -1 },
        },
      ];

      const aggblog = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "All Customers with their orders",
        totalCustomers: aggblog.length,
        data: aggblog,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  //Get all orders with user details (name, email).
  async getOrdersWithCustomers(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            status: 1,
            createdAt: 1,
            "customer.name": 1,
            "customer.email": 1,
          },
        },
      ];

      const orders = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Orders with customer details",
        totalOrders: orders.length,
        data: orders,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async CustomerWithOneOrders(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customerId",
            as: "orders",
          },
        },
        {
          $match: {
            orders: { $ne: [] },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalOrders: { $size: "$orders" },
          },
        },
      ];

      const customers = await Customer.aggregate(lookupQuery);

      return res.status(200).json({
        message: "Customers with at least one order",
        totalCustomers: customers.length,
        data: customers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async CustomerWithoutOrders(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customerId",
            as: "orders",
          },
        },
        {
          $match: {
            orders: { $eq: [] },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
          },
        },
      ];

      const customers = await Customer.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Customers with no orders",
        totalCustomers: customers.length,
        data: customers,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOrdersWithPaymentStatus(req, res) {

    try {

        const lookupQuery = [
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "orderId",
              as: "payment",
            },
          },
          {
            $unwind: {
              path: "$payment",
            },
          },
          {
            $project: {
              _id: 1,
              totalAmount: 1,
              status: 1,
              createdAt: 1,
              paymentStatus: "$payment.status",
            },
          },
        ];

        const orders = await Order.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
          message: "Orders with payment status",
          totalorders: orders.length,
          data: orders,
        });

    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
    }
  }

  async customerWithLatestOrder(req, res) {

    try {

        const lookupQuery = [
          {
            $lookup: {
              from: "orders",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$customerId", "$$userId"] },
                  },
                },
                {
                  $sort: { createdAt: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              as: "latestOrder",
            },
          },
          {
            $unwind: {
              path: "$latestOrder",
            },
          },
          {
            $project: {
              name: 1,
              email: 1,
              latestOrder: {
                _id: "$latestOrder._id",
                totalAmount: "$latestOrder.totalAmount",
                status: "$latestOrder.status",
                createdAt: "$latestOrder.createdAt",
              },
            },
          },
        ];

        const users = await Customer.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
          message: "Users with latest orders",
          totalCustomers: users.length,
          data: users,
        });

    } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
  }
}

module.exports = new LookupController();