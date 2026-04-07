
const OrderItem = require("../models/orderItem");

const StatusCode = require("../utils/StatusCode");

class OrderItemController {

    async createOrderItem(req, res) {

        try {

            const { orderId, inventoryId, quantity, price } = req.body;

            //validate all fields
            if (!orderId || !inventoryId || !quantity || !price) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "all fields are required",
              });
            }

            // Your order creation logic here
            const orderdata = new OrderItem({
              orderId,
              inventoryId,
              quantity,
              price,
            });

            const data = await orderdata.save();

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "Order Item created successfully.",
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


module.exports = new OrderItemController();