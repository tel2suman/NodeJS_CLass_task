
const express = require("express");

const LookupController = require("../controllers/LookupController");

const router = express.Router();

//1. Fetch all users with their orders.
router.get("/customer/all/orders", LookupController.allCustomersByOrders);

//2. Get all orders with user details (name, email).
router.get("/customer/orders", LookupController.getOrdersWithCustomers);

//3. Find users who have placed at least one order.
router.get("/customer/one/orders", LookupController.CustomerWithOneOrders);

//4. Find users who have never placed any order.
router.get("/customer/without/orders", LookupController.CustomerWithoutOrders);

//5. Fetch orders along with their order items.
router.get("/all/order/orderitems", LookupController.ordersWithOrderItems);

//6. Get order details with product information
router.get("/order/with/productinfo", LookupController.getOrderDetailsWithProductInfo);

//7. Fetch full order summary
router.get("/all/order/summary", LookupController.getFullOrderSummary);

//8. Get orders with payments and show payment status
router.get("/order/with/payments", LookupController.getOrdersWithPaymentStatus);

//9. Find orders where payment is not completed
router.get("/order/without/payments", LookupController.getOrdersWithoutPaymentStatus);

//10. Fetch users with their latest order only
router.get("/customer/latest/orders", LookupController.customerWithLatestOrder);

//11. Calculate total revenue from all orders
router.get("/revenue/from/orders", LookupController.getTotalRevenueFromOrders);

//12. Count total number of orders per user
router.get("/total/number/orders", LookupController.getOrderCountPerCustomer);

// 13. Find average order value per user
router.get("/avg/order/value", LookupController.getAvgOrderValueByCustomer);

//14. Get maximum order amount
router.get("/max/order/amount", LookupController.getMaximumOrderAmount);

//15. Group orders by status and count them
router.get("/order/status/count", LookupController.getOrderCountByStatus);

//16. Calculate monthly revenue
router.get("/monthly/revenue/calculate", LookupController.getMonthlyRevenue);

//17. Find top 5 users based on total spending
router.get("/top/spending/customers", LookupController.topFiveUsersBySpending);

//18. Count products sold per category
router.get("/top/spending/customers", LookupController.GetProductSoldPerCategory);

//19. Find duplicate users based on email
router.get("/all/duplicate/users", LookupController.findDuplicateCustomers);

//20. Get total quantity sold per product
router.get("/total/quantity/sold", LookupController.getTotalQuantitySoldPerProduct);

//21. Join users and orders → calculate total spending per user
router.get("/total/spending/customer", LookupController.getCustomerTotalSpending);

//22. Find users who spent more than ₹50,000
router.get("/high/value/customer", LookupController.getHighValueCustomers);

//23. Get top-selling products
router.get("/top/selling/products", LookupController.getTopSellingInventories);

//24. Find average order value per category
router.get("/avg/order/value", LookupController.avgOrderValuePerCategory);

//25. Get total revenue per user with user details
router.get("/total/revenue/customer", LookupController.totalRevenuePerCustomerWithDetails);

//26. find Customers who placed more than 3 orders
router.get("/order/placed/customer", LookupController.getFrequentCustomers);

//27. Get daily revenue report
router.get("/all/revenue/report", LookupController.getDailyRevenueReport);

//28. Join orders + payments → calculate total paid amount.
router.get("/all/total/amount", LookupController.allTotalPaymentAmount);

//29. Find products that were never ordered
router.get("/product/never/ordered", LookupController.getProductNeverOrdered);

//30. Build Dashboard using $facet
router.get("/all/product/dashboard", LookupController.getDashboardStats);

module.exports = router;