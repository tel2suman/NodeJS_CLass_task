
const Order = require("../models/order");

const StatusCode = require("../utils/StatusCode");

class OrderController {

    async createOrder(req, res) {

        try {
          const { customerId, totalAmount } = req.body;

          //validate all fields
          if (!customerId || !totalAmount) {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "all fields are required",
            });
          }

          // Your order creation logic here
          const orderdata = new Order({
            customerId,
            totalAmount,
          });

          const data = await orderdata.save();

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Order created successfully.",
                data: data,
            });
        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
}





module.exports = new OrderController();