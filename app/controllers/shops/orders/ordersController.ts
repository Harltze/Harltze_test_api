import { ControllerResponseInterface } from "../../../interfaces/responseInterface";
import { orderCollection } from "../../../models/Orders";

export const pendingOrders = async (
  page: number,
  limit: number,
  orderStatusFilter: number,
  startDate?: string,
  endDate?: string
): Promise<ControllerResponseInterface> => {
  try {
    let query: any = {};

    query.orderStatus = "paid";

    if (orderStatusFilter != -5) {
      query.shippingStatus = orderStatusFilter;
    }

    if (startDate && endDate) {
      console.log("startDate, endDate", startDate, endDate);
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const pendingOrders = await orderCollection.paginate(query, {
      populate: [
        {
          path: "customerId",
          select: "firstName lastName phoneNumber email",
        },
      ],
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return {
      result: pendingOrders,
      status: 200,
    };
  } catch (error: any) {
    console.log(error);
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const shopPendingOrderById = async (orderId: string) => {
  try {
    const pendingOrders = await orderCollection
      .findById(orderId)
      .populate("customerId", "firstName lastName phoneNumber");

    return {
      result: pendingOrders,
      status: 200,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const updateShippingFee = async (
  shopId: string,
  orderId: string,
  shippingFee: number
): Promise<ControllerResponseInterface> => {
  try {
    const updatedProduct = await orderCollection.findByIdAndUpdate(
      orderId,
      {
        shippingFee: shippingFee * 100,
        orderStatus: "shipping-fee-updated",
      },
      { new: true }
    );

    return {
      result: updatedProduct,
      status: 200,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};

export const orderHistory = async (
  page: number = 1,
  limit: number = 20,
  startDate?: string,
  endDate?: string
): Promise<ControllerResponseInterface> => {
  try {

    let query: any = {
      orderStatus: "paid",
        shippingStatus: { $gte: 6 }
    };

    if (startDate && endDate) {
      console.log("startDate, endDate", startDate, endDate);
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const orders = await orderCollection.paginate(
      query,
      {
        page,
        limit,
        populate: [
          {
            path: "customerId",
            select: "firstName lastName phoneNumber email",
          },
        ],
        sort: { updatedAt: -1 },
      }
    );

    return {
      result: orders,
      status: 200,
    };
  } catch (error: any) {
    return {
      result: null,
      status: error.status || 500,
      error,
    };
  }
};
