
const Order = require("../models/order");

const OrderItem = require("../models/orderItem");

const Customer = require("../models/customer");

const Inventory = require("../models/inventory");

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

  //Fetch orders along with their order items
  async ordersWithOrderItems(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "orderitems", // collection name
            localField: "_id",
            foreignField: "orderId",
            as: "items",
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            status: 1,
            createdAt: 1,
            items: 1, // full items array
          },
        },
      ];

      const orders = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Orders with items",
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

  async getOrderDetailsWithProductInfo(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "orderitems",
            let: { orderId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$orderId", "$$orderId"] },
                },
              },
              {
                $lookup: {
                  from: "inventories",
                  localField: "inventoryId",
                  foreignField: "_id",
                  as: "inventory",
                },
              },
              {
                $unwind: {
                  path: "$inventory",
                  preserveNullAndEmptyArrays: true, // ✅ keep item even if product missing
                },
              },
              {
                $project: {
                  _id: 1,
                  quantity: 1,
                  price: 1,
                  inventory: {
                    name: "$inventory.name",
                    category: "$inventory.category",
                    stock: "$inventory.stock",
                    price: "$inventory.price",
                  },
                },
              },
            ],
            as: "items",
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            status: 1,
            createdAt: 1,
            items: 1,
          },
        },
      ];

      const orders = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Orders with inventory details",
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

  // get full order summary
  async getFullOrderSummary(req, res) {
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
            preserveNullAndEmptyArrays: true,
          },
        },

        // 💳 Payment details
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
            preserveNullAndEmptyArrays: true,
          },
        },

        // 📦 Items + Inventory
        {
          $lookup: {
            from: "orderitems",
            let: { orderId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$orderId", "$$orderId"] },
                },
              },
              {
                $lookup: {
                  from: "inventory",
                  localField: "inventoryId", // or inventoryId
                  foreignField: "_id",
                  as: "inventory",
                },
              },
              {
                $unwind: {
                  path: "$inventory",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  quantity: 1,
                  price: 1,
                  subtotal: { $multiply: ["$quantity", "$price"] }, // ✅ per item total
                  inventory: {
                    name: "$inventory.name",
                    category: "$inventory.category",
                  },
                },
              },
            ],
            as: "items",
          },
        },

        // 🧮 Order-level calculations
        {
          $addFields: {
            itemCount: { $size: "$items" },
            totalCalculatedAmount: {
              $sum: "$items.subtotal",
            },
            paymentStatus: {
              $ifNull: ["$payment.status", "pending"],
            },
          },
        },

        // 🎯 Final shape
        {
          $project: {
            _id: 1,
            createdAt: 1,
            status: 1,

            totalAmount: 1,
            totalCalculatedAmount: 1,

            itemCount: 1,
            paymentStatus: 1,

            customer: {
              name: "$customer.name",
              email: "$customer.email",
            },

            items: 1,
          },
        },

        // 🔽 Latest orders first
        {
          $sort: { createdAt: -1 },
        },
      ];

      const orders = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Full order summary fetched successfully",
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

  async getOrdersWithoutPaymentStatus(req, res) {
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
            preserveNullAndEmptyArrays: true, // ✅ important
          },
        },
        {
          $match: {
            $or: [
              { "payment.status": { $ne: "completed" } },
              { payment: null }, // no payment exists
            ],
          },
        },
        {
          $project: {
            _id: 1,
            totalAmount: 1,
            status: 1,
            createdAt: 1,
            paymentStatus: {
              $ifNull: ["$payment.status", "pending"],
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      const orders = await Order.aggregate(pipeline);

      return res.status(StatusCode.SUCCESS).json({
        message: "Unpaid / incomplete payment orders",
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

  async getTotalRevenueFromOrders(req, res) {
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
            preserveNullAndEmptyArrays: false, // only orders with payment
          },
        },
        {
          $match: {
            "payment.status": "completed", // ✅ only successful payments
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      const totalRevenue = result[0]?.totalRevenue || 0;

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Actual revenue (paid orders only)",
        totalRevenue,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOrderCountPerCustomer(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: "$customerId",
            totalOrders: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            customerId: "$_id",
            totalOrders: 1,
            customer: {
              name: "$customer.name",
              email: "$customer.email",
            },
          },
        },
        {
          $sort: { totalOrders: -1 }, // top customers first
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Total orders per user",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAvgOrderValueByCustomer(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: "$customerId",
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
        {
          $addFields: {
            avgOrderValue: {
              $divide: ["$totalSpent", "$totalOrders"],
            },
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Average order value per user",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMaximumOrderAmount(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: null,
            maxOrderAmount: { $max: "$totalAmount" },
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      const maxOrderAmount = result[0]?.maxOrderAmount || 0;

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Maximum order amount",
        maxOrderAmount,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOrderCountByStatus(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: "$status", // group by order status
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 }, // optional: highest first
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Order count grouped by status",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMonthlyRevenue(req, res) {
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
          $unwind: "$payment",
        },
        {
          $match: {
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Monthly revenue",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async topFiveUsersBySpending(req, res) {
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
          $unwind: "$payment",
        },
        {
          $match: {
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: "$customerId",
            totalSpent: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: { totalSpent: -1 },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            customerId: "$_id",
            totalSpent: 1,
            customer: {
              name: "$customer.name",
              email: "$customer.email",
            },
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Top 5 users by spending",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async GetProductSoldPerCategory(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "inventory",
            localField: "inventoryId", // or inventoryId
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },

        // 📊 Group by category
        {
          $group: {
            _id: "$product.category",
            totalSold: { $sum: "$quantity" }, // ✅ total quantity sold
          },
        },
        // 🎯 Clean output
        {
          $project: {
            category: "$_id",
            totalSold: 1,
            _id: 0,
          },
        },

        // 🔽 Highest selling categories first
        {
          $sort: { totalSold: -1 },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Products sold per category",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async findDuplicateCustomers(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: { $toLower: "$email" }, // ✅ case-insensitive
            count: { $sum: 1 },
            customers: { $push: "$_id" },
          },
        },
        {
          $match: {
            count: { $gt: 1 }, // only duplicates
          },
        },
        {
          $project: {
            email: "$_id",
            count: 1,
            customers: 1,
            _id: 0,
          },
        },
      ];

      const result = await Customer.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Duplicate customers found",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTotalQuantitySoldPerProduct(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: "$inventoryId", // or inventoryId (based on your schema)
            totalSold: { $sum: "$quantity" },
          },
        },
        {
          $lookup: {
            from: "inventory",
            localField: "_id",
            foreignField: "_id",
            as: "inventory",
          },
        },
        {
          $unwind: {
            path: "$inventory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            inventoryId: "$_id",
            totalSold: 1,
            inventory: {
              name: "$inventory.name",
              category: "$inventory.category",
              price: "$inventory.price",
              stock: "$inventory.stock",
            },
            _id: 0,
          },
        },
        {
          $sort: { totalSold: -1 }, // top-selling inventory first
        },
      ];

      const result = await OrderItem.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Total quantity sold per inventory item",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCustomerTotalSpending(req, res) {
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
          $addFields: {
            totalSpent: {
              $sum: "$orders.totalAmount",
            },
            totalOrders: {
              $size: "$orders",
            },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalOrders: 1,
            totalSpent: 1,
          },
        },
        {
          $sort: { totalSpent: -1 }, // highest spenders first
        },
      ];

      const result = await Customer.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Total spending per customer",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getHighValueCustomers(req, res) {
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
          $addFields: {
            totalSpent: { $sum: "$orders.totalAmount" },
            totalOrders: { $size: "$orders" },
          },
        },
        {
          $match: {
            totalSpent: { $gt: 50000 }, // ✅ filter here
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalOrders: 1,
            totalSpent: 1,
          },
        },
        {
          $sort: { totalSpent: -1 },
        },
      ];

      const result = await Customer.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customers who spent more than ₹50,000",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTopSellingInventories(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: "$inventoryId", // inventoryId if you renamed it
            totalSold: { $sum: "$quantity" },
          },
        },
        {
          $sort: { totalSold: -1 }, // highest selling first
        },
        {
          $limit: 10, // top 10 inventories
        },
        {
          $lookup: {
            from: "inventory",
            localField: "_id",
            foreignField: "_id",
            as: "inventory",
          },
        },
        {
          $unwind: {
            path: "$inventory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            inventoryId: "$_id",
            totalSold: 1,
            inventory: {
              name: "$inventory.name",
              category: "$inventory.category",
              price: "$inventory.price",
              stock: "$inventory.stock",
            },
            _id: 0,
          },
        },
      ];

      const result = await OrderItem.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Top selling inventories",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async avgOrderValuePerCategory(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "inventory",
            localField: "productId",
            foreignField: "_id",
            as: "inventory",
          },
        },
        { $unwind: "$inventory" },

        // Calculate item revenue
        {
          $addFields: {
            itemTotal: { $multiply: ["$quantity", "$price"] },
          },
        },

        // Group by order + category
        {
          $group: {
            _id: {
              orderId: "$orderId",
              category: "$inventory.category",
            },
            orderCategoryTotal: { $sum: "$itemTotal" },
          },
        },
        // Group by category
        {
          $group: {
            _id: "$_id.category",
            totalRevenue: { $sum: "$orderCategoryTotal" },
            totalOrders: { $sum: 1 },
          },
        },

        // Calculate AOV
        {
          $addFields: {
            avgOrderValue: {
              $divide: ["$totalRevenue", "$totalOrders"],
            },
          },
        },
        {
          $project: {
            category: "$_id",
            totalRevenue: 1,
            totalOrders: 1,
            avgOrderValue: 1,
            _id: 0,
          },
        },

        { $sort: { avgOrderValue: -1 } },
      ];

      const result = await OrderItem.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Average order value per category",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async totalRevenuePerCustomerWithDetails(params) {
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
          $addFields: {
            totalRevenue: { $sum: "$orders.totalAmount" },
            totalOrders: { $size: "$orders" },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalOrders: 1,
            totalRevenue: 1,
          },
        },
        {
          $sort: { totalRevenue: -1 }, // highest revenue customers first
        },
      ];

      const result = await Customer.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Average order value per category",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getFrequentCustomers(req, res) {
    try {
      const lookupQuery = [
        {
          $group: {
            _id: "$customerId",
            totalOrders: { $sum: 1 },
          },
        },
        {
          $match: {
            totalOrders: { $gt: 3 }, // ✅ more than 3 orders
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            customerId: "$_id",
            totalOrders: 1,
            customer: {
              name: "$customer.name",
              email: "$customer.email",
            },
            _id: 0,
          },
        },
        {
          $sort: { totalOrders: -1 },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Customers with more than 3 orders",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDailyRevenueReport(req, res) {
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
          $unwind: "$payment",
        },
        {
          $match: {
            "payment.status": "completed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Daily revenue (paid orders only)",
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async allTotalPaymentAmount(req, res) {
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
          $unwind: "$payment",
        },
        {
          $match: {
            "payment.status": "completed", // ✅ only paid
          },
        },
        {
          $group: {
            _id: null,
            totalPaidAmount: { $sum: "$totalAmount" },
            totalPaidOrders: { $sum: 1 },
          },
        },
      ];

      const data = result[0] || { totalPaidAmount: 0, totalPaidOrders: 0 };

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Total paid amount",
        data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProductNeverOrdered(req, res) {
    try {
      const lookupQuery = [
        {
          $lookup: {
            from: "orderitems",
            localField: "_id",
            foreignField: "productId", // or inventoryId
            as: "orders",
          },
        },
        {
          $match: {
            orders: { $eq: [] }, // ✅ no orders found
          },
        },
        {
          $project: {
            name: 1,
            sku: 1,
            stock: 1,
          },
        },
      ];

      const result = await Inventory.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "Inventories never ordered",
        total: result.length,
        data: result,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDashboardStats(req, res) {
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
          $unwind: "$payment",
        },
        {
          $match: {
            "payment.status": "completed", // ✅ only paid orders
          },
        },

        {
          $facet: {
            // 👤 total users
            totalUsers: [
              {
                $lookup: {
                  from: "customers",
                  localField: "customerId",
                  foreignField: "_id",
                  as: "customer",
                },
              },
              { $unwind: "$customer" },
              {
                $group: {
                  _id: "$customer._id",
                },
              },
              {
                $count: "count",
              },
            ],

            // 📦 total orders
            totalOrders: [
              {
                $count: "count",
              },
            ],

            // 💰 total revenue
            totalRevenue: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$totalAmount" },
                },
              },
            ],

            // 🏆 top user
            topUser: [
              {
                $group: {
                  _id: "$customerId",
                  totalSpent: { $sum: "$totalAmount" },
                },
              },
              {
                $sort: { totalSpent: -1 },
              },
              {
                $limit: 1,
              },
              {
                $lookup: {
                  from: "customers",
                  localField: "_id",
                  foreignField: "_id",
                  as: "customer",
                },
              },
              { $unwind: "$customer" },
              {
                $project: {
                  _id: 0,
                  customerId: "$_id",
                  totalSpent: 1,
                  name: "$customer.name",
                  email: "$customer.email",
                },
              },
            ],
          },
        },

        // 🧾 Clean response format
        {
          $project: {
            totalUsers: { $arrayElemAt: ["$totalUsers.count", 0] },
            totalOrders: { $arrayElemAt: ["$totalOrders.count", 0] },
            totalRevenue: { $arrayElemAt: ["$totalRevenue.total", 0] },
            topUser: { $arrayElemAt: ["$topUser", 0] },
          },
        },
      ];

      const result = await Order.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Dashboard stats",
        data: result[0] || {},
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new LookupController();