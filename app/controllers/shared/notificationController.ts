import { ControllerResponseInterface } from "../../interfaces/responseInterface";
import { notificationsCollection } from "../../models/Notification";

type UserTypes = "customers" | "shops" | "admins";

export const notifications = async (userId: string, userType: UserTypes, page: number = 1, limit: number = 20): Promise<ControllerResponseInterface> => {
    try {

        const notifications = notificationsCollection.paginate({
            $or: [
                {userType: {$in: userId}},
                {userType: {$in: userType}},
                {userType: {$in: "all"}}
            ]
        }, {
            page, limit, sort: {updatedAt: -1}
        });
        
        return {
            result: notifications,
            status: 200
        };

    } catch (error: any) {
        return {
            result: null,
            status: error.status || 500,
            error,
          };
    }
}


