
const PaymentItem = require("../models/payment");

const StatusCode = require("../utils/StatusCode");

class PaymentController {

    async createPayment(req, res) {

      try {

        const { orderId, paymentMethod, amount } = req.body;

        //validate all fields
        if (!orderId || !paymentMethod || !amount) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "all fields are required",
          });
        }

        // Your order creation logic here
        const paymentdata = new PaymentItem({
          orderId,
          paymentMethod,
          amount,
        });

        const data = await paymentdata.save();

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Payment created successfully.",
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

module.exports = new PaymentController();